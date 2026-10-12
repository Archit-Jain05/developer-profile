import ContactForm from "./ContactForm.jsx";
import FooterBar from "./FooterBar.jsx";
import "./Contact.css";

/**
 * The close: a note each for the two people who reach this point (someone
 * hiring, someone with a project), the email set large, and the form.
 */
export default function Contact({ profile }) {
  return (
    <footer id="contact" className="contact">
      <div className="container">
        <h2 className="contact__heading">Contact</h2>

        <div className="contact__grid">
          <div className="contact__notes">
            {profile.hiring_note && <p>{profile.hiring_note}</p>}
            {profile.contact_blurb && <p>{profile.contact_blurb}</p>}

            {profile.email && (
              <a className="contact__email" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            )}
            {profile.show_phone && profile.phone && (
              <a className="contact__phone" href={`tel:${profile.phone.replace(/\s+/g, "")}`}>
                {profile.phone}
              </a>
            )}

            <ul className="contact__links">
              {profile.github_url && (
                <li>
                  <a className="link-out" href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </li>
              )}
              {profile.linkedin_url && (
                <li>
                  <a className="link-out" href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </li>
              )}
              {profile.resume_url && (
                <li>
                  <a className="link-out" href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                    Résumé
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className="contact__form card">
            <ContactForm fallbackEmail={profile.email} />
          </div>
        </div>
      </div>

      <FooterBar profile={profile} onHome />
    </footer>
  );
}
