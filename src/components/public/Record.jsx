import { useRef, useState } from "react";
import { FiGithub } from "react-icons/fi";
import { formatDateRange, formatYearRange, toParagraphs } from "../../lib/format.js";
import DetailDialog from "./DetailDialog.jsx";
import { hasScreenshot } from "./Work.jsx";
import "./Sections.css";

/** A company or school mark on a white tile (most were drawn for white pages). */
function LogoTile({ src, name }) {
  return <span className="logo-tile">{src ? <img src={src} alt="" loading="lazy" /> : <span>{name.charAt(0)}</span>}</span>;
}

function ExperienceDetail({ job, projects }) {
  const paragraphs = toParagraphs(job.description);
  return (
    <>
      <header className="detail-head">
        <LogoTile src={job.logo_url} name={job.company} />
        <div className="detail-head__text">
          <p className="detail__meta">
            <time dateTime={job.start_date}>{formatDateRange(job.start_date, job.end_date)}</time>
            {!job.end_date && <span className="record__now">Now</span>}
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
          Visit {job.company}
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
                {hasScreenshot(project) && <img src={project.image_url} alt={`${project.title} screenshot`} loading="lazy" />}
              </div>
              <div className="mini-project__body">
                <h4>{project.title}</h4>
                {project.description && <p>{project.description}</p>}
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function EducationDetail({ edu }) {
  const years = formatYearRange(edu.start_year, edu.end_year);
  const paragraphs = toParagraphs(edu.description);
  const highlights = edu.highlights ?? [];
  return (
    <>
      <header className="detail-head">
        <LogoTile src={edu.logo_url} name={edu.institution} />
        <div className="detail-head__text">
          {years && <p className="detail__meta">{years}</p>}
          <h2 id={`edu-${edu.id}-title`} className="detail__title">
            {edu.institution}
          </h2>
          <p className="detail__subtitle">{edu.course}</p>
        </div>
      </header>

      {edu.score && (
        <p className="detail__score">
          <strong>{edu.score}</strong>
        </p>
      )}

      {paragraphs.length > 0 && (
        <div className="detail__body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {highlights.length > 0 && (
        <>
          <h3 className="detail__section-title">Highlights</h3>
          <ul className="tags tags--roomy">
            {highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

/**
 * A titled list of rows. Each row reads across: mark, name, detail, when, and
 * a last column; a white fill wipes across it on hover, and it opens a dialog.
 */
function Record({ id, title, rows }) {
  const [openKey, setOpenKey] = useState(null);
  const buttons = useRef(new Map());
  const origin = useRef(null);
  const open = rows.find((row) => row.key === openKey);

  return (
    <section id={id} className="section record">
      <div className="container">
        <h2 className="record__title reveal-title">{title}</h2>
        <ol className="record__list stagger">
          {rows.map((row, index) => (
            <li key={row.key} style={{ "--i": index }}>
              <button
                ref={(el) => (el ? buttons.current.set(row.key, el) : buttons.current.delete(row.key))}
                type="button"
                className="record__row"
                aria-haspopup="dialog"
                onClick={() => {
                  origin.current = buttons.current.get(row.key);
                  setOpenKey(row.key);
                }}
              >
                <LogoTile src={row.logo} name={row.name} />
                <span className="record__name">{row.name}</span>
                <span className="record__detail">{row.detail}</span>
                <span className="record__when">{row.when}</span>
                <span className="record__last">{row.last}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {open && (
        <DetailDialog originRef={origin} labelledBy={open.labelledBy} onClose={() => setOpenKey(null)}>
          {open.detail_view}
        </DetailDialog>
      )}
    </section>
  );
}

export function ExperienceRecord({ items, projects = [] }) {
  const rows = items.map((job) => ({
    key: job.id,
    logo: job.logo_url,
    name: job.company,
    detail: job.role,
    when: formatDateRange(job.start_date, job.end_date),
    last: job.end_date ? "Details" : <span className="record__now">Now</span>,
    labelledBy: `job-${job.id}-title`,
    detail_view: <ExperienceDetail job={job} projects={projects.filter((p) => p.experience_id === job.id)} />,
  }));
  return <Record id="experience" title="Experience" rows={rows} />;
}

export function EducationRecord({ items }) {
  const rows = items.map((edu) => ({
    key: edu.id,
    logo: edu.logo_url,
    name: edu.institution,
    detail: edu.course,
    when: formatYearRange(edu.start_year, edu.end_year),
    last: edu.score ?? "Details",
    labelledBy: `edu-${edu.id}-title`,
    detail_view: <EducationDetail edu={edu} />,
  }));
  return <Record id="education" title="Education" rows={rows} />;
}
