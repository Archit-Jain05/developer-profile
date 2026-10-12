import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CanvasTexture, DoubleSide, MathUtils, PlaneGeometry, SRGBColorSpace, TextureLoader } from "three";
import { hasScreenshot } from "../Work.jsx";
import { scrollProgress } from "./scroll.js";

const RADIUS = 7.5;
const PANEL_W = 3.2;
const PANEL_H = 2.1;
const PANELS = 14;
const HEIGHTS = [0.9, -0.8, 0.25, -1.2, 1.25, -0.25, 0.6];

/** A panel bent to sit on the inside of a cylinder around the camera. */
function bentPanel() {
  const geometry = new PlaneGeometry(PANEL_W, PANEL_H, 32, 1);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const theta = position.getX(i) / RADIUS;
    position.setX(i, RADIUS * Math.sin(theta));
    position.setZ(i, RADIUS * (1 - Math.cos(theta)));
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** A cover for a project with no screenshot yet: its name and stack under the burgundy light. */
async function coverTexture(project) {
  await document.fonts.load('500 120px "Inter"');
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 672;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const light = ctx.createRadialGradient(512, 760, 0, 512, 760, 640);
  light.addColorStop(0, "rgba(109, 0, 26, 1)");
  light.addColorStop(0.45, "rgba(109, 0, 26, 0.55)");
  light.addColorStop(1, "rgba(109, 0, 26, 0)");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = '500 120px "Inter", sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "-6px";
  ctx.fillText(project.title, 64, 200, canvas.width - 128);

  ctx.fillStyle = "#d0d0d0";
  ctx.font = '400 32px "Inter", sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  ctx.fillText(project.tech?.join(", ") ?? "", 64, 600, canvas.width - 128);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function screenshotTexture(url) {
  return new TextureLoader().loadAsync(url).then((texture) => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  });
}

/** The ring of panels. Scrolling turns it; the pointer leans it a touch. */
function Ring({ projects, sectionRef, calm }) {
  const [textures, setTextures] = useState(null);
  const geometry = useMemo(() => bentPanel(), []);
  const group = useRef();

  useEffect(() => {
    let alive = true;
    Promise.all(projects.map((p) => (hasScreenshot(p) ? screenshotTexture(p.image_url).catch(() => coverTexture(p)) : coverTexture(p)))).then(
      (list) => alive && setTextures(list),
    );
    return () => {
      alive = false;
    };
  }, [projects]);

  useEffect(() => () => textures?.forEach((t) => t.dispose()), [textures]);

  useFrame((state, dt) => {
    const g = group.current;
    const turn = -0.5 + scrollProgress(sectionRef.current) * Math.PI * 1.1;
    if (calm) {
      g.rotation.y = 0.4;
      return;
    }
    g.rotation.y = MathUtils.damp(g.rotation.y, turn + state.pointer.x * 0.08, 4, dt);
    g.rotation.x = MathUtils.damp(g.rotation.x, -state.pointer.y * 0.04, 4, dt);
  });

  if (!projects.length) return null;
  return (
    <group ref={group}>
      {Array.from({ length: PANELS }, (_, i) => (
        <group key={i} rotation-y={(i / PANELS) * Math.PI * 2}>
          <mesh geometry={geometry} position={[0, HEIGHTS[i % HEIGHTS.length], -RADIUS]}>
            <meshBasicMaterial
              map={textures?.[i % projects.length] ?? null}
              color={textures ? "#ffffff" : "#1a1a1a"}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * The project wall: covers (or screenshots) on the inside of a slowly turning
 * cylinder, seen from its centre. It renders only while on screen.
 */
export default function ProjectWall({ projects, sectionRef }) {
  const wrapper = useRef(null);
  const [visible, setVisible] = useState(true);
  const calm = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  const lite = useMemo(() => window.matchMedia("(pointer: coarse), (max-width: 767px)").matches, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(wrapper.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="wall__scene" aria-hidden="true">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={lite ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 0, 0], fov: lite ? 70 : 55 }}
        gl={{ antialias: !lite, alpha: true }}
      >
        <Ring projects={projects} sectionRef={sectionRef} calm={calm} />
      </Canvas>
    </div>
  );
}
