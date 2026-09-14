import { getSkillIcon } from "../../data/iconMap.js";
import { useInView } from "../../hooks/useInView.js";
import "./Sections.css";

function SkillBar({ skill, animate, index }) {
  const { icon: Icon, color } = getSkillIcon(skill.icon);
  const percent = Math.max(0, Math.min(100, Number(skill.percent) || 0));

  return (
    <li className="skill">
      <div className="skill__head">
        <span className="skill__icon" style={{ color }}>
          <Icon aria-hidden="true" />
        </span>
        <span className="skill__name">{skill.name}</span>
        <span className="skill__percent">{percent}%</span>
      </div>
      <div
        className="skill__track"
        role="progressbar"
        aria-label={skill.name}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="skill__fill"
          style={{ width: animate ? `${percent}%` : 0, transitionDelay: `${index * 60}ms` }}
        />
      </div>
    </li>
  );
}

export default function Skills({ skills }) {
  const [ref, inView] = useInView();

  return (
    <section id="skills" className="section">
      <div className="container">
        <div className="skills-panel glass">
          <div className="section-head">
            <h2 className="section-title">Tools I reach for</h2>
            <p className="section-lede">The languages and frameworks I use most, and how comfortable I am with each.</p>
          </div>
          <ul ref={ref} className="skills">
            {skills.map((skill, i) => (
              <SkillBar key={skill.id} skill={skill} animate={inView} index={i} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
