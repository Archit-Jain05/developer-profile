import { useEffect, useState } from "react";
import { SIGNATURE_INK, SIGNATURE_PEN, SIGNATURE_VIEWBOX } from "./signature.js";
import "./Loader.css";

// Long enough for the signature to be written (2.2s, see Loader.css) and held
// for a moment before the screen lifts.
const MIN_MS = 2900;
const MAX_MS = 5000;
const EXIT_MS = 1000;
// How far the counter may creep before the thing it is waiting for actually arrives.
const STAGE = { start: 0.08, documentReady: 0.7, done: 1 };

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** One digit of the counter, rolling to its value like an odometer wheel. */
function Digit({ value }) {
  return (
    <span className="loader__digit">
      <span className="loader__reel" style={{ "--d": value }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </span>
    </span>
  );
}

/**
 * Archit's signature, writing itself: the traced ink, revealed through a mask
 * of pen strokes that draw one after another (see signature.js).
 */
function Signature() {
  return (
    <svg className="loader__sign" viewBox={SIGNATURE_VIEWBOX}>
      <defs>
        <mask id="signature-pen" className="loader__pen">
          {SIGNATURE_PEN.map((stroke, i) => (
            <path key={i} d={stroke.d} pathLength="1" style={{ "--at": stroke.at, "--for": stroke.for }} />
          ))}
        </mask>
      </defs>
      <path d={SIGNATURE_INK} mask="url(#signature-pen)" />
    </svg>
  );
}

/**
 * Opening screen: Archit's signature writes itself straight onto the page, his
 * printed name follows, and the counter rolls up to 100. On the way out the
 * signature lifts a little and fades, as the hero begins its own entrance
 * underneath.
 */
// The loading screen plays once per visit: coming back to the home page from
// another page in the same tab goes straight to the site.
let played = false;

export default function Loader({ ready }) {
  const [phase, setPhase] = useState(() => (played ? "done" : "loading"));
  const [minElapsed, setMinElapsed] = useState(false);
  const [count, setCount] = useState(0);

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

  // The counter eases towards whatever has actually finished, so it never sits
  // at a number that means nothing.
  useEffect(() => {
    if (phase === "done") return;
    let value = 0;
    let frame = 0;
    const target = () => {
      if (phase === "exiting" || ready) return STAGE.done;
      return document.readyState === "complete" ? STAGE.documentReady : STAGE.start;
    };
    const paint = () => {
      value += (target() - value) * (prefersReducedMotion() ? 1 : 0.05);
      setCount(Math.min(100, Math.round(value * 100)));
      frame = requestAnimationFrame(paint);
    };
    frame = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(frame);
  }, [phase, ready]);

  // The hero's entrance is keyed off this attribute, so it plays as the tile
  // lifts rather than invisibly underneath it.
  useEffect(() => {
    const root = document.documentElement;
    if (phase === "loading") delete root.dataset.revealed;
    else root.dataset.revealed = "";
  }, [phase]);

  useEffect(() => {
    if (phase !== "exiting") return;
    played = true;
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
      <div className="loader__frame" aria-hidden="true">
        <div className="loader__tile">
          <Signature />
        </div>
      </div>
      <p className="loader__name" aria-hidden="true">
        Archit Jain
      </p>
      <p className="loader__count" aria-hidden="true">
        <Digit value={Math.floor(count / 100)} />
        <Digit value={Math.floor(count / 10) % 10} />
        <Digit value={count % 10} />
      </p>
      <p className="visually-hidden">Loading Archit Jain's portfolio</p>
    </div>
  );
}
