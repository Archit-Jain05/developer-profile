import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
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
const CENTRE = new Vector3(0, 0.5, -1.5); // where the A sits; the shards swirl round it

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
    return { edges: new EdgesGeometry(geometry, 24) };
  }, []);
}

/**
 * The A, as a wireframe. It behaves like a magnet for the pointer: it turns to
 * face it and leans toward it, settling with a little give, and its edges
 * brighten while the pointer is moving.
 */
function Logo({ state, calm }) {
  const group = useRef();
  const lines = useRef();
  const { edges } = useLogoGeometry();

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const s = state.current;
    const energy = Math.min(1, Math.hypot(s.vx, s.vy) * 12 + Math.abs(s.swirl) * 0.4);
    s.glow = MathUtils.damp(s.glow, s.inside ? energy : 0, 4, dt);
    lines.current.opacity = 0.28 + s.glow * 0.5;

    if (calm) return;
    const drift = Math.sin(t * 0.3) * 0.12;
    const g = group.current;
    g.rotation.y = MathUtils.damp(g.rotation.y, drift + s.px * 0.75, 3, dt);
    g.rotation.x = MathUtils.damp(g.rotation.x, -s.py * 0.45, 3, dt);
    g.rotation.z = MathUtils.damp(g.rotation.z, -s.px * 0.08, 3, dt);
    g.position.x = MathUtils.damp(g.position.x, s.px * 0.45, 2.5, dt);
    g.position.y = MathUtils.damp(g.position.y, CENTRE.y + s.py * 0.3 + Math.sin(t * 0.6) * 0.08, 2.5, dt);
  });

  return (
    <group ref={group} position={CENTRE.toArray()}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={lines} color="#ffffff" transparent opacity={0.28} />
      </lineSegments>
    </group>
  );
}

/** The long orbital lines that cross the whole hero, turning slowly. */
function Orbits({ calm }) {
  const group = useRef();
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

  useFrame(({ clock }) => {
    if (!calm) group.current.rotation.z = clock.elapsedTime * 0.02;
  });

  return (
    <group ref={group} position={[0, 0, -4]}>
      {rings.map((ring, i) => (
        <lineLoop key={i} geometry={ring.geometry} rotation={[ring.tiltX, 0, ring.tiltZ]}>
          <lineBasicMaterial color="#ffffff" transparent opacity={i === 0 ? 0.1 : 0.08} />
        </lineLoop>
      ))}
    </group>
  );
}

/**
 * The shards and streaks around the A. Each piece has a home it springs back to.
 * Moving the pointer round the A sets the whole field swirling round it in the
 * same direction; the pointer also nudges aside any piece right under it
 * (measured in screen space, so far-back pieces react as readily as near ones).
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
    // A portrait screen sees a narrow slice of the field, so each piece fills
    // far more of it; shrink them so they read as shards, not slabs.
    const fit = Math.min(1, Math.max(0.45, aspect / 1.2));

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
          if (s.swirl !== 0) {
            // Push along the circle through this piece, centred on the A.
            const rx = p.pos.x - CENTRE.x;
            const ry = p.pos.y - CENTRE.y;
            const r = Math.max(0.8, Math.hypot(rx, ry));
            p.vel.x += (-ry / r) * s.swirl * 9 * dt;
            p.vel.y += (rx / r) * s.swirl * 9 * dt;
          }
          p.vel.addScaledVector(p.home.clone().sub(p.pos), HOME_SPRING * dt);
          p.vel.multiplyScalar(keep);
          p.pos.addScaledVector(p.vel, dt);
          p.rot.addScaledVector(p.spin, dt * (1 + p.vel.length() * 0.8));
          p.spin.multiplyScalar(0.995);
        }
        dummy.position.copy(p.pos);
        dummy.rotation.set(p.rot.x, p.rot.y, p.rot.z);
        dummy.scale.copy(p.size).multiplyScalar(fit);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    step(pieces.shards, shards.current);
    step(pieces.streaks, lines.current);
    s.swirl *= Math.pow(0.94, dt * 60);
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
 * The hero background: the A as a 3D wireframe among drifting shards, light
 * streaks and long orbital lines. The A turns and leans toward the pointer like
 * a magnet, and circling the pointer round it sets the shards swirling.
 *
 * The canvas takes no pointer events; it reads the pointer from the window, so
 * the buttons and links over it keep working.
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
    swirl: 0, // how fast the field turns round the A, signed
    glow: 0,
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
    let lastMove = performance.now();

    const onMove = (e) => {
      const box = stage.getBoundingClientRect();
      const px = ((e.clientX - box.left) / box.width) * 2 - 1;
      const py = -(((e.clientY - box.top) / box.height) * 2 - 1);
      const now = performance.now();
      const dt = Math.max(8, now - lastMove) / 1000;
      lastMove = now;
      const dx = px - s.px;
      const dy = py - s.py;
      // Pointer velocity in screen units per frame, for the nudge and the glow.
      s.vx = MathUtils.clamp((dx / dt) * 0.016, -0.2, 0.2);
      s.vy = MathUtils.clamp((dy / dt) * 0.016, -0.2, 0.2);
      // How far the pointer turned round the centre of the hero on this move;
      // it winds the swirl up in that direction.
      const turn = (s.px * dy - s.py * dx) / (s.px * s.px + s.py * s.py + 0.15);
      s.swirl = MathUtils.clamp(s.swirl + turn * 1.6, -1.2, 1.2);
      s.px = px;
      s.py = py;
      s.inside = e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
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
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 5, 6]} intensity={0.8} />
        <Orbits calm={env.calm} />
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
