import { useEffect, useState } from "react";
import logoSvg from "../../assets/pfp.svg?raw";
import "./Loader.css";

// Long enough for the mark to finish assembling before the screen lifts.
const MIN_MS = 1600;
const MAX_MS = 5000;
const EXIT_MS = 1000;
// How far the counter may creep before the thing it is waiting for actually arrives.
const STAGE = { start: 0.08, documentReady: 0.7, done: 1 };
// Each piece of the A gets its own fixed scatter offset, written straight into
// the markup so it is there from the first paint.
let piece = 0;
// Merged into the style attribute each path already has (its fill): a second
// style attribute on the same element would be dropped by the parser.
const MARK = logoSvg.slice(logoSvg.indexOf("<svg")).replace(/style="fill: var(--logo-color, white)"/g, () => {
  const i = piece++;
  const dx = ((i * 37) % 11) * 8 - 40;
  const dy = ((i * 53) % 9) * 8 - 32;
  const r = ((i * 29) % 7) * 12 - 36;
  return `style="fill: var(--logo-color, white); --i: ${i}; --dx: ${dx}px; --dy: ${dy}px; --r: ${r}deg"`;
});
// One object for the life of the page. The loader re-renders every frame to
// move its counter, and React rewrites the markup whenever it is handed a new
// { __html } object — which would restart every piece's animation each frame.
const MARK_HTML = { __html: MARK };

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
 * Opening screen: the A assembles piece by piece inside a registration-marked
 * tile while the counter rolls up to 100. On the way out the tile swells to
 * fill the screen and fades, as the hero begins its own entrance underneath.
 */
export default function Loader({ ready }) {
  const [phase, setPhase] = useState("loading");
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
          <div className="loader__mark" dangerouslySetInnerHTML={MARK_HTML} />
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
