import { FiGithub, FiLinkedin } from "react-icons/fi";
import ContactForm from "./ContactForm.jsx";
import FooterBar from "./FooterBar.jsx";
import "./Contact.css";

export default function Contact({ profile }) {
  return (
    <footer id="contact" className="contact">
      <div className="container">
        <div className="contact__panel grid">
          <div className="contact__intro">
            <h2 className="contact__title reveal-title">Contact</h2>
            {profile.contact_blurb && <p className="section-lede">{profile.contact_blurb}</p>}

            <ul className="contact__details">
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
            </ul>

            <div className="socials">
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <FiGithub />
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <FiLinkedin />
                </a>
              )}
            </div>
          </div>

          <div className="contact__form card reveal reveal--right">
            <ContactForm fallbackEmail={profile.email} />
          </div>
        </div>
      </div>

      <FooterBar profile={profile} onHome />
    </footer>
  );
}
