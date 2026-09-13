import { FiArrowRight } from "react-icons/fi";
import { STAT_ICONS } from "../../data/iconMap.js";
import { toParagraphs } from "../../lib/format.js";
import "./Sections.css";

export default function About({ profile }) {
  const stats = profile.stats ?? [];

  return (
    <section id="about" className="section section--alt">
      <div className="container about">
        <div className="about__text">
          <span className="eyebrow eyebrow--pill">About me</span>
          <h2 className="section-title">{profile.about_heading}</h2>
          {toParagraphs(profile.about_body).map((p, i) => (
            <p key={i} className="muted">
              {p}
            </p>
          ))}
          <a href="#contact" className="btn btn--ghost">
            Get in touch <FiArrowRight aria-hidden="true" />
          </a>
        </div>

        {stats.length > 0 && (
          <ul className="stats">
            {stats.map((stat, i) => {
              const Icon = STAT_ICONS[stat.icon] ?? STAT_ICONS.star;
              return (
                <li key={i} className="stat">
                  <span className="stat__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <div>
                    <strong className="stat__value">{stat.value}</strong>
                    <span className="stat__label">{stat.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
