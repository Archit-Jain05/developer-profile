import { useEffect, useLayoutEffect } from "react";
import { useNavigationType } from "react-router-dom";
import { useContent } from "../../hooks/useContent.js";
import { useSmoothScroll } from "../../hooks/useSmoothScroll.js";
import Backdrop from "./Backdrop.jsx";
import Loader from "./Loader.jsx";
import Nav from "./Nav.jsx";
import Hero from "./Hero.jsx";
import About from "./About.jsx";
import Work from "./Work.jsx";
import Wall from "./Wall.jsx";
import { EducationRecord, ExperienceRecord } from "./Record.jsx";
import Skills from "./Skills.jsx";
import GitHubActivity from "./GitHubActivity.jsx";
import Contact from "./Contact.jsx";
import ScrollGuide from "./ScrollGuide.jsx";
import "./PublicSite.css";

// Where the visitor was on the home page, kept while they visit another page in
// the same tab so Back can return them there. A reload starts afresh.
let savedScroll = null;

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
  useSmoothScroll();

  // Once the page is built: Back from another page returns to where the
  // visitor was; anything else starts at the top, unless the address points at
  // a section (a link like /#projects from another page).
  const ready = status !== "loading";
  const navigation = useNavigationType();
  useLayoutEffect(() => {
    if (!ready) return;
    if (navigation === "POP" && savedScroll !== null) window.scrollTo(0, savedScroll);
    else if (!window.location.hash) window.scrollTo(0, 0);
  }, [ready, navigation]);
  useLayoutEffect(
    () => () => {
      savedScroll = window.scrollY;
    },
    [],
  );

  useEffect(() => {
    if (profile?.full_name) {
      document.title = `${profile.full_name}, ${(profile.eyebrow || "developer").toLowerCase()}`;
    }
  }, [profile?.full_name, profile?.eyebrow]);

  return (
    <>
      <Backdrop />
      {/* The loader used to wait on the hero's 3D textures as well as the
          content, which held first paint behind WebGL for no reason. It now
          tracks the content only; the scene fades in when it is ready. */}
      <Loader ready={status !== "loading"} />
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <Nav
        resumeUrl={profile?.resume_url}
        name={profile?.full_name}
        githubUrl={profile?.github_url}
        linkedinUrl={profile?.linkedin_url}
        sectionsReady={status !== "loading"}
      />
      {status === "loading" ? (
        <LoadingSkeleton />
      ) : (
        <main>
          <Hero profile={profile} experience={content.experience} />
          <div className="sheet">
            <About profile={profile} />
            <Work items={content.projects} experience={content.experience} githubUrl={profile.github_url} />
            <Wall items={content.projects} line={profile.wall_line} />
            <ExperienceRecord items={content.experience} projects={content.projects} />
            <EducationRecord items={content.education} />
            <Skills skills={content.skills} projects={content.projects} statement={profile.skills_statement} />
            <GitHubActivity githubUrl={profile.github_url} />
            <Contact profile={profile} />
          </div>
        </main>
      )}
      <ScrollGuide ready={status !== "loading"} />
    </>
  );
}
