import { FiArrowUpRight, FiGithub } from "react-icons/fi";
import { useTilt } from "../../hooks/useTilt.js";
import "./Sections.css";

function ProjectCard({ project, company }) {
  const tilt = useTilt(7);

  return (
    <li className="project-tilt" {...tilt}>
      <article className="project glass">
        <span className="project__sheen" aria-hidden="true" />
        <div className="project__media">
          {project.image_url && (
            <img src={project.image_url} alt={`${project.title} screenshot`} loading="lazy" />
          )}
        </div>
        <div className="project__body">
          {company && <p className="project__origin">Built at {company}</p>}
          <h3 className="project__title">{project.title}</h3>
          {project.description && <p className="project__desc">{project.description}</p>}
          {project.tech?.length > 0 && (
            <ul className="tags" aria-label="Built with">
              {project.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          <div className="project__links">
            {project.live_url && (
              <a className="link-arrow" href={project.live_url} target="_blank" rel="noopener noreferrer">
                Open live site <FiArrowUpRight aria-hidden="true" />
              </a>
            )}
            {project.github_url && (
              <a className="link-arrow project__code" href={project.github_url} target="_blank" rel="noopener noreferrer">
                <FiGithub aria-hidden="true" /> Source
              </a>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}

export default function Projects({ items, experience = [] }) {
  const companies = new Map(experience.map((job) => [job.id, job.company]));

  return (
    <section id="projects" className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">Things I've built</h2>
          <p className="section-lede">Storefronts, apps and experiments, from client work and my own time.</p>
        </div>
        <ul className="project-grid">
          {items.map((project) => (
            <ProjectCard key={project.id} project={project} company={companies.get(project.experience_id)} />
          ))}
        </ul>
      </div>
    </section>
  );
}
