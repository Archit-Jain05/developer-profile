import { toParagraphs } from "../../lib/format.js";
import Accented from "./Accented.jsx";
import "./Sections.css";

// The full photo, background and all; the hero uses the cut-out version.
const DEFAULT_PORTRAIT = "/seed/archit.jpg";

/**
 * The intro set large, the portrait in an arch beside it (it comes into focus
 * as it scrolls into view), then the longer story and a few facts.
 */
export default function About({ profile }) {
  const stats = profile.stats ?? [];
  const paragraphs = toParagraphs(profile.about_body);

  return (
    <section id="about" className="section about">
      <div className="container about__grid">
        {profile.intro && (
          <p className="about__statement">
            <Accented text={profile.intro} />
          </p>
        )}

        <figure className="about__portrait">
          <img src={profile.about_image_url || DEFAULT_PORTRAIT} alt={`Portrait of ${profile.full_name}`} width="800" height="800" loading="lazy" />
        </figure>

        <div className="about__body">
          {paragraphs.map((p, i) => (
            <p key={i}>
              <Accented text={p} />
            </p>
          ))}
          <div className="about__links">
            {profile.resume_url && (
              <a className="link-out" href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                Résumé
              </a>
            )}
            <a className="link-in" href="#contact">
              Contact me
            </a>
          </div>
        </div>

        {stats.length > 0 && (
          <dl className="about__facts">
            {stats.map((stat, i) => (
              <div key={i}>
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
