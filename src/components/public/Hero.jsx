import { useEffect, useLayoutEffect, useRef } from "react";
import { FiDownload } from "react-icons/fi";
import cutout from "../../assets/archit-cutout.webp";
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
 * One gradient across the whole word, though each letter is its own element
 * (so they can animate in one at a time): every letter is told where it sits
 * in the word and paints its own slice of a single word-wide gradient.
 */
function useWordGradient(ref, word) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const letters = [...el.children];
      if (letters.length === 0) return;
      const start = letters[0].offsetLeft;
      const end = letters.at(-1).offsetLeft + letters.at(-1).offsetWidth;
      el.style.setProperty("--word-w", `${end - start}px`);
      for (const letter of letters) letter.style.setProperty("--x", `${letter.offsetLeft - start}px`);
    };
    measure();
    document.fonts?.ready.then(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, word]);
}

/**
 * The landing view: the first name as a wall of type, the portrait cut out and
 * standing in front of it, and the surname crossing in front of the portrait.
 * The hero stays pinned while the rest of the page slides up over it.
 */
export default function Hero({ profile }) {
  const stage = useRef(null);
  const word = useRef(null);
  usePointerDepth(stage);

  const [first, ...rest] = (profile.full_name ?? "").split(" ");
  useWordGradient(word, first);
  const last = rest.join(" ");

  return (
    <section id="home" className="hero">
      <div ref={stage} className="hero__stage">
        <div className="hero__light" aria-hidden="true" />

        <h1 className="hero__name">
          <span ref={word} className="hero__first" aria-hidden="true">
            {[...first].map((letter, i) => (
              <span key={i} className="hero__letter" style={{ "--i": i }}>
                {letter}
              </span>
            ))}
          </span>
          <span className="visually-hidden">{profile.full_name}</span>
        </h1>

        <div className="hero__person">
          <img className="hero__cutout" src={cutout} alt={profile.full_name} width="1171" height="1102" fetchPriority="high" />
        </div>

        {last && (
          <p className="hero__last" aria-hidden="true">
            {last}
          </p>
        )}

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
