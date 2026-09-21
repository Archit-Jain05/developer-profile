import { lazy, Suspense, useEffect, useState } from "react";
import { FiArrowUpRight, FiGithub } from "react-icons/fi";
import SceneBoundary from "./SceneBoundary.jsx";
import "./Sections.css";

const DeviceViewer = lazy(() => import("./three/DeviceViewer.jsx"));

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Shown while the scene loads, when WebGL is missing, or if it throws. */
function ShotFallback({ project }) {
  return (
    <div className="device-viewer device-viewer--flat">
      {project?.image_url && <img src={project.image_url} alt={`${project.title} screenshot`} />}
    </div>
  );
}

export default function Projects({ items, experience = [] }) {
  const companies = new Map(experience.map((job) => [job.id, job.company]));
  const [selectedId, setSelectedId] = useState(items[0]?.id);
  const [webgl, setWebgl] = useState(null);

  useEffect(() => {
    setWebgl(supportsWebGL());
  }, []);

  const selected = items.find((p) => p.id === selectedId) ?? items[0];

  return (
    <section id="projects" className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">Things I've built</h2>
          <p className="section-lede">
            Storefronts, apps and experiments, from client work and my own time.
          </p>
        </div>

        <div className="work">
          {/* The canvas is decorative: everything it shows is in the list beside it. */}
          <div className="work__stage" aria-hidden="true">
            {webgl ? (
              <SceneBoundary fallback={<ShotFallback project={selected} />}>
                <Suspense fallback={<ShotFallback project={selected} />}>
                  <DeviceViewer project={selected} />
                </Suspense>
              </SceneBoundary>
            ) : (
              <ShotFallback project={selected} />
            )}
          </div>

          <ul className="work__list">
            {items.map((project) => {
              const company = companies.get(project.experience_id);
              const isSelected = project.id === selected?.id;
              return (
                <li key={project.id} className={`work__item ${isSelected ? "is-selected" : ""}`}>
                  <button
                    type="button"
                    className="work__pick"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedId(project.id)}
                    onFocus={() => setSelectedId(project.id)}
                  >
                    <span className="work__title">{project.title}</span>
                    {project.tech?.length > 0 && (
                      <span className="work__tech">{project.tech.join(" · ")}</span>
                    )}
                  </button>

                  {isSelected && (
                    <div className="work__detail">
                      {company && <p className="work__origin">Built at {company}</p>}
                      {project.description && <p className="work__desc">{project.description}</p>}
                      <div className="work__links">
                        {project.live_url && (
                          <a className="link-out" href={project.live_url} target="_blank" rel="noopener noreferrer">
                            Open live site <FiArrowUpRight aria-hidden="true" />
                          </a>
                        )}
                        {project.github_url && (
                          <a className="link-out" href={project.github_url} target="_blank" rel="noopener noreferrer">
                            <FiGithub aria-hidden="true" /> Source
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
