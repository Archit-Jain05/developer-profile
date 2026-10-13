import { Link } from "react-router-dom";
import logo from "../../assets/pfp.svg";
import { LINKS } from "./navLinks.js";
import RollText from "./RollText.jsx";

/**
 * The footer, shared by the home page and the contact page: the A mark and a
 * line about what Archit does, then link columns (pages, elsewhere, contact),
 * and a credit line along the bottom.
 */
export default function FooterBar({ profile, onHome = false }) {
  const year = new Date().getFullYear();
  const pages = LINKS.filter((link) => !link.route);
  const elsewhere = [
    { label: "GitHub", href: profile.github_url },
    { label: "LinkedIn", href: profile.linkedin_url },
    { label: "Résumé", href: profile.resume_url },
  ].filter((link) => link.href);

  return (
    <div className="container footer">
      <div className="footer__grid">
        <div className="footer__about">
          <Link to="/" className="footer__brand" aria-label={`${profile.full_name}, home`}>
            <img src={logo} alt="" />
          </Link>
        </div>

        <p className="footer__tag">Get your idea made into reality</p>

        <nav className="footer__col" aria-label="Pages">
          <h3>Pages</h3>
          <ul>
            {pages.map((link) => (
              <li key={link.href}>
                <a href={onHome ? link.href : `/${link.href}`}>
                  <RollText>{link.label}</RollText>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {elsewhere.length > 0 && (
          <nav className="footer__col" aria-label="Elsewhere">
            <h3>Elsewhere</h3>
            <ul>
              {elsewhere.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <RollText>{link.label}</RollText>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="footer__col">
          <h3>Contact</h3>
          <ul>
            {profile.email && (
              <li>
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </li>
            )}
            {profile.show_phone && profile.phone && (
              <li>
                <a href={`tel:${profile.phone.replace(/\s+/g, "")}`}>{profile.phone}</a>
              </li>
            )}
            <li>
              <Link to="/contact">
                <RollText>Send a message</RollText>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <p className="footer__credit">
        <span>
          © {year} {profile.full_name}
        </span>
        <span>Built with React, Three.js and Supabase</span>
      </p>
    </div>
  );
}
