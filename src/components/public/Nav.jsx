import { useEffect, useState } from "react";
import { FiDownload, FiMenu, FiX } from "react-icons/fi";
import logo from "../../assets/pfp.svg";
import "./Nav.css";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#education", label: "Education" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export default function Nav({ resumeUrl, name = "Archit Jain" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="container nav__inner">
        <a href="#home" className="nav__brand" onClick={close}>
          <img src={logo} alt="" width="28" height="28" />
          <span>{name}</span>
        </a>

        <nav id="site-menu" className={`nav__menu ${open ? "is-open" : ""}`} aria-label="Main">
          <ul>
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={close}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          {resumeUrl && (
            <a
              className="btn btn--primary btn--sm nav__resume"
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              Resume <FiDownload aria-hidden="true" />
            </a>
          )}
        </nav>

        <button
          type="button"
          className="nav__toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
}
