import { formatYearRange } from "../../lib/format.js";
import "./Sections.css";

export default function Education({ items }) {
  return (
    <section id="education" className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Academics</span>
          <h2 className="section-title">Education</h2>
        </div>
        <ul className="edu-grid">
          {items.map((edu) => (
            <li key={edu.id} className="card edu">
              <div className="logo-panel edu__logo">
                {edu.logo_url ? (
                  <img src={edu.logo_url} alt={`${edu.institution} logo`} loading="lazy" />
                ) : (
                  <span className="logo-panel__initial">{edu.institution.charAt(0)}</span>
                )}
              </div>
              <div className="edu__body">
                <h3 className="edu__school">{edu.institution}</h3>
                <dl className="edu__facts">
                  <div>
                    <dt>Course</dt>
                    <dd>{edu.course}</dd>
                  </div>
                  {edu.score && (
                    <div>
                      <dt>Score</dt>
                      <dd>{edu.score}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Duration</dt>
                    <dd>{formatYearRange(edu.start_year, edu.end_year)}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
