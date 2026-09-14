import { FiArrowRight } from "react-icons/fi";
import { toParagraphs } from "../../lib/format.js";
import "./Sections.css";

export default function About({ profile }) {
  const stats = profile.stats ?? [];

  return (
    <section id="about" className="section">
      <div className="container">
        <div className="about glass">
          <div className="about__text">
            <h2 className="section-title">{profile.about_heading}</h2>
            <div className="about__body">
              {toParagraphs(profile.about_body).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <a href="#contact" className="link-arrow">
              Start a conversation <FiArrowRight aria-hidden="true" />
            </a>
          </div>

          {stats.length > 0 && (
            <dl className="stat-grid">
              {stats.map((stat, i) => (
                <div key={i} className="stat-grid__item">
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
