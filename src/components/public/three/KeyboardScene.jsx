import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PresentationControls, RoundedBox } from "@react-three/drei";
import { CanvasTexture, MathUtils, SRGBColorSpace } from "three";
import { getSkillIcon } from "../../../data/iconMap.js";
import { layoutKeys } from "./keyLayout.js";

const GAP = 0.14;
const CAP_HEIGHT = 0.34;
const TRAVEL = 0.14;

/** Palette values straight from the CSS tokens, so a palette change reaches the scene. */
function token(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** A keycap legend, drawn once to a canvas: the skill name and its brand colour. */
function makeLegend(text, units, { cap, ink, mark }) {
  const h = 256;
  const w = 256 * units;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = cap;
  ctx.fillRect(0, 0, w, h);

  let size = 64;
  const font = (s) => `600 ${s}px "Instrument Sans", system-ui, sans-serif`;
  ctx.font = font(size);
  while (ctx.measureText(text).width > w * 0.8 && size > 32) {
    size -= 4;
    ctx.font = font(size);
  }
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2 - 8);
  if (mark) {
    ctx.fillStyle = mark;
    ctx.fillRect(w / 2 - 32, h * 0.72, 64, 8);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function Key({ index, x, z, w, legend, cap, glow, pressedAt, onPress, onTouch }) {
  const group = useRef();
  const material = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, dt) => {
    const since = state.clock.elapsedTime - pressedAt.current[index];
    const down = hovered || since < 0.16;
    group.current.position.y = MathUtils.damp(group.current.position.y, down ? -TRAVEL : 0, 22, dt);
    material.current.emissiveIntensity = MathUtils.damp(material.current.emissiveIntensity, since < 0.32 ? 0.7 : 0, 9, dt);
  });

  return (
    <group ref={group} position={[x, 0, z]}>
      <RoundedBox
        args={[w - GAP, CAP_HEIGHT, 1 - GAP]}
        radius={0.1}
        smoothness={4}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onTouch();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPress(index, true);
        }}
      >
        <meshStandardMaterial ref={material} color={cap} emissive={glow} emissiveIntensity={0} roughness={0.5} metalness={0.05} />
      </RoundedBox>
      <mesh position={[0, CAP_HEIGHT / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - GAP - 0.2, 1 - GAP - 0.2]} />
        <meshBasicMaterial map={legend} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Board({ skills, legends, layout, palette, reducedMotion, visibleRef, onSayHi, onKeyPress }) {
  const clock = useThree((s) => s.clock);
  const count = layout.keys.length;
  const hiKey = count - 1;
  const pressedAt = useRef(new Array(count).fill(-10));
  const lastTouch = useRef(-10);
  const nextAuto = useRef(1.5);

  const touch = useCallback(() => {
    lastTouch.current = clock.elapsedTime;
  }, [clock]);

  const press = useCallback(
    (i, byUser) => {
      pressedAt.current[i] = clock.elapsedTime;
      if (!byUser) return;
      lastTouch.current = clock.elapsedTime;
      if (i === hiKey) onSayHi?.();
      else onKeyPress?.(i);
    },
    [clock, hiKey, onSayHi, onKeyPress],
  );

  // Idle, it types to itself. Any hover or press pauses that for a few seconds.
  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (t - lastTouch.current < 3 || t < nextAuto.current) return;
    press(Math.floor(Math.random() * hiKey), false);
    nextAuto.current = t + 0.3 + Math.random() * 0.5;
  });

  // Typing the first letter of a skill on a real keyboard presses its key.
  useEffect(() => {
    const onKey = (e) => {
      if (!visibleRef.current || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      const i = skills.findIndex((s) => s.name.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) press(i, true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skills, press, visibleRef]);

  return (
    <group rotation={[0, -0.1, 0]}>
      {/* The case the keys sit in, in the card colour. */}
      <RoundedBox args={[layout.width + 0.56, 0.3, layout.rows + 0.56]} radius={0.16} smoothness={4} position={[0, -0.26, 0]}>
        <meshStandardMaterial color={palette.case} roughness={0.6} metalness={0.1} />
      </RoundedBox>
      {layout.keys.map((k, i) => (
        <Key
          key={i}
          index={i}
          x={k.x}
          z={k.z}
          w={k.w}
          legend={legends[i]}
          cap={i === hiKey ? palette.ink : palette.cap}
          glow={i === hiKey ? palette.case : palette.accent}
          pressedAt={pressedAt}
          onPress={press}
          onTouch={touch}
        />
      ))}
    </group>
  );
}

/**
 * The skills, as a mechanical keyboard you can play with: one keycap per skill,
 * pressed by pointer or by typing its first letter, tilted by dragging, and a
 * white "Say hi" key that jumps to the contact form. The canvas is decorative;
 * the same skills are listed in the markup beside it.
 */
export default function KeyboardScene({ skills, onSayHi, onKeyPress }) {
  const wrapper = useRef(null);
  const visibleRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [legends, setLegends] = useState(null);

  const { coarse, reducedMotion, lite } = useMemo(() => {
    const mq = (q) => window.matchMedia(q).matches;
    const isCoarse = mq("(pointer: coarse)");
    return {
      coarse: isCoarse,
      lite: isCoarse || mq("(max-width: 767px)") || (navigator.hardwareConcurrency ?? 8) <= 4,
      reducedMotion: mq("(prefers-reduced-motion: reduce)"),
    };
  }, []);

  const palette = useMemo(
    () => ({
      cap: token("--base-2", "#0d0d0d"),
      case: token("--accent-fill", "#6d001a"),
      accent: token("--accent", "#6d001a"),
      ink: token("--ink", "#ffffff"),
    }),
    [],
  );

  const layout = useMemo(() => layoutKeys(skills.length), [skills.length]);

  // Legends are drawn once Instrument Sans has loaded, so the canvas uses the real face.
  useEffect(() => {
    let cancelled = false;
    let made = [];
    const fontReady = document.fonts?.load('600 64px "Instrument Sans"') ?? Promise.resolve();
    fontReady
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        made = layout.keys.map((k, i) =>
          i < skills.length
            ? makeLegend(skills[i].name, k.w, { cap: palette.cap, ink: palette.ink, mark: getSkillIcon(skills[i].icon).color })
            : makeLegend("Say hi", k.w, { cap: palette.ink, ink: palette.case }),
        );
        setLegends(made);
      });
    return () => {
      cancelled = true;
      made.forEach((t) => t.dispose());
    };
  }, [skills, layout, palette]);

  // Only render while on screen.
  useEffect(() => {
    const el = wrapper.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      setVisible(entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="keyboard-scene">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={lite ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 5.8, 5.1], fov: 30 }}
        onCreated={({ camera }) => camera.lookAt(0, -0.2, 0)}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-hidden="true"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 8, 4]} intensity={1.3} />
        <pointLight position={[-4, 3, 2]} intensity={10} color={palette.accent} />
        {legends && (
          <PresentationControls
            enabled={!coarse}
            cursor={false}
            snap
            speed={1.2}
            polar={[-0.2, 0.3]}
            azimuth={[-0.6, 0.6]}
          >
            <Board
              skills={skills}
              legends={legends}
              layout={layout}
              palette={palette}
              reducedMotion={reducedMotion}
              visibleRef={visibleRef}
              onSayHi={onSayHi}
              onKeyPress={onKeyPress}
            />
          </PresentationControls>
        )}
        <ContactShadows position={[0, -0.42, 0]} opacity={0.55} scale={12} blur={2.4} far={2} color="#000000" />
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 5, -2]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={1.6} color={palette.accent} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
