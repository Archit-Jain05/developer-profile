import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiDownload, FiGithub, FiLinkedin, FiMenu, FiX } from "react-icons/fi";
import logo from "../../assets/pfp.svg";
import { LINKS } from "./navLinks.js";
import "./Nav.css";

const SECTION_IDS = LINKS.filter((link) => !link.route).map((link) => link.href.slice(1));

export default function Nav({ resumeUrl, name = "Archit Jain", githubUrl, linkedinUrl, sectionsReady = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState("");
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  // Marks the link for whichever section crosses the middle of the viewport,
  // so the bar always says where you are on the page.
  useEffect(() => {
    if (!onHome || !sectionsReady) return;
    const crossing = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) crossing.add(e.target.id);
          else crossing.delete(e.target.id);
        }
        setCurrent(SECTION_IDS.find((id) => crossing.has(id)) ?? "");
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => {
      io.disconnect();
      setCurrent("");
    };
  }, [onHome, sectionsReady]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
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

        <nav id="site-menu" className={`nav__menu ${open ? "is-open" : ""}`} aria-label="Main">
          <ul>
            {LINKS.map((link) => (
              <li key={link.href}>
                {link.route ? (
                  <Link to={link.href} onClick={close}>
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={onHome ? link.href : "/" + link.href}
                    aria-current={current === link.href.slice(1) ? "location" : undefined}
                    onClick={close}
                  >
                    {link.label}
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

          {resumeUrl && (
            <a
              className="btn btn--ghost btn--sm nav__resume"
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
