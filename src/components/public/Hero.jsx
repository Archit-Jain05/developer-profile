import { lazy, Suspense, useEffect, useState } from "react";
import { FiArrowDown, FiDownload } from "react-icons/fi";
import { getSkillIcon } from "../../data/iconMap.js";
import CodeCard from "./CodeCard.jsx";
import SceneBoundary from "./SceneBoundary.jsx";
import "./Hero.css";

const HeroScene = lazy(() => import("./three/HeroScene.jsx"));

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Static glass devices shown while the 3D scene loads, or when WebGL is unavailable. */
function HeroFallback() {
  return (
    <div className="hero-fallback" aria-hidden="true">
      <div className="hero-fallback__laptop" />
      <div className="hero-fallback__phone" />
    </div>
  );
}

export default function Hero({ profile, skills, projects, onSceneReady }) {
  const heroSkills = skills.filter((s) => s.show_in_hero);
  const [webgl, setWebgl] = useState(null);

  useEffect(() => {
    const ok = supportsWebGL();
    setWebgl(ok);
    if (!ok) onSceneReady?.();
  }, [onSceneReady]);

  return (
    <section id="home" className="hero">
      <div className="container hero__inner">
        <div className="hero__text">
          <p className="hero__hello">Hi, I'm</p>
          <h1 className="hero__name">{profile.full_name}</h1>
          <p className="hero__tagline">{profile.tagline}</p>
          {profile.intro && <p className="hero__intro">{profile.intro}</p>}

          <div className="hero__actions">
            <a href="#projects" className="btn btn--primary">
              View my work <FiArrowDown aria-hidden="true" />
            </a>
            {profile.resume_url && (
              <a href={profile.resume_url} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                Download CV <FiDownload aria-hidden="true" />
              </a>
            )}
          </div>

          {heroSkills.length > 0 && (
            <ul className="hero__tech glass" aria-label="Technologies I work with">
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
          )}
        </div>

        <div className="hero__visual">
          {profile.hero_image_url && (
            <figure className="hero-portrait glass">
              <img src={profile.hero_image_url} alt={profile.full_name} width="320" height="400" />
            </figure>
          )}
          {webgl ? (
            <SceneBoundary fallback={<HeroFallback />} onError={onSceneReady}>
              <Suspense fallback={<HeroFallback />}>
                <HeroScene projects={projects} onReady={onSceneReady} />
              </Suspense>
            </SceneBoundary>
          ) : (
            <HeroFallback />
          )}
          <CodeCard skills={skills} />
        </div>
      </div>
    </section>
  );
}
