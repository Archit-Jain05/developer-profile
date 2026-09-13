import { FiArrowUpRight } from "react-icons/fi";
import { formatDateRange } from "../../lib/format.js";
import "./Sections.css";

export default function Experience({ items }) {
  return (
    <section id="experience" className="section section--alt">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Where I've worked</span>
          <h2 className="section-title">Experience</h2>
        </div>
        <ul className="exp-list">
          {items.map((job) => (
            <li key={job.id} className="card exp">
              <div className="logo-panel exp__logo">
                {job.logo_url ? (
                  <img src={job.logo_url} alt={`${job.company} logo`} loading="lazy" />
                ) : (
                  <span className="logo-panel__initial">{job.company.charAt(0)}</span>
                )}
              </div>
              <div className="exp__body">
                <div className="exp__top">
                  <div>
                    <h3 className="exp__role">{job.role}</h3>
                    <p className="exp__company">{job.company}</p>
                  </div>
                  <span className="date-chip">{formatDateRange(job.start_date, job.end_date)}</span>
                </div>
                {job.description && <p className="muted">{job.description}</p>}
                {job.website_url && (
                  <a
                    className="link-arrow"
                    href={job.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit website <FiArrowUpRight aria-hidden="true" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
