import { FiGithub, FiLinkedin, FiMail, FiPhone } from "react-icons/fi";
import ContactForm from "./ContactForm.jsx";
import "./Contact.css";

export default function Contact({ profile }) {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="contact">
      <div className="container contact__grid">
        <div className="contact__intro">
          <span className="eyebrow">Let's work together</span>
          <h2 className="section-title">Have a project in mind?</h2>
          {profile.contact_blurb && <p className="muted">{profile.contact_blurb}</p>}
        </div>

        <div className="card contact__form-card">
          <ContactForm fallbackEmail={profile.email} />
        </div>

        <div className="contact__links">
          <span className="eyebrow">Follow me</span>
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
          <ul className="contact__details">
            {profile.email && (
              <li>
                <FiMail aria-hidden="true" />
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </li>
            )}
            {profile.show_phone && profile.phone && (
              <li>
                <FiPhone aria-hidden="true" />
                <a href={`tel:${profile.phone.replace(/\s+/g, "")}`}>{profile.phone}</a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="contact__credit">
        <div className="container">
          © {year} {profile.full_name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
