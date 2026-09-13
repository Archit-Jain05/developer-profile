import { useEffect } from "react";
import { useContent } from "../../hooks/useContent.js";
import Nav from "./Nav.jsx";
import Hero from "./Hero.jsx";
import About from "./About.jsx";
import Skills from "./Skills.jsx";
import Experience from "./Experience.jsx";
import Education from "./Education.jsx";
import Projects from "./Projects.jsx";
import Contact from "./Contact.jsx";
import "./PublicSite.css";

function LoadingSkeleton() {
  return (
    <div className="container site-skeleton" aria-busy="true" aria-label="Loading">
      <div className="skeleton" style={{ height: 24, width: 160 }} />
      <div className="skeleton" style={{ height: 56, width: "70%" }} />
      <div className="skeleton" style={{ height: 56, width: "55%" }} />
      <div className="skeleton" style={{ height: 80, width: "60%" }} />
      <div className="skeleton" style={{ height: 320, width: "100%", marginTop: 40 }} />
    </div>
  );
}

export default function PublicSite() {
  const { status, content } = useContent();
  const profile = content?.profile;

  useEffect(() => {
    if (profile?.full_name) {
      document.title = `${profile.full_name} — ${profile.eyebrow || "Developer"}`;
    }
  }, [profile?.full_name, profile?.eyebrow]);

  return (
    <>
      <Nav resumeUrl={profile?.resume_url} name={profile?.full_name} />
      {status === "loading" ? (
        <LoadingSkeleton />
      ) : (
        <main>
          <Hero profile={profile} skills={content.skills} />
          <About profile={profile} />
          <Skills skills={content.skills} />
          <Experience items={content.experience} />
          <Education items={content.education} />
          <Projects items={content.projects} />
          <Contact profile={profile} />
        </main>
      )}
    </>
  );
}
