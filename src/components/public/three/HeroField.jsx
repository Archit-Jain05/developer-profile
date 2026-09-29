import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Line } from "@react-three/drei";
import { SVGLoader } from "three-stdlib";
import {
  AdditiveBlending,
  BufferGeometry,
  EdgesGeometry,
  EllipseCurve,
  ExtrudeGeometry,
  MathUtils,
  Object3D,
  Vector3,
} from "three";
import logoSvg from "../../../assets/pfp.svg?raw";

const BURGUNDY = "#6d001a";
const HOME_SPRING = 2.2; // how hard a shard is pulled back to where it lives
const DRAG = 0.93; // velocity kept per frame at 60fps
const SOLID_FOR = 6; // seconds the A stays solid after a strike
const BOLTS = 5;
const BOLT_STEPS = 14;

/** A small deterministic random, so the field looks the same on every visit. */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** The A, extruded into 3D from the same SVG the nav uses. */
function useLogoGeometry() {
  return useMemo(() => {
    // The SVG colours itself with a CSS variable, which three cannot parse; the
    // colour is not used here, only the outlines.
    const { paths } = new SVGLoader().parse(logoSvg.replaceAll("var(--logo-color, white)", "white"));
    const shapes = paths.flatMap((path) => SVGLoader.createShapes(path));
    const geometry = new ExtrudeGeometry(shapes, {
      depth: 36,
      bevelEnabled: true,
      bevelThickness: 4,
      bevelSize: 3,
      bevelSegments: 2,
      curveSegments: 6,
    });
    geometry.center();
    geometry.rotateX(Math.PI); // SVG y points down
    geometry.scale(0.0105, 0.0105, 0.0105);
    geometry.computeBoundingBox();
    return { geometry, edges: new EdgesGeometry(geometry, 24), box: geometry.boundingBox };
  }, []);
}

/** One jagged bolt between two random points on (or just past) the logo. */
function makeBolt(box) {
  const size = box.getSize(new Vector3());
  const pick = () =>
    new Vector3(box.min.x - 0.5 + Math.random() * (size.x + 1), box.min.y - 0.5 + Math.random() * (size.y + 1), box.max.z + 0.1);
  const from = pick();
  const to = pick();
  return Array.from({ length: BOLT_STEPS + 1 }, (_, i) => {
    const p = from.clone().lerp(to, i / BOLT_STEPS);
    if (i > 0 && i < BOLT_STEPS) p.add(new Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.2));
    return p;
  });
}

/**
 * Lightning over the A for a moment after a strike: a few jagged bolts, redrawn
 * every few frames so they flicker. Drawn with drei's Line, which gives real
 * line widths (plain WebGL lines are always 1px): a white core over a wider
 * burgundy glow.
 */
function Lightning({ box, state }) {
  const [bolts, setBolts] = useState([]);
  const last = useRef(0);
  const live = useRef(false);

  useFrame(({ clock }) => {
    const age = clock.elapsedTime - state.current.struck;
    if (age < 0 || age > 0.9) {
      if (live.current) {
        live.current = false;
        setBolts([]);
      }
      return;
    }
    live.current = true;
    if (clock.elapsedTime - last.current < 0.06) return;
    last.current = clock.elapsedTime;
    setBolts(Array.from({ length: BOLTS }, () => makeBolt(box)));
  });

  return bolts.map((points, i) => (
    <group key={i}>
      <Line points={points} color={BURGUNDY} lineWidth={10} transparent opacity={0.7} toneMapped={false} />
      <Line points={points} color="#ffffff" lineWidth={2.4} toneMapped={false} />
    </group>
  ));
}

/**
 * The A. At rest it is a wireframe — outline edges only, see-through. Holding
 * turns it and brightens the edges; letting go strikes it: it snaps solid,
 * glossy and dark, with lightning across it, then fades back to a wireframe.
 */
function Logo({ state, calm }) {
  const group = useRef();
  const glass = useRef();
  const lines = useRef();
  const flash = useRef();
  const solid = useRef(0);
  const { geometry, edges, box } = useLogoGeometry();

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const s = state.current;
    const c = s.charge;

    // Solid for a while after a strike, then back to wireframe.
    const target = t < s.solidUntil ? 1 : 0;
    solid.current = MathUtils.damp(solid.current, target, target ? 9 : 1.2, dt);
    glass.current.opacity = solid.current * 0.96;
    glass.current.depthWrite = solid.current > 0.5;
    lines.current.opacity = MathUtils.damp(lines.current.opacity, 0.28 + c * 0.6 - solid.current * 0.18, 6, dt);
    flash.current.intensity = MathUtils.damp(flash.current.intensity, t - s.struck < 0.4 ? 120 : 0, 10, dt);

    if (calm) return;
    // Charging turns the A to a new angle; released, it swings back.
    const turn = c * 0.9 + Math.sin(t * 0.3) * 0.12 + s.px * 0.3;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, turn, c > 0 ? 3 : 4, dt);
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, -s.py * 0.18 - c * 0.3, 4, dt);
    group.current.position.y = Math.sin(t * 0.6) * 0.08;
    group.current.position.x = c > 0 ? (Math.random() - 0.5) * 0.05 * c : MathUtils.damp(group.current.position.x, 0, 8, dt);
  });

  return (
    <group ref={group} position={[0, 0.5, -1.5]}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          ref={glass}
          color="#0d0d0d"
          metalness={0.9}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.06}
          envMapIntensity={1.8}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={lines} color="#ffffff" transparent opacity={0.28} />
      </lineSegments>
      <Lightning box={box} state={state} />
      <pointLight ref={flash} color="#ffffff" intensity={0} distance={10} position={[0, 0, 1.2]} />
    </group>
  );
}

/** The long orbital lines that cross the whole hero, turning slowly. */
function Orbits({ state, calm }) {
  const group = useRef();
  const material = useRef();
  const rings = useMemo(
    () =>
      [
        [15, 5.2, 0.35, -0.2],
        [12, 4.2, -0.25, 0.3],
        [18, 7.5, 0.1, 0.9],
      ].map(([rx, ry, tiltX, tiltZ]) => {
        const points = new EllipseCurve(0, 0, rx, ry, 0, Math.PI * 2).getPoints(160).map((p) => new Vector3(p.x, p.y, 0));
        return { geometry: new BufferGeometry().setFromPoints(points), tiltX, tiltZ };
      }),
    [],
  );

  useFrame(({ clock }, dt) => {
    if (!calm) group.current.rotation.z = clock.elapsedTime * 0.02;
    material.current.opacity = MathUtils.damp(material.current.opacity, 0.1 + state.current.charge * 0.3, 5, dt);
  });

  return (
    <group ref={group} position={[0, 0, -4]}>
      {rings.map((ring, i) => (
        <lineLoop key={i} geometry={ring.geometry} rotation={[ring.tiltX, 0, ring.tiltZ]}>
          {i === 0 ? (
            <lineBasicMaterial ref={material} color="#ffffff" transparent opacity={0.1} />
          ) : (
            <lineBasicMaterial color="#ffffff" transparent opacity={0.08} />
          )}
        </lineLoop>
      ))}
    </group>
  );
}

/**
 * The shards and streaks around the A. Each piece has a home it springs back to.
 * The pointer repels any piece that is under it on screen — measured in screen
 * space, so pieces far behind the A react as readily as those in front — and a
 * quick sweep of the pointer drags pieces along with it. A strike throws them
 * all outward.
 */
function Debris({ count, streaks, state, calm }) {
  const shards = useRef();
  const lines = useRef();
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const dummy = useMemo(() => new Object3D(), []);
  const screen = useMemo(() => new Vector3(), []);

  const pieces = useMemo(() => {
    const rand = seeded(7);
    const make = (n, streak) =>
      Array.from({ length: n }, () => {
        const angle = rand() * Math.PI * 2;
        const radius = 2.6 + rand() * 6.5;
        const home = new Vector3(Math.cos(angle) * radius * 1.4, (rand() - 0.5) * 8, -6 + rand() * 7);
        return {
          home,
          pos: home.clone(),
          vel: new Vector3(),
          rot: new Vector3(rand() * 6, rand() * 6, rand() * 6),
          spin: new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.6),
          size: streak ? new Vector3(0.012, 0.6 + rand() * 1.8, 0.012) : new Vector3(0.03, 0.4 + rand() * 1.4, 0.2 + rand() * 0.5),
        };
      });
    return { shards: make(count, false), streaks: make(streaks, true) };
  }, [count, streaks]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const s = state.current;
    const keep = Math.pow(DRAG, dt * 60);
    const aspect = size.width / size.height;
    const REACH = 0.3; // in screen units, where the viewport is 2 tall

    const step = (list, mesh) => {
      list.forEach((p, i) => {
        if (!calm) {
          // Distance to the pointer as it appears on screen.
          screen.copy(p.pos).project(camera);
          const dx = (screen.x - s.px) * aspect;
          const dy = screen.y - s.py;
          const d = Math.hypot(dx, dy);
          // Pieces further from the camera need to travel further in the world
          // to move the same distance on screen.
          const depth = camera.position.distanceTo(p.pos) / 9;
          if (s.inside && d < REACH && d > 1e-4) {
            const push = ((REACH - d) / REACH) * 22 * depth * dt;
            p.vel.x += (dx / d) * push;
            p.vel.y += (dy / d) * push;
            // Sweeping the pointer through the field drags pieces with it.
            p.vel.x += s.vx * aspect * 1.6 * depth * (1 - d / REACH);
            p.vel.y += s.vy * 1.6 * depth * (1 - d / REACH);
            p.spin.z += (Math.random() - 0.5) * 0.2;
          }
          if (s.blast > 0) {
            const out = p.pos.clone().sub(s.origin);
            const dist = Math.max(0.6, out.length());
            p.vel.addScaledVector(out.normalize(), (s.blast * 26) / Math.sqrt(dist));
          }
          p.vel.addScaledVector(p.home.clone().sub(p.pos), HOME_SPRING * dt);
          p.vel.multiplyScalar(keep);
          p.pos.addScaledVector(p.vel, dt);
          p.rot.addScaledVector(p.spin, dt * (1 + p.vel.length() * 0.8));
          p.spin.multiplyScalar(0.995);
        }
        dummy.position.copy(p.pos);
        dummy.rotation.set(p.rot.x, p.rot.y, p.rot.z);
        dummy.scale.copy(p.size);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    step(pieces.shards, shards.current);
    step(pieces.streaks, lines.current);
    s.blast = 0;
    s.vx *= 0.8;
    s.vy *= 0.8;
  });

  return (
    <>
      <instancedMesh ref={shards} args={[undefined, undefined, pieces.shards.length]}>
        <boxGeometry />
        <meshPhysicalMaterial color="#0f0f0f" metalness={0.7} roughness={0.3} clearcoat={1} transparent opacity={0.85} />
      </instancedMesh>
      <instancedMesh ref={lines} args={[undefined, undefined, pieces.streaks.length]}>
        <boxGeometry />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.28} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

/** A burgundy light on the pointer, and a camera that leans with it. */
function PointerRig({ state }) {
  const light = useRef();
  const camera = useThree((s) => s.camera);
  const target = useMemo(() => new Vector3(), []);

  useFrame((_, dt) => {
    const s = state.current;
    target.set(s.px, s.py, 0.5).unproject(camera);
    const dir = target.sub(camera.position).normalize();
    const t = -camera.position.z / dir.z;
    light.current.position.copy(camera.position).addScaledVector(dir, t).setZ(1.4);
    light.current.intensity = MathUtils.damp(light.current.intensity, s.inside ? 60 : 12, 4, dt);
    camera.position.x = MathUtils.damp(camera.position.x, s.px * 0.4, 2, dt);
    camera.position.y = MathUtils.damp(camera.position.y, s.py * 0.25, 2, dt);
    camera.lookAt(0, 0, -1.5);
  });

  return <pointLight ref={light} color={BURGUNDY} intensity={12} distance={8} />;
}

/**
 * The hero background, after the reference the site owner chose (trionn.com):
 * the A as a 3D wireframe among drifting shards, light streaks and long orbital
 * lines. Move through it and the pieces part. Press and hold: the hero tilts
 * and the A turns as it charges. Let go: the hero snaps back, the A strikes
 * solid with lightning across it, and the shards blow outward.
 *
 * The canvas takes no pointer events; input comes from the hero stage, so the
 * buttons and links over it keep working.
 */
export default function HeroField({ stageRef }) {
  const wrapper = useRef(null);
  const [visible, setVisible] = useState(true);
  const state = useRef({
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    inside: false,
    down: false,
    charge: 0,
    blast: 0,
    struck: -10,
    solidUntil: 0,
    origin: new Vector3(0, 0, -1.5),
  });

  const env = useMemo(() => {
    const mq = (q) => window.matchMedia(q).matches;
    const lite = mq("(pointer: coarse)") || mq("(max-width: 767px)") || (navigator.hardwareConcurrency ?? 8) <= 4;
    return { lite, calm: mq("(prefers-reduced-motion: reduce)") };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || env.calm) return;
    const s = state.current;
    let frame = 0;
    let lastMove = performance.now();

    const locate = (e) => {
      const box = stage.getBoundingClientRect();
      const px = ((e.clientX - box.left) / box.width) * 2 - 1;
      const py = -(((e.clientY - box.top) / box.height) * 2 - 1);
      const now = performance.now();
      const dt = Math.max(8, now - lastMove) / 1000;
      // Pointer velocity in screen units per frame, for the sweep.
      s.vx = MathUtils.clamp(((px - s.px) / dt) * 0.016, -0.2, 0.2);
      s.vy = MathUtils.clamp(((py - s.py) / dt) * 0.016, -0.2, 0.2);
      lastMove = now;
      s.px = px;
      s.py = py;
      s.inside = e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom;
    };
    const tick = () => {
      if (!s.down) return;
      s.charge = Math.min(1, s.charge + 1 / 72);
      stage.style.setProperty("--charge", s.charge.toFixed(3));
      frame = requestAnimationFrame(tick);
    };
    const onMove = (e) => locate(e);
    const onDown = (e) => {
      if (e.button !== 0 || e.target.closest("a, button")) return;
      locate(e);
      s.down = true;
      stage.dataset.charging = "";
      tick();
    };
    const release = (strike) => () => {
      if (!s.down) return;
      s.down = false;
      cancelAnimationFrame(frame);
      delete stage.dataset.charging;
      stage.style.setProperty("--charge", "0");
      if (strike) {
        const now = performance.now() / 1000;
        s.blast = Math.max(0.3, s.charge);
        // The canvas clock starts at mount; convert through the frame loop.
        s.strikeAt = now;
      }
      s.charge = 0;
    };
    const onUp = release(true);
    const onCancel = release(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("blur", onCancel);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("blur", onCancel);
    };
  }, [stageRef, env.calm]);

  useEffect(() => {
    const el = wrapper.current;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="hero__field" aria-hidden="true">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={env.lite ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 0, 9], fov: 40 }}
        gl={{ antialias: !env.lite, alpha: true, powerPreference: "high-performance" }}
      >
        <StrikeClock state={state} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 5, 6]} intensity={0.8} />
        <Orbits state={state} calm={env.calm} />
        <Logo state={state} calm={env.calm} />
        <Debris count={env.lite ? 48 : 90} streaks={env.lite ? 14 : 28} state={state} calm={env.calm} />
        <PointerRig state={state} />
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 5, -2]} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={3} color={BURGUNDY} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
          <Lightformer form="rect" intensity={1.8} color="#9aa1aa" position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

/**
 * Turns a strike signalled from a DOM event into the canvas's own clock, which
 * the logo and the lightning time themselves against.
 */
function StrikeClock({ state }) {
  useFrame(({ clock }) => {
    const s = state.current;
    if (s.strikeAt) {
      s.struck = clock.elapsedTime;
      s.solidUntil = clock.elapsedTime + SOLID_FOR;
      s.strikeAt = 0;
    }
  });
  return null;
}
