export default function CodeCard({ skills }) {
  const names = skills.slice(0, 3).map((s) => `"${s.name}"`);

  return (
    <div className="code-card glass" aria-hidden="true">
      <div className="code-card__bar">
        <span className="code-card__dots">
          <i />
          <i />
          <i />
        </span>
        <span>developer.js</span>
      </div>
      <pre>
        <span className="tok-kw">const</span> <span className="tok-var">archit</span> = {"{"}
        {"\n  "}builds: [<span className="tok-str">"web"</span>, <span className="tok-str">"mobile"</span>],
        {"\n  "}stack: [<span className="tok-str">{names.join(", ")}</span>],
        {"\n  "}alwaysLearning: <span className="tok-bool">true</span>,
        {"\n"}
        {"};"}
      </pre>
    </div>
  );
}
