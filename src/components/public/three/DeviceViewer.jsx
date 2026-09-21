import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  PresentationControls,
  RoundedBox,
} from "@react-three/drei";
import { Object3D } from "three";
import { createScreenTexture } from "./screenTexture.js";

/** Which body a project renders on, from its own tech row. */
const PHONE_TECH = new Set(["flutter", "dart", "swift", "kotlin", "react native"]);

export function platformFor(project) {
  if (project?.platform === "phone" || project?.platform === "laptop") return project.platform;
  const tech = (project?.tech ?? []).map((t) => t.trim().toLowerCase());
  return tech.some((t) => PHONE_TECH.has(t)) ? "phone" : "laptop";
}

function ShellMaterial() {
  return <meshPhysicalMaterial color="#101013" metalness={0.55} roughness={0.32} clearcoat={0.8} clearcoatRoughness={0.22} envMapIntensity={1.15} />;
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

/** The key deck, drawn as one instanced mesh so the detail costs one draw call. */
function Keys() {
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
      <meshStandardMaterial color="#55565c" emissive="#c9ced6" emissiveIntensity={0.06} roughness={0.38} metalness={0.08} />
    </instancedMesh>
  );
}

function Laptop({ screen }) {
  return (
    <group position={[0, 0.1, 0]} scale={0.92}>
      <RoundedBox args={[3.2, 0.12, 2.1]} radius={0.05} smoothness={4} position={[0, -0.95, 0]}>
        <ShellMaterial />
      </RoundedBox>
      <mesh position={[0, -0.898, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.78, 0.92]} />
        <meshBasicMaterial color="#050506" toneMapped={false} />
      </mesh>
      <Keys />
      <mesh position={[0, -0.893, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.06, 0.62]} />
        <meshBasicMaterial color="#141418" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.9, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.055, 3.1, 20]} />
        <meshStandardMaterial color="#b4b6bc" metalness={0.85} roughness={0.25} />
      </mesh>
      <group position={[0, -0.9, -1.02]} rotation={[-0.22, 0, 0]}>
        <RoundedBox args={[3.2, 2.05, 0.08]} radius={0.04} smoothness={4} position={[0, 1.02, 0]}>
          <ShellMaterial />
        </RoundedBox>
        <mesh position={[0, 1.02, 0.038]}>
          <planeGeometry args={[3.08, 1.94]} />
          <meshBasicMaterial color="#000000" toneMapped={false} />
        </mesh>
        <Screen texture={screen} width={3.0} height={1.86} position={[0, 1.0, 0.042]} />
      </group>
    </group>
  );
}

function Phone({ screen }) {
  return (
    <group position={[0, -0.1, 0]} rotation={[0.03, -0.25, 0]} scale={1.45}>
      <RoundedBox args={[0.95, 1.95, 0.09]} radius={0.12} smoothness={6}>
        <MeshTransmissionMaterial
          color="#eeeff2"
          samples={4}
          resolution={512}
          transmission={1}
          thickness={0.22}
          roughness={0.07}
          ior={1.22}
          chromaticAberration={0.05}
          clearcoat={1}
        />
      </RoundedBox>
      <Screen texture={screen} width={0.84} height={1.8} position={[0, 0, 0.051]} />
    </group>
  );
}

/**
 * The project device viewer. This is the 3D moved out of the hero, where it
 * was decoration beside the name, and into the one place it does real work:
 * showing what a project actually looked like running, on the device it ships
 * on. A Flutter app renders on a phone, a Shopify or Next.js build on a
 * laptop, and the screen carries the project's own screenshot.
 */
export default function DeviceViewer({ project }) {
  const wrapper = useRef(null);
  const [visible, setVisible] = useState(true);
  const [screen, setScreen] = useState(null);

  const { coarse, reducedMotion, lite } = useMemo(() => {
    const mq = (q) => typeof window !== "undefined" && window.matchMedia(q).matches;
    const isCoarse = mq("(pointer: coarse)");
    return {
      coarse: isCoarse,
      lite: isCoarse || mq("(max-width: 767px)") || (navigator.hardwareConcurrency ?? 8) <= 4,
      reducedMotion: mq("(prefers-reduced-motion: reduce)"),
    };
  }, []);

  const platform = platformFor(project);

  useEffect(() => {
    let cancelled = false;
    let made = null;
    createScreenTexture(project, { portrait: platform === "phone" }).then((texture) => {
      made = texture;
      if (cancelled) {
        texture.dispose();
        return;
      }
      setScreen(texture);
    });
    return () => {
      cancelled = true;
      made?.dispose();
    };
  }, [project, platform]);

  // Stop rendering while off screen to save battery.
  useEffect(() => {
    const el = wrapper.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "100px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const device = platform === "phone" ? <Phone screen={screen} /> : <Laptop screen={screen} />;

  return (
    <div ref={wrapper} className="device-viewer" data-draggable={!coarse}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={lite ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 0.3, 6.1], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-hidden="true"
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 6, 5]} intensity={1.3} />
        <pointLight position={[-4, 1, 3]} intensity={16} color="#c9ced6" />
        {coarse || reducedMotion ? (
          <group rotation={[0.1, -0.3, 0]}>{device}</group>
        ) : (
          <PresentationControls global cursor snap speed={1.3} polar={[-0.22, 0.22]} azimuth={[-0.6, 0.6]}>
            <group rotation={[0.1, -0.3, 0]}>{device}</group>
          </PresentationControls>
        )}
        <ContactShadows position={[0, -1.7, 0]} opacity={0.4} scale={9} blur={2.6} far={3} color="#000000" />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 4, -2]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={2.4} color="#c9ced6" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
          <Lightformer form="rect" intensity={2} color="#9aa1aa" position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
