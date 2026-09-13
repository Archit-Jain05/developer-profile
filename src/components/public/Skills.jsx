import { getSkillIcon } from "../../data/iconMap.js";
import { useInView } from "../../hooks/useInView.js";
import "./Sections.css";

function SkillBar({ skill, animate }) {
  const { icon: Icon, color } = getSkillIcon(skill.icon);
  const percent = Math.max(0, Math.min(100, Number(skill.percent) || 0));

  return (
    <li className="skill">
      <div className="skill__head">
        <Icon className="skill__icon" style={{ color }} aria-hidden="true" />
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
        <div className="skill__fill" style={{ width: animate ? `${percent}%` : 0 }} />
      </div>
    </li>
  );
}

export default function Skills({ skills }) {
  const [ref, inView] = useInView();

  return (
    <section id="skills" className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">My skills</span>
          <h2 className="section-title">Technologies I Master</h2>
        </div>
        <ul ref={ref} className="skills">
          {skills.map((skill) => (
            <SkillBar key={skill.id} skill={skill} animate={inView} />
          ))}
        </ul>
      </div>
    </section>
  );
}
