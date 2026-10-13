const NBSP = String.fromCharCode(160); // a no-break space, so spaces keep their width

/**
 * Link text that rolls on hover: each letter slides up and an identical copy
 * rises in from below, one letter after another. Screen readers get the plain
 * text; the split letters are hidden from them. The roll is triggered by the
 * nearest link or button (see .roll in base.css).
 */
export default function RollText({ children }) {
  const text = String(children);
  return (
    <span className="roll">
      <span className="visually-hidden">{text}</span>
      <span className="roll__letters" aria-hidden="true">
        {[...text].map((ch, i) => {
          const letter = ch === " " ? NBSP : ch;
          return (
            <span key={i} className="roll__letter" style={{ "--i": i }} data-ch={letter}>
              {letter}
            </span>
          );
        })}
      </span>
    </span>
  );
}
