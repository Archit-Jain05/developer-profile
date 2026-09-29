import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  MeshTransmissionMaterial,
  PerspectiveCamera,
  PresentationControls,
  RoundedBox,
  View,
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

function Phone({ screen, lite }) {
  return (
    <group position={[0, -0.1, 0]} rotation={[0.03, -0.25, 0]} scale={1.45}>
      <RoundedBox args={[0.95, 1.95, 0.09]} radius={0.12} smoothness={6}>
        {lite ? (
          <meshPhysicalMaterial color="#c4c6cc" transparent opacity={0.42} roughness={0.08} clearcoat={1} depthWrite={false} />
        ) : (
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
        )}
      </RoundedBox>
      <Screen texture={screen} width={0.84} height={1.8} position={[0, 0, 0.051]} />
    </group>
  );
}

/** One project on the device it ships on, lit, turnable, gently floating. */
function DeviceScene({ project, lite, coarse, calm, accent }) {
  const platform = platformFor(project);
  const [screen, setScreen] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let made = null;
    createScreenTexture(project, { portrait: platform === "phone" }).then((texture) => {
      made = texture;
      if (cancelled) texture.dispose();
      else setScreen(texture);
    });
    return () => {
      cancelled = true;
      made?.dispose();
    };
  }, [project, platform]);

  const device = (
    <Float speed={calm ? 0 : 1.2} rotationIntensity={calm ? 0 : 0.15} floatIntensity={calm ? 0 : 0.35}>
      <group rotation={[0.1, -0.3, 0]}>
        {platform === "phone" ? <Phone screen={screen} lite={lite} /> : <Laptop screen={screen} />}
      </group>
    </Float>
  );

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.3, platform === "phone" ? 7.6 : 6.2]} fov={34} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 5]} intensity={1.3} />
      {/* A burgundy rim light, the same light that stands behind the portrait. */}
      <pointLight position={[-4, 1, 3]} intensity={18} color={accent} />
      {coarse ? (
        device
      ) : (
        <PresentationControls snap speed={1.3} polar={[-0.22, 0.22]} azimuth={[-0.6, 0.6]}>
          {device}
        </PresentationControls>
      )}
      <ContactShadows position={[0, -1.6, 0]} opacity={0.45} scale={9} blur={2.6} far={3} color="#000000" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 4, -2]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2.4} color={accent} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={2} color="#9aa1aa" position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
      </Environment>
    </>
  );
}

/**
 * The 3D for the horizontal projects gallery: every card's image area becomes
 * a drei View showing that project on the device it ships on — a Flutter app
 * on a phone, a Shopify or Next.js build on a laptop — with the project's own
 * screenshot on its screen.
 *
 * All the views share one canvas, so four devices cost about what one did. The
 * canvas is portalled to <body>, fixed over the viewport under the nav, and
 * draws only inside each card's rectangle; it stops rendering while the
 * section is off screen. The cards themselves are ordinary markup, so the
 * content is all there without WebGL.
 */
export default function ProjectDevices({ projects, rootRef }) {
  const [slots, setSlots] = useState([]);
  const [visible, setVisible] = useState(false);

  const env = useMemo(() => {
    const mq = (q) => window.matchMedia(q).matches;
    const coarse = mq("(pointer: coarse)");
    return {
      coarse,
      lite: coarse || mq("(max-width: 767px)") || (navigator.hardwareConcurrency ?? 8) <= 4,
      calm: mq("(prefers-reduced-motion: reduce)"),
      accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#6d001a",
    };
  }, []);

  useLayoutEffect(() => {
    setSlots([...rootRef.current.querySelectorAll("[data-device-slot]")]);
  }, [rootRef, projects]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "200px" });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [rootRef]);

  return (
    <>
      {slots.map((slot, i) =>
        projects[i]
          ? createPortal(
              <View className="hpanel__view">
                <DeviceScene project={projects[i]} {...env} />
              </View>,
              slot,
            )
          : null,
      )}
      {createPortal(
        <Canvas
          className="devices-canvas"
          eventSource={rootRef.current}
          eventPrefix="client"
          frameloop={visible ? "always" : "never"}
          dpr={env.lite ? [1, 1.5] : [1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          aria-hidden="true"
        >
          <View.Port />
        </Canvas>,
        document.body,
      )}
    </>
  );
}
