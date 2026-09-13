import { FiArrowUpRight, FiGithub } from "react-icons/fi";
import "./Sections.css";

export default function Projects({ items }) {
  return (
    <section id="projects" className="section section--alt">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Featured projects</span>
          <h2 className="section-title">Some of My Recent Work</h2>
        </div>
        <ul className="project-grid">
          {items.map((project, i) => (
            <li key={project.id} className="card project">
              <div className="project__media">
                <span className="project__num">{String(i + 1).padStart(2, "0")}</span>
                {project.image_url && (
                  <img src={project.image_url} alt={`${project.title} screenshot`} loading="lazy" />
                )}
              </div>
              <div className="project__body">
                <h3 className="project__title">{project.title}</h3>
                {project.description && <p className="muted">{project.description}</p>}
                {project.tech?.length > 0 && (
                  <ul className="tags">
                    {project.tech.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
                <div className="project__links">
                  {project.github_url && (
                    <a
                      className="link-arrow"
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FiGithub aria-hidden="true" /> Code
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      className="link-arrow"
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View project <FiArrowUpRight aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
