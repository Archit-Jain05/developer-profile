import { useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { formatYearRange } from "../../lib/format.js";
import DetailDialog from "./DetailDialog.jsx";
import "./Sections.css";

function EduLogo({ edu }) {
  return (
    <span className="edu__logo">
      {edu.logo_url ? (
        <img src={edu.logo_url} alt={`${edu.institution} logo`} loading="lazy" />
      ) : (
        <span>{edu.institution.charAt(0)}</span>
      )}
    </span>
  );
}

function EduDetail({ edu }) {
  const years = formatYearRange(edu.start_year, edu.end_year);
  const paragraphs = (edu.description ?? "").split(/\n\s*\n/).filter((p) => p.trim());
  const highlights = edu.highlights ?? [];

  return (
    <>
      <header className="detail-head">
        <EduLogo edu={edu} />
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

function EduCard({ edu, onOpen, cardRef }) {
  return (
    <li>
      <button
        ref={cardRef}
        type="button"
        className="edu glass card-button"
        aria-haspopup="dialog"
        onClick={onOpen}
      >
        <span className="edu__top">
          <EduLogo edu={edu} />
          <span className="edu__years">{formatYearRange(edu.start_year, edu.end_year)}</span>
        </span>
        <span className="edu__school">{edu.institution}</span>
        <span className="edu__course">{edu.course}</span>
        <span className="edu__foot">
          {edu.score && <span className="edu__score">{edu.score}</span>}
          <span className="card-button__cue">
            Details <FiPlus aria-hidden="true" />
          </span>
        </span>
      </button>
    </li>
  );
}

export default function Education({ items }) {
  const [openId, setOpenId] = useState(null);
  const cardRefs = useRef(new Map());
  const originRef = useRef(null);
  const open = items.find((edu) => edu.id === openId);

  return (
    <section id="education" className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">Where I studied</h2>
          <p className="section-lede">Open a school to see what I studied there.</p>
        </div>
        <ul className="edu-grid">
          {items.map((edu) => (
            <EduCard
              key={edu.id}
              edu={edu}
              cardRef={(el) => (el ? cardRefs.current.set(edu.id, el) : cardRefs.current.delete(edu.id))}
              onOpen={() => {
                originRef.current = cardRefs.current.get(edu.id);
                setOpenId(edu.id);
              }}
            />
          ))}
        </ul>
      </div>

      {open && (
        <DetailDialog originRef={originRef} labelledBy={`edu-${open.id}-title`} onClose={() => setOpenId(null)}>
          <EduDetail edu={open} />
        </DetailDialog>
      )}
    </section>
  );
}
