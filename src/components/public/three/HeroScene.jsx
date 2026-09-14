import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  MeshTransmissionMaterial,
  PresentationControls,
  RoundedBox,
} from "@react-three/drei";
import { AdditiveBlending, MathUtils, Object3D } from "three";
import { createGlowTexture, createScreenTexture } from "./screenTexture.js";

const GLASS_TINT = "#f2ece0";

function GlassMaterial({ lite }) {
  if (lite) {
    return (
      // Cheap tinted glass for phones: no transmission render pass.
      <meshPhysicalMaterial
        color="#cbb894"
        emissive="#c8a15a"
        emissiveIntensity={0.25}
        transparent
        opacity={0.42}
        roughness={0.08}
        metalness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.05}
        envMapIntensity={2}
        depthWrite={false}
      />
    );
  }
  return (
    <MeshTransmissionMaterial
      color={GLASS_TINT}
      samples={4}
      resolution={512}
      transmission={1}
      thickness={0.22}
      roughness={0.07}
      ior={1.22}
      chromaticAberration={0.07}
      attenuationColor="#e6d7b8"
      attenuationDistance={2.5}
      anisotropy={0.15}
      distortion={0.12}
      distortionScale={0.4}
      temporalDistortion={0.05}
      clearcoat={1}
      clearcoatRoughness={0.1}
      backside={false}
    />
  );
}

/** Solid, polished shell. Black reads as a real machine; glass let the page show through. */
function ShellMaterial({ lite }) {
  return (
    <meshPhysicalMaterial
      color="#101013"
      metalness={0.55}
      roughness={0.32}
      clearcoat={lite ? 0 : 0.8}
      clearcoatRoughness={0.22}
      envMapIntensity={1.15}
    />
  );
}

function Screen({ texture, width, height, position }) {
  if (!texture) return null;
  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

const KEY_ROWS = 5;
const KEY_COLS = 14;
const KEY_W = 0.15;
const KEY_D = 0.13;
const KEY_GAP = 0.038;

/** The key deck, drawn as one instanced mesh so the extra detail costs one draw call. */
function Keys({ lite }) {
  const ref = useRef();
  const count = KEY_ROWS * KEY_COLS;

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new Object3D();
    const spanX = KEY_COLS * (KEY_W + KEY_GAP) - KEY_GAP;
    const spanZ = KEY_ROWS * (KEY_D + KEY_GAP) - KEY_GAP;
    let i = 0;
    for (let row = 0; row < KEY_ROWS; row++) {
      for (let col = 0; col < KEY_COLS; col++) {
        dummy.position.set(
          -spanX / 2 + KEY_W / 2 + col * (KEY_W + KEY_GAP),
          0,
          -spanZ / 2 + KEY_D / 2 + row * (KEY_D + KEY_GAP),
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(i++, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} position={[0, -0.884, -0.2]}>
      <boxGeometry args={[KEY_W, 0.026, KEY_D]} />
      {/* Opaque: transparent keys let the rows behind show through, which reads as a second keyboard. */}
      <meshStandardMaterial
        color="#6e6a62"
        emissive="#c8a15a"
        emissiveIntensity={lite ? 0.3 : 0.18}
        roughness={0.38}
        metalness={0.08}
      />
    </instancedMesh>
  );
}

function Laptop({ screen, lite }) {
  return (
    <group position={[-0.35, -0.25, 0]}>
      <RoundedBox args={[3.2, 0.12, 2.1]} radius={0.05} smoothness={4} position={[0, -0.95, 0]}>
        <ShellMaterial lite={lite} />
      </RoundedBox>

      {/* Lit seam along the sides, so the black body still has an edge against the page */}
      {[-1.585, 1.585].map((x) => (
        <mesh key={x} position={[x, -0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.02, 0.02]} />
          <meshBasicMaterial color="#e0bd80" transparent opacity={0.5} toneMapped={false} />
        </mesh>
      ))}
      {/* Rubber feet */}
      {[-1.35, 1.35].map((x) =>
        [-0.8, 0.8].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -1.02, z]}>
            <cylinderGeometry args={[0.07, 0.07, 0.04, 12]} />
            <meshStandardMaterial color="#16161a" roughness={0.8} />
          </mesh>
        )),
      )}

      {/* Key well: a dark recess so the gaps between keys read as shadow */}
      <mesh position={[0, -0.898, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.78, 0.92]} />
        <meshBasicMaterial color="#0a0a0c" toneMapped={false} />
      </mesh>

      <Keys lite={lite} />

      {/* Trackpad: a recessed plate with a lit edge */}
      <mesh position={[0, -0.893, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.06, 0.62]} />
        <meshBasicMaterial color="#141418" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.892, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.98, 0.54]} />
        <meshBasicMaterial color="#e0bd80" transparent opacity={0.16} toneMapped={false} />
      </mesh>

      {/* Hinge barrel */}
      <mesh position={[0, -0.9, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 3.1, 20]} />
        <meshStandardMaterial color="#b9b3a6" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Lid hinged at the back edge */}
      <group position={[0, -0.9, -1.02]} rotation={[-0.26, 0, 0]}>
        <RoundedBox args={[3.2, 2.05, 0.08]} radius={0.04} smoothness={4} position={[0, 1.02, 0]}>
          <ShellMaterial lite={lite} />
        </RoundedBox>
        {/* Bezel behind the picture, with a camera dot above it */}
        <mesh position={[0, 1.02, 0.038]}>
          <planeGeometry args={[3.08, 1.94]} />
          <meshBasicMaterial color="#08080a" toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.98, 0.042]}>
          <circleGeometry args={[0.022, 16]} />
          <meshBasicMaterial color="#8d8a82" toneMapped={false} />
        </mesh>
        <Screen texture={screen} width={3.0} height={1.86} position={[0, 1.0, 0.042]} />
      </group>
    </group>
  );
}

function Phone({ screen, lite }) {
  return (
    <group position={[1.75, -0.35, 1.05]} rotation={[0.04, -0.5, 0.07]}>
      <RoundedBox args={[0.95, 1.95, 0.09]} radius={0.12} smoothness={6}>
        <GlassMaterial lite={lite} />
      </RoundedBox>
      <Screen texture={screen} width={0.84} height={1.8} position={[0, 0, 0.051]} />
    </group>
  );
}

function Glow() {
  const texture = useMemo(() => createGlowTexture(), []);
  return (
    <mesh position={[0.2, 0.1, -2.4]} scale={5.4}>
      <planeGeometry />
      <meshBasicMaterial map={texture} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** Turns and lifts the devices as the visitor scrolls past the hero. */
function ScrollRig({ children, reducedMotion }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const progress = reducedMotion ? 0 : MathUtils.clamp(window.scrollY / window.innerHeight, 0, 1);
    ref.current.rotation.y = MathUtils.lerp(ref.current.rotation.y, progress * 0.9, 0.08);
    ref.current.rotation.x = MathUtils.lerp(ref.current.rotation.x, progress * 0.25, 0.08);
    ref.current.position.y = MathUtils.lerp(ref.current.position.y, progress * 0.8, 0.08);
  });
  return <group ref={ref}>{children}</group>;
}

/** Calls onReady once the textures exist and a couple of frames have rendered. */
function ReadySignal({ ready, onReady }) {
  const frames = useRef(0);
  const sent = useRef(false);
  useFrame(() => {
    if (!ready || sent.current) return;
    frames.current += 1;
    if (frames.current > 2) {
      sent.current = true;
      onReady?.();
    }
  });
  return null;
}

export default function HeroScene({ projects = [], onReady }) {
  const wrapper = useRef(null);
  const [visible, setVisible] = useState(true);
  const [screens, setScreens] = useState({ laptop: null, phone: null });

  const { lite, coarse, reducedMotion } = useMemo(() => {
    const mq = (q) => typeof window !== "undefined" && window.matchMedia(q).matches;
    const isCoarse = mq("(pointer: coarse)");
    return {
      coarse: isCoarse,
      lite: isCoarse || mq("(max-width: 767px)") || (navigator.hardwareConcurrency ?? 8) <= 4,
      reducedMotion: mq("(prefers-reduced-motion: reduce)"),
    };
  }, []);

  const laptopProject = projects[0];
  const phoneProject = projects[1] ?? projects[0];

  useEffect(() => {
    let cancelled = false;
    let made = [];
    Promise.all([
      createScreenTexture(laptopProject),
      createScreenTexture(phoneProject, { portrait: true }),
    ]).then(([laptop, phone]) => {
      performance.mark?.("hero-textures-ready");
      made = [laptop, phone];
      if (cancelled) {
        made.forEach((t) => t.dispose());
        return;
      }
      setScreens({ laptop, phone });
    });
    return () => {
      cancelled = true;
      made.forEach((t) => t.dispose());
    };
  }, [laptopProject, phoneProject]);

  // Stop rendering while the hero is off screen to save battery.
  useEffect(() => {
    const el = wrapper.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "100px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const devices = (
    <Float
      speed={reducedMotion ? 0 : 1.3}
      rotationIntensity={reducedMotion ? 0 : 0.22}
      floatIntensity={reducedMotion ? 0 : 0.45}
    >
      <Laptop screen={screens.laptop} lite={lite} />
      <Phone screen={screens.phone} lite={lite} />
    </Float>
  );

  return (
    <div ref={wrapper} className="hero-scene" data-draggable={!coarse}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={lite ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 0.6, 8.2], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-hidden="true"
        onCreated={() => performance.mark?.("hero-canvas-created")}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 5]} intensity={1.4} color="#fff4e2" />
        <pointLight position={[-4, 1, 3]} intensity={18} color="#c8a15a" />
        <pointLight position={[4, -1, 2]} intensity={14} color="#8fa9b5" />
        <Glow />
        <ScrollRig reducedMotion={reducedMotion}>
          <group rotation={[0.12, -0.38, 0]}>
            {coarse ? (
              devices
            ) : (
              <PresentationControls
                global
                cursor
                snap
                speed={1.4}
                polar={[-0.35, 0.35]}
                azimuth={[-0.9, 0.9]}
              >
                {devices}
              </PresentationControls>
            )}
          </group>
        </ScrollRig>
        <ContactShadows position={[0, -1.75, 0]} opacity={0.45} scale={9} blur={2.6} far={3} color="#050506" />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 4, -2]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={2.5} color="#c8a15a" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
          <Lightformer form="rect" intensity={2} color="#8fa9b5" position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
          <Lightformer form="ring" intensity={2} color="#8fa9b5" position={[0, -3, 3]} scale={3} />
        </Environment>
        <ReadySignal ready={Boolean(screens.laptop)} onReady={onReady} />
      </Canvas>
      {!coarse && <p className="hero-scene__hint">Drag to turn the devices</p>}
    </div>
  );
}
