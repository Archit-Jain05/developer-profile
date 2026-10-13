import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiDownload, FiGithub, FiLinkedin, FiMenu, FiX } from "react-icons/fi";
import logo from "../../assets/pfp.svg";
import { useCurrentSection } from "../../hooks/useCurrentSection.js";
import { LINKS } from "./navLinks.js";
import RollText from "./RollText.jsx";
import ThemeSwitch from "./ThemeSwitch.jsx";
import "./Nav.css";

const SECTION_IDS = LINKS.filter((link) => !link.route).map((link) => link.href.slice(1));

export default function Nav({ resumeUrl, name = "Archit Jain", githubUrl, linkedinUrl, sectionsReady = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menu = useRef(null);
  const toggle = useRef(null);
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  // The link for the section in view keeps its underline.
  const current = useCurrentSection(SECTION_IDS, onHome && sectionsReady);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    // The drawer comes before its button in the page, so focus is taken into
    // it on open (Tab then runs through the links to the close button), and
    // Escape hands it back to the button.
    menu.current?.querySelector("a")?.focus();
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);
  // The logo is a capital A, so it stands in for the first letter of the name.
  const wordmark = name.startsWith("A") ? name.slice(1) : name;

  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="nav__bar">
        <Link to="/" className={`nav__brand ${wordmark === name ? "nav__brand--spaced" : ""}`} onClick={close}>
          <img className="nav__mark" src={logo} alt="" width="26" height="26" />
          <span className="nav__wordmark" aria-hidden="true">{wordmark}</span>
          <span className="visually-hidden">{name}, back to top</span>
        </Link>

        <nav ref={menu} id="site-menu" className={`nav__menu ${open ? "is-open" : ""}`} aria-label="Main">
          <ul>
            {LINKS.map((link) => (
              <li key={link.href}>
                {link.route ? (
                  <Link to={link.href} onClick={close}>
                    <RollText>{link.label}</RollText>
                  </Link>
                ) : (
                  <a
                    href={onHome ? link.href : "/" + link.href}
                    aria-current={current === link.href.slice(1) ? "location" : undefined}
                    onClick={close}
                  >
                    <RollText>{link.label}</RollText>
                  </a>
                )}
              </li>
            ))}
          </ul>
          {(githubUrl || linkedinUrl) && (
            <div className="nav__socials">
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub" onClick={close}>
                  <FiGithub aria-hidden="true" />
                </a>
              )}
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" onClick={close}>
                  <FiLinkedin aria-hidden="true" />
                </a>
              )}
            </div>
          )}

          {/* The drawer carries its own switch too (the bar one stays visible). */}
          <div className="nav__drawer-theme">
            <span>Theme</span>
            <ThemeSwitch />
          </div>

          {resumeUrl && (
            <a
              className="btn btn--ghost btn--sm nav__resume"
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
            >
              Résumé <FiDownload aria-hidden="true" />
            </a>
          )}
        </nav>

        <ThemeSwitch />

        <button
          ref={toggle}
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
