import { getSkillIcon } from "../../data/iconMap.js";
import "./Sections.css";

/** Case-insensitive match between a skill name and a project's tech row. */
function usedIn(skill, projects) {
  const name = skill.name.trim().toLowerCase();
  return projects.filter((p) => (p.tech ?? []).some((t) => t.trim().toLowerCase() === name));
}

function SkillRow({ skill, projects }) {
  const { icon: Icon, color } = getSkillIcon(skill.icon);

  return (
    <li className="skill">
      <span className="skill__icon" style={{ color }}>
        <Icon aria-hidden="true" />
      </span>
      <span className="skill__name">{skill.name}</span>
      {projects.length > 0 && (
        <span className="skill__where">
          {projects.map((p) => p.title).join(", ")}
        </span>
      )}
    </li>
  );
}

/**
 * Skills grouped by whether they have actually shipped, derived from the tech
 * rows on the projects themselves. This replaces nine progress meters that
 * were all set to the same 80% — a number that told a reader nothing and
 * invited the question "80% of what?". What a recruiter wants to know is
 * where a skill was used, so that is what this says.
 */
export default function Skills({ skills, projects = [] }) {
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
          <h2 className="section-title">Tools I reach for</h2>
        </div>

        <div className="skills-groups">
          {shipped.length > 0 && (
            <div className="skills-group">
              <h3 className="skills-group__title">Shipped with</h3>
              <ul className="skills">
                {shipped.map(({ skill, used }) => (
                  <SkillRow key={skill.id} skill={skill} projects={used} />
                ))}
              </ul>
            </div>
          )}

          {working.length > 0 && (
            <div className="skills-group">
              <h3 className="skills-group__title">Working with</h3>
              <ul className="skills">
                {working.map(({ skill }) => (
                  <SkillRow key={skill.id} skill={skill} projects={[]} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
