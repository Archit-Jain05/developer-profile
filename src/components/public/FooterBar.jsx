import { Link } from "react-router-dom";
import logo from "../../assets/pfp.svg";
import { LINKS } from "./navLinks.js";

/** Brand, site links and credit. Shared by the home footer and the contact page. */
export default function FooterBar({ profile, onHome = false }) {
  const year = new Date().getFullYear();

  return (
    <div className="container footer__bottom">
      <Link to="/" className="footer__brand">
        <img src={logo} alt="" width="30" height="30" />
        <span>{profile.full_name}</span>
      </Link>

      <nav className="footer__nav" aria-label="Footer">
        <ul>
          {LINKS.map((link) => (
            <li key={link.href}>
              {link.route ? (
                <Link to={link.href}>{link.label}</Link>
              ) : (
                <a href={onHome ? link.href : `/${link.href}`}>{link.label}</a>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <p className="footer__credit">
        © {year} {profile.full_name}
        <span>Built with React, Three.js and Supabase</span>
      </p>
    </div>
  );
}
