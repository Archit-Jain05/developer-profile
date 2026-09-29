import { useEffect } from "react";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import { useContent } from "../../hooks/useContent.js";
import { useSmoothScroll } from "../../hooks/useSmoothScroll.js";
import Backdrop from "./Backdrop.jsx";
import ContactForm from "./ContactForm.jsx";
import FooterBar from "./FooterBar.jsx";
import Nav from "./Nav.jsx";
import "./Contact.css";
import "./ContactPage.css";

const TOPICS = ["A job opportunity", "Freelance work", "A collaboration", "Something else"];

export default function ContactPage() {
  const { content } = useContent();
  useSmoothScroll();
  const profile = content?.profile;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Contact Archit Jain";
  }, []);

  if (!profile) return null;

  return (
    <>
      <Backdrop />
      <Nav
        resumeUrl={profile.resume_url}
        name={profile.full_name}
        githubUrl={profile.github_url}
        linkedinUrl={profile.linkedin_url}
      />

      <main className="contact-page">
        <div className="container contact-page__grid">
          <div className="contact-page__intro">
            <h1 className="contact-page__title">Tell me about your project</h1>
            <p className="contact-page__lede">
              Send a message and I'll reply by email, usually within a day or two.
            </p>

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

          <div className="contact-page__panel glass">
            <ContactForm fallbackEmail={profile.email} topics={TOPICS} />
          </div>
        </div>
      </main>

      <footer className="contact-page__footer">
        <FooterBar profile={profile} />
      </footer>
    </>
  );
}
