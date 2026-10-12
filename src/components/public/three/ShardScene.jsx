import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { SVGLoader } from "three-stdlib";
import { BufferGeometry, Float32BufferAttribute, MathUtils, ShapeUtils, Vector3 } from "three";
import logoSvg from "../../../assets/pfp.svg?raw";
import { scrollProgress } from "./scroll.js";

const BURGUNDY = "#6d001a";
const CHUNKS = 56;
const SUBDIVISIONS = 2;
const HEIGHT = 5; // the assembled A, in world units
const DEPTH = 0.5;

/** A small deterministic random, so the shards fall the same way on every visit. */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const key = (p) => `${p.x.toFixed(4)},${p.y.toFixed(4)}`;
const edgeKey = (a, b) => {
  const ka = key(a);
  const kb = key(b);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
};
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const area = ([a, b, c]) => (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);

/** The A's outline, triangulated and finely subdivided, every triangle counter-clockwise. */
function logoTriangles() {
  const { paths } = new SVGLoader().parse(logoSvg.replaceAll("var(--logo-color, white)", "white"));
  let triangles = [];
  for (const shape of paths.flatMap((path) => SVGLoader.createShapes(path))) {
    const { shape: contour, holes } = shape.extractPoints(6);
    const points = contour.concat(...holes).map((p) => ({ x: p.x, y: -p.y })); // SVG y points down
    for (const [a, b, c] of ShapeUtils.triangulateShape(contour, holes)) {
      const tri = [points[a], points[b], points[c]];
      triangles.push(area(tri) < 0 ? [tri[0], tri[2], tri[1]] : tri);
    }
  }
  for (let level = 0; level < SUBDIVISIONS; level++) {
    triangles = triangles.flatMap(([a, b, c]) => {
      const ab = mid(a, b);
      const bc = mid(b, c);
      const ca = mid(c, a);
      return [
        [a, ab, ca],
        [ab, b, bc],
        [ca, bc, c],
        [ab, bc, ca],
      ];
    });
  }

  // Centre on the origin and scale to HEIGHT.
  const ys = triangles.flat().map((p) => p.y);
  const xs = triangles.flat().map((p) => p.x);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const scale = HEIGHT / (Math.max(...ys) - Math.min(...ys));
  const seen = new Map();
  const norm = (p) => {
    const k = key(p);
    if (!seen.has(k)) seen.set(k, { x: (p.x - cx) * scale, y: (p.y - cy) * scale });
    return seen.get(k);
  };
  return triangles.map((tri) => tri.map(norm));
}

/** Groups triangles into CHUNKS pieces by nearest centre (a few rounds of k-means). */
function cluster(triangles, rand) {
  const centroids = triangles.map(([a, b, c]) => ({ x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 }));
  let centres = Array.from({ length: CHUNKS }, () => ({ ...centroids[Math.floor(rand() * centroids.length)] }));
  let owner = new Array(triangles.length).fill(0);
  for (let round = 0; round < 8; round++) {
    owner = centroids.map((p) => {
      let best = 0;
      let bestD = Infinity;
      centres.forEach((c, i) => {
        const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    });
    centres = centres.map((c, i) => {
      const mine = centroids.filter((_, t) => owner[t] === i);
      if (!mine.length) return c;
      return { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length };
    });
  }
  return owner;
}

/**
 * Splits the A into stone shards. Each shard is a solid: a top and bottom face
 * plus walls along its edges. Walls on the A's own outline are stone; walls
 * along a break between shards are the inside of the crack, flat burgundy
 * (unlit, so it is exactly the brand colour).
 */
function shatter() {
  const rand = seeded(11);
  const triangles = logoTriangles();
  const owner = cluster(triangles, rand);

  const uses = new Map();
  triangles.forEach(([a, b, c]) => {
    for (const [p, q] of [[a, b], [b, c], [c, a]]) uses.set(edgeKey(p, q), (uses.get(edgeKey(p, q)) ?? 0) + 1);
  });

  const top = DEPTH / 2;
  const shards = [];
  for (let id = 0; id < CHUNKS; id++) {
    const mine = triangles.filter((_, t) => owner[t] === id);
    if (!mine.length) continue;

    const inChunk = new Map();
    mine.forEach(([a, b, c]) => {
      for (const [p, q] of [[a, b], [b, c], [c, a]]) inChunk.set(edgeKey(p, q), (inChunk.get(edgeKey(p, q)) ?? 0) + 1);
    });

    const centre = mine.flat().reduce((s, p) => ({ x: s.x + p.x, y: s.y + p.y }), { x: 0, y: 0 });
    centre.x /= mine.length * 3;
    centre.y /= mine.length * 3;

    const stone = [];
    const crack = [];
    const v = (p, z) => [p.x - centre.x, p.y - centre.y, z];
    for (const [a, b, c] of mine) {
      stone.push(...v(a, top), ...v(b, top), ...v(c, top));
      stone.push(...v(a, -top), ...v(c, -top), ...v(b, -top));
      for (const [p, q] of [[a, b], [b, c], [c, a]]) {
        const k = edgeKey(p, q);
        if (inChunk.get(k) > 1) continue; // inside this shard
        const wall = [...v(p, -top), ...v(q, -top), ...v(q, top), ...v(p, -top), ...v(q, top), ...v(p, top)];
        (uses.get(k) > 1 ? crack : stone).push(...wall);
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute([...stone, ...crack], 3));
    geometry.computeVertexNormals();
    geometry.addGroup(0, stone.length / 3, 0);
    geometry.addGroup(stone.length / 3, crack.length / 3, 1);

    const out = new Vector3(centre.x, centre.y, 0).normalize();
    shards.push({
      geometry,
      home: new Vector3(centre.x, centre.y, 0),
      scatter: new Vector3(
        out.x * (0.8 + rand() * 1.8) + (rand() - 0.5) * 1.4,
        out.y * (0.6 + rand() * 1.4) + (rand() - 0.5) * 1.4,
        -2 + rand() * 5,
      ),
      axis: new Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
      spin: (rand() - 0.5) * 4.4,
      delay: rand(),
      phase: rand() * Math.PI * 2,
    });
  }
  return shards;
}

const ease = (t) => 1 - Math.pow(1 - t, 3);

/**
 * The shards. `progressRef.current` runs 0 → 1 as the frame opens; the pieces
 * drift apart at the start and pull together into the solid A by about three
 * quarters of the way, each on its own slight delay. The whole A leans toward
 * the pointer.
 */
function Shards({ progressRef, pointer, calm }) {
  const shards = useMemo(() => shatter(), []);
  const group = useRef();
  const meshes = useRef([]);
  // On a wide screen the A stands right of centre, leaving the left for the
  // heading; on a tall one it rises above the heading, shrunk to fit across.
  const aspect = useThree((s) => s.size.width / s.size.height);
  const wide = aspect > 1.1;

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const assembled = calm ? 1 : MathUtils.smoothstep(progressRef.current, 0.3, 0.74);
    shards.forEach((s, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const local = ease(MathUtils.clamp((assembled - s.delay * 0.35) / 0.65, 0, 1));
      const apart = 1 - local;
      mesh.position.copy(s.home).addScaledVector(s.scatter, apart);
      if (!calm) mesh.position.y += Math.sin(t * 0.6 + s.phase) * 0.12 * apart;
      mesh.quaternion.setFromAxisAngle(s.axis, s.spin * apart + (calm ? 0 : Math.sin(t * 0.4 + s.phase) * 0.3 * apart));
    });
    if (calm) return;
    const g = group.current;
    g.rotation.y = MathUtils.damp(g.rotation.y, pointer.current.x * 0.45 + Math.sin(t * 0.25) * 0.08, 2.5, dt);
    g.rotation.x = MathUtils.damp(g.rotation.x, -pointer.current.y * 0.3, 2.5, dt);
  });

  return (
    <group ref={group} position={wide ? [1.8, 0.1, 0] : [0, 0.9, 0]} scale={Math.min(1, aspect * 1.29)}>
      {shards.map((s, i) => (
        <mesh key={i} ref={(m) => (meshes.current[i] = m)} geometry={s.geometry}>
          <meshStandardMaterial attach="material-0" color="#e8e8e8" roughness={0.62} metalness={0.04} />
          <meshBasicMaterial attach="material-1" color={BURGUNDY} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The frame's scene: the A in stone shards on black. It reads the pointer from
 * the frame element and its progress from the scroll position of `sectionRef`,
 * and renders only while the frame is open and on screen.
 */
export default function ShardScene({ sectionRef, frameRef }) {
  const wrapper = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const progressRef = useMemo(() => ({ get current() { return scrollProgress(sectionRef.current); } }), [sectionRef]);
  const [onScreen, setOnScreen] = useState(true);
  const [open, setOpen] = useState(false);
  const calm = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const lite = useMemo(() => window.matchMedia("(pointer: coarse), (max-width: 767px)").matches, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || calm) return;
    const onMove = (e) => {
      const box = frame.getBoundingClientRect();
      pointer.current.x = MathUtils.clamp(((e.clientX - box.left) / box.width) * 2 - 1, -1, 1);
      pointer.current.y = MathUtils.clamp(-(((e.clientY - box.top) / box.height) * 2 - 1), -1, 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [frameRef, calm]);

  // The frame is a sliver at the very top of the scroll, so wait for it to open.
  useEffect(() => {
    const check = () => setOpen(progressRef.current > 0.01);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [progressRef]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(wrapper.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="shards" aria-hidden="true">
      <Canvas
        frameloop={onScreen && open ? "always" : "never"}
        dpr={lite ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 0, 11], fov: 35 }}
        gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[-4, 6, 8]} intensity={2.2} />
        <directionalLight position={[5, -2, -6]} intensity={3} color={BURGUNDY} />
        <Shards progressRef={progressRef} pointer={pointer} calm={calm} />
        <Environment resolution={64} frames={1}>
          <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 5, 4]} scale={[10, 2, 1]} />
          <Lightformer form="rect" intensity={2.5} color={BURGUNDY} position={[6, 0, -2]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
