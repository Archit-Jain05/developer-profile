import { toParagraphs } from "../../lib/format.js";
import "./Sections.css";

export default function About({ profile }) {
  const stats = profile.stats ?? [];
  const [lead, ...rest] = toParagraphs(profile.about_body);

  return (
    <section id="about" className="section">
      <div className="container grid about">
        {profile.intro && <p className="about__statement reveal">{profile.intro}</p>}

        <div className="about__side">
          <h2 className="section-title reveal-title">{profile.about_heading}</h2>
          <a href="#contact" className="link-in">
            Contact me
          </a>
        </div>

        <div className="about__body reveal">
          {lead && <p className="about__lead">{lead}</p>}
          {rest.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {stats.length > 0 && (
          <dl className="about__stats stagger">
            {stats.map((stat, i) => (
              <div key={i} className="stat" style={{ "--i": i }}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
