import { splitAccents } from "../../lib/format.js";

/** Text with its *starred* phrases set in the serif italic. */
export default function Accented({ text }) {
  return splitAccents(text).map((run, i) =>
    run.accent ? (
      <em key={i} className="serif">
        {run.text}
      </em>
    ) : (
      run.text
    ),
  );
}

/**
 * The same, one span per word (numbered in --i), so a scroll animation can
 * light the words up in turn.
 */
export function AccentedWords({ text }) {
  let i = 0;
  return splitAccents(text).flatMap((run, r) =>
    run.text
      .split(/(\s+)/)
      .filter(Boolean)
      .map((word, w) =>
        /^\s+$/.test(word) ? (
          word
        ) : (
          <span key={`${r}-${w}`} className={run.accent ? "word serif" : "word"} style={{ "--i": i++ }}>
            {word}
          </span>
        ),
      ),
  );
}
