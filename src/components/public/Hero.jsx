import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { supportsWebGL } from "../../lib/webgl.js";
import Accented, { AccentedWords } from "./Accented.jsx";
import RollText from "./RollText.jsx";
import FluidLight from "./FluidLight.jsx";
import SceneBoundary from "./SceneBoundary.jsx";
import "./Hero.css";

const loadShards = () => import("./three/ShardScene.jsx");
const ShardScene = lazy(loadShards);

/**
 * The opening. First the hero: a moving burgundy light, the name across the
 * foot of the screen and the portrait standing in the gap between first name
 * and surname. Scrolling on, the name parts, the portrait steps back, and a
 * frame opens out of the gap until it fills the screen: inside, the A in stone
 * shards pulls itself together while the heading lights up word by word.
 *
 * The choreography is CSS scroll-driven animation on a pinned, tall section.
 * Without it (or with reduced motion) the hero and the frame simply stack.
 */
export default function Hero({ profile, experience = [] }) {
  const section = useRef(null);
  const frame = useRef(null);
  const [webgl] = useState(supportsWebGL);
  const [armed, setArmed] = useState(false);

  // The shard scene loads once the visitor starts to scroll; its code is
  // fetched ahead of that while the browser is idle.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1500));
    idle(() => loadShards());
    const arm = () => {
      if (window.scrollY > 8) setArmed(true);
    };
    arm();
    window.addEventListener("scroll", arm, { passive: true });
    return () => window.removeEventListener("scroll", arm);
  }, []);

  const [first, ...rest] = (profile.full_name ?? "").split(" ");
  const last = rest.join(" ");
  const current = experience.find((job) => !job.end_date);

  return (
    <section ref={section} id="home" className="opening" aria-label="Introduction">
      <div className="opening__pin">
        <div className="opening__hero">
          <FluidLight className="opening__light" />

          <h1 className="opening__name">
            <span className="opening__first" aria-hidden="true">
              {first}
            </span>
            {last && (
              <span className="opening__last serif" aria-hidden="true">
                {last}
              </span>
            )}
            <span className="visually-hidden">{profile.full_name}</span>
          </h1>

          {profile.tagline && (
            <p className="opening__intro">
              <Accented text={profile.tagline} />
            </p>
          )}

          <a className="opening__skip-top" href="#about">
            <RollText>Skip intro</RollText>
          </a>

          <img
            className="opening__person"
            src={profile.hero_image_url || "/seed/archit-cutout.webp"}
            alt={profile.full_name}
            width="1171"
            height="1102"
            fetchPriority="high"
            draggable={false}
          />

          <div className="opening__bar">
            {current && (
              <p className="opening__role">
                {current.role} at {current.company}
              </p>
            )}
            <ul className="opening__links">
              <li className="opening__skip">
                <a href="#about">
                  <RollText>Skip intro</RollText>
                </a>
              </li>
              {profile.github_url && (
                <li>
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    <RollText>GitHub</RollText>
                  </a>
                </li>
              )}
              {profile.linkedin_url && (
                <li>
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <RollText>LinkedIn</RollText>
                  </a>
                </li>
              )}
              {profile.resume_url && (
                <li>
                  <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                    <RollText>Résumé</RollText>
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div ref={frame} className="opening__frame">
          {webgl && armed && (
            <SceneBoundary fallback={null}>
              <Suspense fallback={null}>
                <ShardScene sectionRef={section} frameRef={frame} />
              </Suspense>
            </SceneBoundary>
          )}
          <span className="opening__mark opening__mark--tl" aria-hidden="true" />
          <span className="opening__mark opening__mark--tr" aria-hidden="true" />
          <span className="opening__mark opening__mark--bl" aria-hidden="true" />
          <span className="opening__mark opening__mark--br" aria-hidden="true" />
          {profile.about_heading && (
            <h2 className="opening__line">
              <AccentedWords text={profile.about_heading} />
            </h2>
          )}
        </div>
      </div>
    </section>
  );
}
