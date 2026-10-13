import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CanvasTexture, Color, DoubleSide, MathUtils, PlaneGeometry, SRGBColorSpace, ShaderChunk, TextureLoader, Vector3 } from "three";
import { hasScreenshot } from "../Work.jsx";
import { scrollProgress } from "./scroll.js";
import { LOOP, PATH, pathPosition } from "./spiralPath.js";
import { getTheme } from "../../../hooks/useTheme.js";

const PANEL_W = 2.3;
const PANEL_H = 1.5;
const MIN_PANELS = 8;

/** A panel bent round the loop, so it bulges toward you at the front. */
function bentPanel() {
  const geometry = new PlaneGeometry(PANEL_W, PANEL_H, 24, 1);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const theta = position.getX(i) / LOOP;
    position.setX(i, LOOP * Math.sin(theta));
    position.setZ(i, -LOOP * (1 - Math.cos(theta)));
  }
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Panels on the sides and back of the loop are seen from behind, where the
 * picture would show mirrored. There the image is read right to left instead,
 * so each panel shows it the right way round on both faces. (1 - x mirrors
 * within the crop because cover() always centres it.)
 */
function bothSides(shader) {
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <map_fragment>",
    ShaderChunk.map_fragment.replace("texture2D( map, vMapUv )", "texture2D( map, gl_FrontFacing ? vMapUv : vec2( 1.0 - vMapUv.x, vMapUv.y ) )"),
  );
}

/** Crops a texture to fill the panel without stretching (like object-fit: cover). */
function cover(texture) {
  const image = texture.image;
  const imageAspect = image.width / image.height;
  const panelAspect = PANEL_W / PANEL_H;
  if (imageAspect > panelAspect) {
    texture.repeat.set(panelAspect / imageAspect, 1);
    texture.offset.set((1 - texture.repeat.x) / 2, 0);
  } else {
    texture.repeat.set(1, imageAspect / panelAspect);
    texture.offset.set(0, (1 - texture.repeat.y) / 2);
  }
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
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

  return cover(new CanvasTexture(canvas));
}

function screenshotTexture(url) {
  return new TextureLoader().loadAsync(url).then(cover);
}

const point = new Vector3();
const tangent = new Vector3();
const shade = new Color();

/**
 * The panels on their spiral (see spiralPath.js). Scroll moves every panel
 * along the path, each a fixed step behind the one before; the pointer leans
 * the whole loop a touch. Under reduced motion it holds still at mid-scroll.
 */
function Spiral({ projects, sectionRef, calm }) {
  const [textures, setTextures] = useState(null);
  const geometry = useMemo(() => bentPanel(), []);
  const group = useRef();
  const meshes = useRef([]);
  const progress = useRef(0);
  const count = Math.max(projects.length, MIN_PANELS);
  const aspect = useThree((s) => s.size.width / s.size.height);

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
    if (!g) return; // still loading the images
    const target = scrollProgress(sectionRef.current);
    progress.current = calm ? 0.5 : MathUtils.damp(progress.current, target, 6, dt);
    const p = progress.current;
    const day = getTheme() === "light";

    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;
      const u = pathPosition(i, p, count);
      if (u <= 0 || u >= 1) {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;
      PATH.getPointAt(u, point);
      PATH.getTangentAt(u, tangent);
      mesh.position.copy(point);
      // The panel's face points out of the loop: its width runs along the path.
      mesh.rotation.set(0, Math.atan2(-tangent.z, tangent.x), 0);
      const fade = MathUtils.smoothstep(u, 0, 0.06) * (1 - MathUtils.smoothstep(u, 0.94, 1));
      // Further back recedes into the page, so the loop reads as depth: darker
      // at night, paler (more see-through) by day.
      const near = MathUtils.clamp((point.z + LOOP) / (2 * LOOP), 0, 1);
      mesh.material.opacity = fade * (day ? 0.3 + 0.7 * near : 1);
      mesh.material.color.copy(shade.setScalar(day ? 1 : 0.38 + 0.62 * near));
    });

    // Narrow screens shrink the loop to fit across them, but only so far: on a
    // phone its sides run off the edges so the panels stay big enough to read.
    g.scale.setScalar(Math.min(1, Math.max(aspect / 1.1, 0.6)));
    if (calm) return;
    g.rotation.y = MathUtils.damp(g.rotation.y, state.pointer.x * 0.12, 3, dt);
    g.rotation.x = MathUtils.damp(g.rotation.x, -state.pointer.y * 0.06, 3, dt);
  });

  // Wait for every image: a material compiled without its map and given one
  // later renders as a blank white panel.
  if (!projects.length || !textures) return null;
  return (
    <group ref={group}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={(m) => (meshes.current[i] = m)} geometry={geometry} visible={false}>
          <meshBasicMaterial
            map={textures[i % projects.length]}
            color="#ffffff"
            side={DoubleSide}
            // One pass, so gl_FrontFacing tells the faces apart (see bothSides).
            forceSinglePass
            onBeforeCompile={bothSides}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The project wall: covers (or screenshots) that come in from the left, loop
 * once round the line in the middle of the screen and leave to the right as
 * you scroll. It renders only while on screen.
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
        camera={{ position: [0, 0, 12], fov: lite ? 50 : 40 }}
        gl={{ antialias: !lite, alpha: true }}
      >
        <Spiral projects={projects} sectionRef={sectionRef} calm={calm} />
      </Canvas>
    </div>
  );
}
