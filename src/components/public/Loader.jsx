import { useEffect, useRef, useState } from "react";
import logo from "../../assets/pfp.svg";
import { circuitPaths } from "./circuitPaths.js";
import "./Loader.css";

const MIN_MS = 900;
const MAX_MS = 4500;
const EXIT_MS = 2100;
// How far the bar may creep before the thing it is waiting for actually arrives.
const STAGE = { start: 0.08, documentReady: 0.7, done: 1 };

// The logo is the A, the same way the header wordmark reads.
const LETTERS = ["R", "C", "H", "I", "T"];
const TRACES = circuitPaths();

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Opening screen: the name drops in over a hairline track that fills as the page
 * and the 3D scene load. On the way out, circuit traces are cut through the black
 * panel and widen until the hero underneath is fully visible.
 */
export default function Loader({ ready }) {
  const [phase, setPhase] = useState("loading");
  const [minElapsed, setMinElapsed] = useState(false);
  const barRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    if (phase !== "loading") return;
    const min = setTimeout(() => setMinElapsed(true), MIN_MS);
    const max = setTimeout(() => setPhase("exiting"), MAX_MS);
    return () => {
      clearTimeout(min);
      clearTimeout(max);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "loading" && ready && minElapsed) setPhase("exiting");
  }, [phase, ready, minElapsed]);

  // The bar eases towards whatever has actually finished, so it never sits at a
  // number that means nothing.
  useEffect(() => {
    if (phase === "done") return;
    let value = 0;
    let frame = 0;

    const target = () => {
      if (phase === "exiting" || ready) return STAGE.done;
      return document.readyState === "complete" ? STAGE.documentReady : STAGE.start;
    };

    const paint = () => {
      value += (target() - value) * (prefersReducedMotion() ? 1 : 0.045);
      if (barRef.current) barRef.current.style.transform = `scaleX(${value.toFixed(4)})`;
      if (countRef.current) countRef.current.textContent = String(Math.round(value * 100));
      frame = requestAnimationFrame(paint);
    };

    frame = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(frame);
  }, [phase, ready]);

  useEffect(() => {
    if (phase !== "exiting") return;
    const t = setTimeout(() => setPhase("done"), EXIT_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div className={`loader ${phase === "exiting" ? "is-exiting" : ""}`} role="status" aria-live="polite">
      <div className="loader__stage" aria-hidden="true">
        <div className="loader__word">
          <span className="loader__letter" style={{ "--i": 0 }}>
            <img className="loader__mark" src={logo} alt="" />
          </span>
          {LETTERS.map((letter, i) => (
            <span key={letter} className="loader__letter" style={{ "--i": i + 1 }}>
              {letter}
            </span>
          ))}
        </div>

        <div className="loader__track">
          <span ref={barRef} className="loader__bar" />
        </div>
        <p className="loader__count">
          <span ref={countRef}>0</span>
        </p>
      </div>
      {/* The black panel itself, with the circuit cut out of it: everything drawn
          black inside the mask becomes a window onto the hero underneath. */}
      <svg
        className="loader__panel"
        viewBox="0 0 160 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <mask id="loader-cut" maskUnits="userSpaceOnUse" x="-20" y="-20" width="200" height="140">
            <rect x="-20" y="-20" width="200" height="140" fill="#ffffff" />
            <g className="loader__cuts">
              {TRACES.map((trace, i) => (
                <g key={i} style={{ "--i": i }}>
                  <path className="loader__trace" d={trace.d} pathLength="1" />
                  {trace.pads.map((pad, j) => (
                    <circle key={j} className="loader__pad" cx={pad.x} cy={pad.y} r="1.1" />
                  ))}
                </g>
              ))}
            </g>
            <circle className="loader__wipe" cx="80" cy="50" r="0" fill="#000000" />
          </mask>
        </defs>
        <rect x="-20" y="-20" width="200" height="140" fill="#0b0b0d" mask="url(#loader-cut)" />
      </svg>

      <p className="visually-hidden">Loading Archit Jain's portfolio</p>
    </div>
  );
}
