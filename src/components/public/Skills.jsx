import { FiPlus } from "react-icons/fi";
import { getSkillIcon } from "../../data/iconMap.js";
import Accented from "./Accented.jsx";
import "./Sections.css";

/** Case-insensitive match between a skill name and a project's tech row. */
function usedIn(skill, projects) {
  const name = skill.name.trim().toLowerCase();
  return projects.filter((p) => (p.tech ?? []).some((t) => t.trim().toLowerCase() === name));
}

function SkillRow({ skill, projects, index }) {
  const { icon: Icon, color } = getSkillIcon(skill.icon);
  return (
    <li className="skill" style={{ "--i": Math.min(index, 6) }}>
      <span className="skill__icon" style={{ color }}>
        <Icon aria-hidden="true" />
      </span>
      <span className="skill__name">{skill.name}</span>
      {projects.length > 0 && <span className="skill__where">{projects.map((p) => p.title).join(", ")}</span>}
    </li>
  );
}

function Group({ title, entries, open = false }) {
  if (!entries.length) return null;
  return (
    <details className="skill-group" open={open}>
      <summary>
        <span>{title}</span>
        <span className="skill-group__count">{entries.length}</span>
        <FiPlus className="skill-group__icon" aria-hidden="true" />
      </summary>
      <ul className="skill-group__list stagger">
        {entries.map(({ skill, used }, index) => (
          <SkillRow key={skill.id} skill={skill} projects={used} index={index} />
        ))}
      </ul>
    </details>
  );
}

/**
 * The tools, split by whether they have shipped in a project yet (derived from
 * the projects' own tech rows), in groups that open and close.
 */
export default function Skills({ skills, projects = [], statement }) {
  const shipped = [];
  const working = [];
  for (const skill of skills) {
    const used = usedIn(skill, projects);
    (used.length > 0 ? shipped : working).push({ skill, used });
  }

  return (
    <section id="skills" className="section skills">
      <div className="container skills__grid">
        <div className="skills__intro">
          <h2 className="skills__title reveal-title">Skills</h2>
          {statement && (
            <p className="skills__statement">
              <Accented text={statement} />
            </p>
          )}
        </div>
        <div className="skills__groups">
          <Group title="Shipped with" entries={shipped} open />
          <Group title="Working with" entries={working} />
        </div>
      </div>
    </section>
  );
}
