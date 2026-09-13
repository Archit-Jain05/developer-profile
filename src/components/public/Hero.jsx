import { FiArrowUpRight, FiDownload } from "react-icons/fi";
import { getSkillIcon } from "../../data/iconMap.js";
import { firstName } from "../../lib/format.js";
import CodeCard from "./CodeCard.jsx";
import "./Hero.css";

export default function Hero({ profile, skills }) {
  const heroSkills = skills.filter((s) => s.show_in_hero);
  const first = firstName(profile.full_name);

  return (
    <section id="home" className="hero">
      <div className="container hero__inner">
        <div className="hero__text">
          {profile.eyebrow && <span className="eyebrow eyebrow--pill">I'm a {profile.eyebrow}</span>}
          <h1 className="hero__title">
            Hi, I'm <span className="hero__name">{first}</span>
            <span className="hero__tagline">{profile.tagline}</span>
          </h1>
          {profile.intro && <p className="hero__intro muted">{profile.intro}</p>}

          <div className="hero__actions">
            <a href="#projects" className="btn btn--primary">
              View My Work <FiArrowUpRight aria-hidden="true" />
            </a>
            {profile.resume_url && (
              <a
                href={profile.resume_url}
                className="btn btn--ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download CV <FiDownload aria-hidden="true" />
              </a>
            )}
          </div>

          {heroSkills.length > 0 && (
            <div className="hero__tech">
              <span className="hero__tech-label">Technologies I work with</span>
              <ul>
                {heroSkills.map((skill) => {
                  const { icon: Icon, color } = getSkillIcon(skill.icon);
                  return (
                    <li key={skill.id} title={skill.name}>
                      <Icon style={{ color }} aria-hidden="true" />
                      <span className="visually-hidden">{skill.name}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="hero__visual">
          <div className="hero__glow" aria-hidden="true" />
          <div className="hero__dots" aria-hidden="true" />
          {profile.hero_image_url && (
            <img
              className="hero__photo"
              src={profile.hero_image_url}
              alt={profile.full_name}
              width="420"
              height="420"
            />
          )}
          <CodeCard profile={profile} skills={skills} />
        </div>
      </div>
    </section>
  );
}
