import { useCurrentSection } from "../../hooks/useCurrentSection.js";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];
const IDS = SECTIONS.map((s) => s.id);

/**
 * A slim guide on the right edge on large screens: the page's sections as
 * links, the one in view lit, beside a line that fills as you scroll (a CSS
 * scroll-driven animation, see Sections.css).
 */
export default function ScrollGuide({ ready }) {
  const current = useCurrentSection(IDS, ready);

  return (
    <nav className={`guide${current ? " is-on" : ""}`} aria-label="Sections on this page">
      <span className="guide__track" aria-hidden="true">
        <span className="guide__fill" />
      </span>
      <ol className="guide__list">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} aria-current={current === section.id ? "location" : undefined}>
              <span className="guide__label">{section.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
