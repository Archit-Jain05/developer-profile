import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { FiGithub } from "react-icons/fi";
import { supportsWebGL } from "../../lib/webgl.js";
import SceneBoundary from "./SceneBoundary.jsx";
import "./Sections.css";

const ProjectDevices = lazy(() => import("./three/ProjectDevices.jsx"));

/**
 * Projects as a horizontal gallery: the section pins, and scrolling down
 * slides the cards sideways. Each card's image area is a slot the 3D layer
 * (ProjectDevices) fills with the project running on its device; everything
 * else is plain markup, so the section reads fine without WebGL.
 */
export default function Projects({ items, experience = [], githubUrl }) {
  const root = useRef(null);
  const [webgl, setWebgl] = useState(false);
  const companies = new Map(experience.map((job) => [job.id, job.company]));

  useEffect(() => {
    setWebgl(supportsWebGL());
  }, []);

  return (
    <section id="projects" ref={root} className="hscroll" style={{ "--cards": items.length }}>
      <div className="hscroll__pin">
        <div className="hscroll__track">
          <div className="hpanel hpanel--intro">
            <h2 className="section-title reveal-title">
              Projects <span className="serif">that shipped</span>
            </h2>
            <p className="section-lede">
              Storefronts, apps and experiments, from client work and my own time. Scroll to move through them
              <span className="hint-drag">, and drag a device to turn it</span>.
            </p>
          </div>

          {items.map((project) => {
            const company = companies.get(project.experience_id);
            return (
              <article key={project.id} className="hpanel">
                <div className="hpanel__media" data-device-slot>
                  {!webgl && project.image_url && <img src={project.image_url} alt={`${project.title} screenshot`} loading="lazy" />}
                </div>

                <div className="hpanel__info">
                  <div className="hpanel__text">
                    <h3 className="hpanel__title">{project.title}</h3>
                    {project.description && <p className="hpanel__desc">{project.description}</p>}
                    <p className="hpanel__meta">
                      {company ? `Built at ${company}. ` : ""}
                      {project.tech?.join(", ")}
                    </p>
                  </div>

                  <div className="hpanel__links">
                    {project.live_url && (
                      <a className="link-out" href={project.live_url} target="_blank" rel="noopener noreferrer">
                        Open live site
                      </a>
                    )}
                    {project.github_url && (
                      <a className="link-out" href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <FiGithub aria-hidden="true" /> Source
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          <div className="hpanel hpanel--end">
            <p className="hpanel__end-title">Everything else lives on GitHub.</p>
            <p className="muted">Experiments, coursework and the things I build to learn a tool properly.</p>
            {githubUrl && (
              <a className="btn btn--ghost" href={githubUrl} target="_blank" rel="noopener noreferrer">
                <FiGithub aria-hidden="true" /> See all repositories
              </a>
            )}
          </div>
        </div>
      </div>

      {webgl && items.length > 0 && (
        <SceneBoundary fallback={null}>
          <Suspense fallback={null}>
            <ProjectDevices projects={items} rootRef={root} />
          </Suspense>
        </SceneBoundary>
      )}
    </section>
  );
}
