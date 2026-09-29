import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { supportsWebGL } from "../../lib/webgl.js";
import SceneBoundary from "./SceneBoundary.jsx";

const HeroField = lazy(() => import("./three/HeroField.jsx"));
import "./Hero.css";

/** Layers drift against the pointer by different amounts, so the scene has depth. */
function usePointerDepth(ref) {
  useEffect(() => {
    const el = ref.current;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || !fine || calm) return;

    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--mx", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty("--my", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [ref]);
}

/**
 * The landing view: the first name as a wall of type, the portrait cut out and
 * standing in front of it, and the surname crossing in front of the portrait.
 * The hero stays pinned while the rest of the page slides up over it.
 */
export default function Hero({ profile }) {
  const stage = useRef(null);
  const [webgl, setWebgl] = useState(false);
  usePointerDepth(stage);

  useEffect(() => {
    setWebgl(supportsWebGL());
  }, []);

  const [first, ...rest] = (profile.full_name ?? "").split(" ");
  const last = rest.join(" ");

  return (
    <section id="home" className="hero">
      <div ref={stage} className="hero__stage">
        <div className="hero__light" aria-hidden="true" />
        {webgl && (
          <SceneBoundary fallback={null}>
            <Suspense fallback={null}>
              <HeroField stageRef={stage} />
            </Suspense>
          </SceneBoundary>
        )}

        <h1 className="hero__name">
          <span className="hero__first" aria-hidden="true">
            {first}
          </span>
          <span className="visually-hidden">{profile.full_name}</span>
        </h1>

        <div className="hero__person">
          <img
            className="hero__cutout"
            src={profile.hero_image_url || "/seed/archit-cutout.webp"}
            alt={profile.full_name} width="1171" height="1102" fetchPriority="high" draggable={false} />
        </div>

        {last && (
          <p className="hero__last" aria-hidden="true">
            {last}
          </p>
        )}

        <p className="hero__corner hero__hint" aria-hidden="true">
          Press and hold to charge the A, then let go.
        </p>

        <div className="hero__corner hero__corner--right">
          <p className="hero__tagline">{profile.tagline}</p>
          <a href="#projects" className="btn btn--primary">
            See projects
          </a>
          {profile.resume_url && (
            <a href={profile.resume_url} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
              <FiDownload aria-hidden="true" /> Download CV
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
