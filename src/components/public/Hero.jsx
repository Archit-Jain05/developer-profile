import { FiDownload } from "react-icons/fi";
import { getSkillIcon } from "../../data/iconMap.js";
import "./Hero.css";

/**
 * The hero. His photograph is the primary visual and owns the right column
 * outright — the WebGL laptop that used to sit here crowded it out, and the
 * floating code card beside it made three objects compete at the same
 * apparent distance, which read as a collage rather than a composition.
 *
 * The 3D moves to the work pages, where a device showing a real screenshot
 * demonstrates the product instead of decorating the name.
 */
export default function Hero({ profile, skills, experience = [] }) {
  const heroSkills = skills.filter((s) => s.show_in_hero);
  const current = experience.find((job) => !job.end_date);

  return (
    <section id="home" className="hero">
      <div className="container hero__inner">
        <div className="hero__text">
          {current && (
            <p className="hero__status">
              <span className="hero__live" aria-hidden="true" />
              Building at {current.company}
            </p>
          )}

          <h1 className="hero__name">{profile.full_name}</h1>
          <p className="hero__tagline">{profile.tagline}</p>
          {profile.intro && <p className="hero__intro">{profile.intro}</p>}

          <div className="hero__actions">
            <a href="#projects" className="btn btn--primary">
              See the work
            </a>
            {profile.resume_url && (
              <a href={profile.resume_url} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                Download CV <FiDownload aria-hidden="true" />
              </a>
            )}
          </div>

          {heroSkills.length > 0 && (
            <ul className="hero__tech" aria-label="Technologies I work with">
              {heroSkills.map((skill) => {
                const { icon: Icon, color } = getSkillIcon(skill.icon);
                return (
                  <li key={skill.id}>
                    <Icon style={{ color }} aria-hidden="true" />
                    <span className="hero__tech-name">{skill.name}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {profile.hero_image_url && (
          <figure className="hero__portrait">
            <img
              src={profile.hero_image_url}
              alt={profile.full_name}
              width="560"
              height="700"
              fetchPriority="high"
            />
          </figure>
        )}
      </div>
    </section>
  );
}
