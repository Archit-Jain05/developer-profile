import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CanvasTexture, Color, MathUtils, PlaneGeometry, SRGBColorSpace } from "three";
import logoUrl from "../../../assets/pfp.svg";
import { hasScreenshot } from "../Work.jsx";
import { scrollProgress } from "./scroll.js";
import { useTheme } from "../../../hooks/useTheme.js";

/*
 * A floor of tiles seen from above at an angle, each showing one of the sites
 * Archit has built, fading out toward the edges, with his A on a raised tile
 * in the middle. Only real screenshots are used (a project without one gets no
 * tile, and the screenshots repeat across the floor, so there are no blanks).
 */
const REACH = 3; // tiles each way from the middle
const PITCH_X = 2.75; // distance between tile centres
const PITCH_Z = 1.95;
const TILE_W = 2.5; // landscape, like the screenshots
const TILE_H = 1.65;
const W = 512;
const H = 338;

const load = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

/** A whole screenshot (never cropped), rounded, on a card. */
function tileTexture(image, card) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const pad = 12;
  ctx.fillStyle = card;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 36);
  ctx.fill();
  // Fit the whole image inside the card, centred.
  const scale = Math.min((W - pad * 2) / image.width, (H - pad * 2) / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect((W - w) / 2, (H - h) / 2, w, h, 26);
  ctx.clip();
  ctx.drawImage(image, (W - w) / 2, (H - h) / 2, w, h);
  ctx.restore();
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** The A mark, drawn white on a transparent square, for the raised tile. */
function markTexture(image) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const h = 150;
  const w = (image.width / image.height) * h;
  ctx.drawImage(image, (256 - w) / 2, (256 - h) / 2, w, h);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

const CELLS = [];
for (let i = -REACH; i <= REACH; i++) {
  for (let j = -REACH; j <= REACH; j++) {
    const d = Math.hypot(i, j);
    if (d > 0 && d <= REACH + 0.9) CELLS.push({ i, j, d });
  }
}

const base = new Color();

function Floor({ projects, progressRef, pointer, calm, theme }) {
  const [textures, setTextures] = useState(null);
  const [mark, setMark] = useState(null);
  const geometry = useMemo(() => new PlaneGeometry(TILE_W, TILE_H), []);
  const group = useRef();
  const tiles = useRef([]);
  const hovered = useRef(-1);
  const heroLift = useRef(0);
  const lift = useRef(new Float32Array(CELLS.length));
  const hero = useRef();
  const aspect = useThree((s) => s.size.width / s.size.height);
  const camera = useThree((s) => s.camera);
  const wide = aspect > 1.1;
  const dark = theme === "dark";
  const urls = useMemo(() => [...new Set(projects.filter(hasScreenshot).map((p) => p.image_url))], [projects]);

  useEffect(() => {
    camera.position.set(0, 8.5, 9);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    let alive = true;
    const card = dark ? "#262626" : "#ffffff";
    Promise.all(urls.map((u) => load(u).then((img) => tileTexture(img, card)).catch(() => null))).then((list) => {
      const ok = list.filter(Boolean);
      if (alive) setTextures(ok);
    });
    load(logoUrl).then((img) => alive && setMark(markTexture(img))).catch(() => {});
    return () => {
      alive = false;
    };
  }, [urls, dark]);

  useEffect(() => () => textures?.forEach((t) => t.dispose()), [textures]);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    tiles.current.forEach((mesh, n) => {
      if (!mesh) return;
      const { d } = CELLS[n];
      const arrive = calm ? 1 : MathUtils.smoothstep(t, d * 0.12, d * 0.12 + 0.7);
      const fade = 1 - MathUtils.smoothstep(d, REACH - 0.6, REACH + 0.9);
      // A tile rises under the pointer, and settles back when it leaves.
      lift.current[n] = MathUtils.damp(lift.current[n], hovered.current === n ? 0.6 : 0, 7, dt);
      mesh.position.y = (calm ? 0 : Math.sin(t * 0.9 - d * 0.8) * 0.07 + (1 - arrive) * -0.6) + lift.current[n];
      mesh.material.opacity = fade * arrive;
      mesh.scale.setScalar((0.85 + 0.15 * arrive) * (1 + lift.current[n] * 0.12));
    });
    // The logo tile lies in the floor like the rest and rises only when pointed at.
    heroLift.current = MathUtils.damp(heroLift.current, hovered.current === -2 ? 0.7 : 0, 7, dt);
    if (hero.current) hero.current.position.y = heroLift.current + (calm ? 0 : Math.sin(t * 0.9) * 0.07);
    if (calm) return;
    g.rotation.y = MathUtils.damp(g.rotation.y, Math.PI * 0.75 + pointer.current.x * 0.18 + progressRef.current * 0.5, 3, dt);
  });

  if (!textures?.length) return null;
  return (
    <group ref={group} position={wide ? [2.4, -0.3, 0] : [0, -0.4, 0]} scale={wide ? 1 : Math.min(1, aspect * 1.5)} rotation={[0, Math.PI * 0.75, 0]}>
      {CELLS.map(({ i, j }, n) => (
        <mesh
          key={`${i},${j}`}
          ref={(m) => (tiles.current[n] = m)}
          geometry={geometry}
          position={[i * PITCH_X, 0, j * PITCH_Z]}
          rotation={[-Math.PI / 2, 0, Math.PI]}
          onPointerOver={(e) => {
            e.stopPropagation();
            hovered.current = n;
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            if (hovered.current === n) hovered.current = -1;
            document.body.style.cursor = "";
          }}
        >
          <meshBasicMaterial map={textures[(((i * 2 + j * 3) % textures.length) + textures.length) % textures.length]} transparent opacity={0} toneMapped={false} />
        </mesh>
      ))}
      <group
        ref={hero}
        position={[0, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = -2;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          if (hovered.current === -2) hovered.current = -1;
          document.body.style.cursor = "";
        }}
      >
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[TILE_W, 0.16, TILE_H]} />
          <meshStandardMaterial color="#0b0b0b" roughness={0.4} metalness={0.1} />
        </mesh>
        {mark && (
          <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, Math.PI]}>
            <planeGeometry args={[1.1, 1.1]} />
            <meshBasicMaterial map={mark} transparent toneMapped={false} />
          </mesh>
        )}
      </group>
    </group>
  );
}

/**
 * The frame's scene: a floor of tiles showing the sites Archit has built, his
 * A raised in the middle. Plain textured quads, no lights but one, so it is
 * light to compile and draw; it mounts as soon as the page is idle and
 * renders only while on screen.
 */
export default function TileFloor({ sectionRef, frameRef, projects }) {
  const wrapper = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const progressRef = useMemo(() => ({ get current() { return scrollProgress(sectionRef.current); } }), [sectionRef]);
  const [onScreen, setOnScreen] = useState(true);
  const theme = useTheme();
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

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(wrapper.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="shards" aria-hidden="true">
      <Canvas
        frameloop={onScreen ? "always" : "never"}
        dpr={lite ? [1, 1.25] : [1, 1.5]}
        camera={{ position: [0, 8.5, 9], fov: 35 }}
        gl={{ antialias: !lite, alpha: true }}
      >
        <ambientLight intensity={1.3} />
        <directionalLight position={[-3, 6, 4]} intensity={2} />
        <Floor projects={projects} progressRef={progressRef} pointer={pointer} calm={calm} theme={theme} />
      </Canvas>
    </div>
  );
}
