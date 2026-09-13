export default function CodeCard({ profile, skills }) {
  const names = skills.slice(0, 4).map((s) => `"${s.name}"`);

  return (
    <div className="code-card" aria-hidden="true">
      <div className="code-card__bar">
        <span>&lt;/&gt; developer.js</span>
        <span className="code-card__dot" />
      </div>
      <pre>
        <span className="tok-kw">const</span> developer = {"{"}
        {"\n  "}name: <span className="tok-str">"{profile.full_name}"</span>,
        {"\n  "}skills: [<span className="tok-str">{names.join(", ")}</span>],
        {"\n  "}passion: <span className="tok-str">"{profile.tagline}"</span>
        {"\n"}
        {"};"}
      </pre>
    </div>
  );
}
