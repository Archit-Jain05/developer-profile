import { useEffect } from "react";
import { useContent } from "../../hooks/useContent.js";
import Backdrop from "./Backdrop.jsx";
import Loader from "./Loader.jsx";
import Nav from "./Nav.jsx";
import Hero from "./Hero.jsx";
import About from "./About.jsx";
import Skills from "./Skills.jsx";
import Experience from "./Experience.jsx";
import Education from "./Education.jsx";
import Projects from "./Projects.jsx";
import GitHubActivity from "./GitHubActivity.jsx";
import Contact from "./Contact.jsx";
import "./PublicSite.css";

function LoadingSkeleton() {
  return (
    <div className="container site-skeleton" aria-busy="true" aria-label="Loading">
      <div className="skeleton" style={{ height: 28, width: 120 }} />
      <div className="skeleton" style={{ height: 88, width: "72%" }} />
      <div className="skeleton" style={{ height: 40, width: "48%" }} />
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
      <Backdrop />
      {/* The loader used to wait on the hero's 3D textures as well as the
          content, which held first paint behind WebGL for no reason. It now
          tracks the content only; the scene fades in when it is ready. */}
      <Loader ready={status !== "loading"} />
      <Nav
        resumeUrl={profile?.resume_url}
        name={profile?.full_name}
        githubUrl={profile?.github_url}
        linkedinUrl={profile?.linkedin_url}
      />
      {status === "loading" ? (
        <LoadingSkeleton />
      ) : (
        <main>
          <Hero profile={profile} skills={content.skills} experience={content.experience} />
          <About profile={profile} />
          <Education items={content.education} />
          <Experience items={content.experience} projects={content.projects} />
          <Projects items={content.projects} experience={content.experience} />
          <Skills skills={content.skills} projects={content.projects} />
          <GitHubActivity githubUrl={profile.github_url} />
          <Contact profile={profile} />
        </main>
      )}
    </>
  );
}
