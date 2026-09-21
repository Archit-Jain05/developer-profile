import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FiArrowUpRight, FiGithub, FiPlus } from "react-icons/fi";
import { formatDateRange } from "../../lib/format.js";
import DetailDialog from "./DetailDialog.jsx";
import { lengthAtY, trailPath } from "./trailPath.js";
import "./Sections.css";

// Keep in sync with the container query in Sections.css.
const COMPACT_WIDTH = 760;
// Waypoint height within each card, level with the logo.
const WAYPOINT_OFFSET = 52;
// The path reaches whatever sits this far down the viewport.
const VIEWPORT_ANCHOR = 0.62;

function CompanyLogo({ job }) {
  return (
    <span className="timeline__logo">
      {job.logo_url ? (
        <img src={job.logo_url} alt={`${job.company} logo`} loading="lazy" />
      ) : (
        <span>{job.company.charAt(0)}</span>
      )}
    </span>
  );
}

function ExperienceDetail({ job, projects }) {
  const paragraphs = (job.description ?? "").split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <>
      <header className="detail-head">
        <CompanyLogo job={job} />
        <div className="detail-head__text">
          <p className="detail__meta">
            <time dateTime={job.start_date}>{formatDateRange(job.start_date, job.end_date)}</time>
            {!job.end_date && <span className="timeline__now">Now</span>}
          </p>
          <h2 id={`job-${job.id}-title`} className="detail__title">
            {job.role}
          </h2>
          <p className="detail__subtitle">{job.company}</p>
        </div>
      </header>

      {paragraphs.length > 0 && (
        <div className="detail__body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {job.website_url && (
        <a className="link-out" href={job.website_url} target="_blank" rel="noopener noreferrer">
          Visit {job.company} <FiArrowUpRight aria-hidden="true" />
        </a>
      )}

      <h3 className="detail__section-title">Projects at {job.company}</h3>
      {projects.length === 0 ? (
        <p className="detail__empty">No projects are listed for this role yet.</p>
      ) : (
        <ul className="mini-projects">
          {projects.map((project) => (
            <li key={project.id} className="mini-project">
              <div className="mini-project__media">
                {project.image_url && <img src={project.image_url} alt={`${project.title} screenshot`} loading="lazy" />}
              </div>
              <div className="mini-project__body">
                <h4>{project.title}</h4>
                {project.description && <p>{project.description}</p>}
                {project.tech?.length > 0 && (
                  <ul className="tags" aria-label="Built with">
                    {project.tech.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
                <div className="project__links">
                  {project.live_url && (
                    <a className="link-out" href={project.live_url} target="_blank" rel="noopener noreferrer">
                      Open live site <FiArrowUpRight aria-hidden="true" />
                    </a>
                  )}
                  {project.github_url && (
                    <a className="link-out project__code" href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <FiGithub aria-hidden="true" /> Source
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** Where the path runs and where each waypoint sits, measured from the rendered cards. */
function measureTrail(root) {
  const width = root.clientWidth;
  const height = root.offsetHeight;
  const compact = width < COMPACT_WIDTH;
  const center = compact ? 18 : width / 2;
  const swing = compact ? 9 : 54;
  const cards = [...root.querySelectorAll(".trail__item")];
  const waypoints = cards.map((card, i) => ({
    x: center + (i % 2 === 0 ? -swing : swing),
    y: card.offsetTop + WAYPOINT_OFFSET,
  }));
  return {
    width,
    height,
    compact,
    waypoints,
    d: trailPath(waypoints, { startX: center, endX: center, height }),
  };
}

export default function Experience({ items, projects = [] }) {
  const trailRef = useRef(null);
  const pathRef = useRef(null);
  const headRef = useRef(null);
  const cardRefs = useRef(new Map());
  const originRef = useRef(null);
  const [trail, setTrail] = useState(null);
  const [reached, setReached] = useState(0);
  const [openId, setOpenId] = useState(null);

  const open = items.find((job) => job.id === openId);

  // Measure the cards and rebuild the path whenever the layout changes.
  useLayoutEffect(() => {
    const root = trailRef.current;
    if (!root) return;
    const update = () =>
      setTrail((prev) => {
        const next = measureTrail(root);
        return prev && prev.d === next.d && prev.width === next.width ? prev : next;
      });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, [items.length]);

  // Draw the path down to the scroll position and drop waypoints as they are reached.
  useEffect(() => {
    const root = trailRef.current;
    const path = pathRef.current;
    if (!trail || !root || !path) return;

    const total = path.getTotalLength();
    path.style.strokeDasharray = `${total}`;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      path.style.strokeDashoffset = "0";
      setReached(trail.waypoints.length);
      return;
    }

    const samples = [];
    let maxY = 0;
    for (let i = 0; i <= 240; i++) {
      const length = (total * i) / 240;
      maxY = Math.max(maxY, path.getPointAtLength(length).y);
      samples.push({ y: maxY, length });
    }

    let frame = 0;
    const draw = () => {
      frame = 0;
      const y = window.innerHeight * VIEWPORT_ANCHOR - root.getBoundingClientRect().top;
      const length = lengthAtY(samples, y);
      path.style.strokeDashoffset = `${total - length}`;
      const tip = path.getPointAtLength(length);
      headRef.current.setAttribute("transform", `translate(${tip.x} ${tip.y})`);
      headRef.current.style.opacity = length > 1 && length < total - 1 ? "1" : "0";
      setReached(trail.waypoints.filter((w) => w.y <= y).length);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [trail]);

  return (
    <section id="experience" className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">Where I've worked</h2>
          <p className="section-lede">From my first internship to what I'm building now. Open a role to see the projects I worked on there.</p>
        </div>

        <div ref={trailRef} className="trail">
          {trail && (
              <svg
                className="trail__svg"
                width={trail.width}
                height={trail.height}
                viewBox={`0 0 ${trail.width} ${trail.height}`}
                aria-hidden="true"
              >
                <path className="trail__route" d={trail.d} />
                <path ref={pathRef} className="trail__drawn" d={trail.d} />
                <g ref={headRef} className="trail__head">
                  <circle r="11" />
                  <circle r="4.5" />
                </g>
              </svg>
          )}
          {trail?.waypoints.map((w, i) => (
            <span
              key={items[i]?.id ?? i}
              className={`trail__waypoint ${i < reached ? "is-reached" : ""} ${items[i] && !items[i].end_date ? "is-current" : ""}`}
              style={{ left: w.x, top: w.y }}
              aria-hidden="true"
            />
          ))}

          <ol className="trail__list">

            {items.map((job, i) => {
              const projectCount = projects.filter((p) => p.experience_id === job.id).length;
              return (
                <li
                  key={job.id}
                  className={`trail__item trail__item--${i % 2 === 0 ? "left" : "right"} ${i < reached ? "is-reached" : ""}`}
                >
                  <button
                    ref={(el) => (el ? cardRefs.current.set(job.id, el) : cardRefs.current.delete(job.id))}
                    type="button"
                    className="timeline__card glass card-button"
                    aria-haspopup="dialog"
                    onClick={() => {
                      originRef.current = cardRefs.current.get(job.id);
                      setOpenId(job.id);
                    }}
                  >
                    <CompanyLogo job={job} />
                    <span className="timeline__body">
                      <span className="timeline__dates">
                        <time dateTime={job.start_date}>{formatDateRange(job.start_date, job.end_date)}</time>
                        {!job.end_date && <span className="timeline__now">Now</span>}
                      </span>
                      <span className="timeline__role">{job.role}</span>
                      <span className="timeline__company">{job.company}</span>
                      {job.description && <span className="timeline__desc">{job.description}</span>}
                      <span className="card-button__cue">
                        {projectCount > 0 ? `${projectCount} ${projectCount === 1 ? "project" : "projects"}` : "Details"}
                        <FiPlus aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {open && (
        <DetailDialog originRef={originRef} labelledBy={`job-${open.id}-title`} onClose={() => setOpenId(null)}>
          <ExperienceDetail job={open} projects={projects.filter((p) => p.experience_id === open.id)} />
        </DetailDialog>
      )}
    </section>
  );
}
