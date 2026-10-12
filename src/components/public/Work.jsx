import { useEffect, useMemo, useRef, useState } from "react";
import { FiGithub } from "react-icons/fi";
import DetailDialog from "./DetailDialog.jsx";
import "./Sections.css";

/** True when a project has a real screenshot rather than the placeholder. */
export const hasScreenshot = (project) => Boolean(project.image_url) && !project.image_url.includes("placeholder-project");

function Links({ project }) {
  if (!project.live_url && !project.github_url) return null;
  return (
    <div className="project__links">
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
  );
}

function ProjectDetail({ project, company }) {
  return (
    <>
      <header className="detail-head">
        <div className="detail-head__text">
          {company && <p className="detail__meta">Built at {company}</p>}
          <h2 id={`project-${project.id}-title`} className="detail__title">
            {project.title}
          </h2>
        </div>
      </header>
      {hasScreenshot(project) && <img className="detail__shot" src={project.image_url} alt={`${project.title} screenshot`} />}
      {project.description && (
        <div className="detail__body">
          <p>{project.description}</p>
        </div>
      )}
      {project.tech?.length > 0 && (
        <ul className="tags" aria-label="Built with">
          {project.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      <Links project={project} />
    </>
  );
}

/** What the floating preview shows: the screenshot, or failing that what the project is. */
function PreviewCard({ project, company }) {
  if (hasScreenshot(project)) return <img src={project.image_url} alt="" />;
  return (
    <div className="work-preview__card">
      <p className="work-preview__desc">{project.description}</p>
      <p className="work-preview__meta">
        {company ? `Built at ${company}. ` : ""}
        {project.tech?.join(", ")}
      </p>
    </div>
  );
}

/**
 * Projects as an index: the names set large, one per row. On a screen with a
 * mouse, a preview follows the pointer over the list; everywhere, a row opens
 * the project's details.
 */
export default function Work({ items, experience = [], githubUrl }) {
  const companies = useMemo(() => new Map(experience.map((job) => [job.id, job.company])), [experience]);
  const [shownId, setShownId] = useState(null);
  const [active, setActive] = useState(false);
  const [openId, setOpenId] = useState(null);
  const preview = useRef(null);
  const rows = useRef(new Map());
  const origin = useRef(null);
  const fine = useMemo(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches, []);

  // The preview trails the pointer a little, and flips to the pointer's left
  // near the right edge of the screen.
  useEffect(() => {
    const el = preview.current;
    if (!fine || !el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const at = { x: window.innerWidth / 2, y: window.innerHeight / 2, tx: 0, ty: 0 };
    let frame = 0;
    const step = () => {
      at.x += (at.tx - at.x) * (calm ? 1 : 0.18);
      at.y += (at.ty - at.y) * (calm ? 1 : 0.18);
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const x = at.tx + 32 + w > window.innerWidth ? at.x - w - 32 : at.x + 32;
      const y = Math.min(Math.max(at.y - h / 2, 16), window.innerHeight - h - 16);
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = Math.abs(at.tx - at.x) + Math.abs(at.ty - at.y) > 0.5 ? requestAnimationFrame(step) : 0;
    };
    const onMove = (e) => {
      at.tx = e.clientX;
      at.ty = e.clientY;
      if (!frame) frame = requestAnimationFrame(step);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [fine]);

  const shown = items.find((p) => p.id === shownId);
  const open = items.find((p) => p.id === openId);

  return (
    <section id="projects" className="section work">
      <div className="container">
        <h2 className="work__title">Projects</h2>

        <ol className="work__list" onPointerLeave={() => setActive(false)}>
          {items.map((project) => (
            <li key={project.id}>
              <button
                ref={(el) => (el ? rows.current.set(project.id, el) : rows.current.delete(project.id))}
                type="button"
                className="work__row"
                aria-haspopup="dialog"
                onPointerEnter={() => {
                  setShownId(project.id);
                  setActive(true);
                }}
                onClick={() => {
                  origin.current = rows.current.get(project.id);
                  setOpenId(project.id);
                }}
              >
                <span className="work__name">{project.title}</span>
                <span className="work__meta">{project.tech?.join(", ")}</span>
                {project.description && <span className="work__desc">{project.description}</span>}
              </button>
            </li>
          ))}
        </ol>

        {githubUrl && (
          <p className="work__more">
            Everything else lives on{" "}
            <a className="link-out" href={githubUrl} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
        )}
      </div>

      {fine && (
        <div ref={preview} className={`work-preview${active && shown ? " is-on" : ""}`} aria-hidden="true">
          {shown && <PreviewCard project={shown} company={companies.get(shown.experience_id)} />}
        </div>
      )}

      {open && (
        <DetailDialog originRef={origin} labelledBy={`project-${open.id}-title`} onClose={() => setOpenId(null)}>
          <ProjectDetail project={open} company={companies.get(open.experience_id)} />
        </DetailDialog>
      )}
    </section>
  );
}
