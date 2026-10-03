import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { getSkillIcon } from "../../data/iconMap.js";
import { supportsWebGL } from "../../lib/webgl.js";
import SceneBoundary from "./SceneBoundary.jsx";
import "./Sections.css";

const KeyboardScene = lazy(() => import("./three/KeyboardScene.jsx"));

/** Case-insensitive match between a skill name and a project's tech row. */
function usedIn(skill, projects) {
  const name = skill.name.trim().toLowerCase();
  return projects.filter((p) => (p.tech ?? []).some((t) => t.trim().toLowerCase() === name));
}

function SkillRow({ skill, projects, index, rowRef }) {
  const { icon: Icon, color } = getSkillIcon(skill.icon);

  return (
    <li ref={rowRef} className="skill" style={{ "--i": index }}>
      <span className="skill__icon" style={{ color }}>
        <Icon aria-hidden="true" />
      </span>
      <span className="skill__name">{skill.name}</span>
      {projects.length > 0 && <span className="skill__where">{projects.map((p) => p.title).join(", ")}</span>}
    </li>
  );
}

/** A key pressed on the 3D keyboard lights up its row, so the two read as one set. */
function lightUp(row) {
  if (!row) return;
  row.animate([{ opacity: 1 }, { opacity: 0 }], { pseudoElement: "::before", duration: 1100, easing: "ease-out" });
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  row.querySelector(".skill__icon")?.animate(
    [
      { scale: 1, rotate: "0deg" },
      { scale: 1.3, rotate: "-10deg", offset: 0.3 },
      { scale: 1, rotate: "0deg" },
    ],
    { duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
  );
}

function sayHi() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
}

/**
 * Skills grouped by whether they have actually shipped, derived from the tech
 * rows on the projects themselves — what a recruiter wants to know is where a
 * skill was used, not a percentage. Beside the list, the same skills as a
 * keyboard you can play with.
 */
export default function Skills({ skills, projects = [] }) {
  const [webgl, setWebgl] = useState(false);
  useEffect(() => {
    setWebgl(supportsWebGL());
  }, []);

  const rows = useRef(new Map());
  const rowRef = (id) => (el) => {
    if (el) rows.current.set(id, el);
    else rows.current.delete(id);
  };
  const onKeyPress = useCallback((i) => lightUp(rows.current.get(skills[i]?.id)), [skills]);

  const shipped = [];
  const working = [];
  for (const skill of skills) {
    const used = usedIn(skill, projects);
    (used.length > 0 ? shipped : working).push({ skill, used });
  }

  return (
    <section id="skills" className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title reveal-title">Skills</h2>
          <p className="section-lede reveal">
            What I've shipped with, and what I'm working with now. Press the keys, or type the first letter of a skill.
          </p>
        </div>

        <div className="skills-layout">
          <div className="skills-groups">
            {shipped.length > 0 && (
              <div className="skills-group">
                <h3 className="skills-group__title">Shipped with</h3>
                <ul className="skills stagger">
                  {shipped.map(({ skill, used }, i) => (
                    <SkillRow key={skill.id} skill={skill} projects={used} index={i} rowRef={rowRef(skill.id)} />
                  ))}
                </ul>
              </div>
            )}

            {working.length > 0 && (
              <div className="skills-group">
                <h3 className="skills-group__title">Working with</h3>
                <ul className="skills stagger">
                  {working.map(({ skill }, i) => (
                    <SkillRow key={skill.id} skill={skill} projects={[]} index={i} rowRef={rowRef(skill.id)} />
                  ))}
                </ul>
              </div>
            )}
          </div>

          {webgl && skills.length > 0 && (
            <div className="skills-stage reveal reveal--scale" aria-hidden="true">
              <SceneBoundary fallback={null}>
                <Suspense fallback={null}>
                  <KeyboardScene skills={skills} onSayHi={sayHi} onKeyPress={onKeyPress} />
                </Suspense>
              </SceneBoundary>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
