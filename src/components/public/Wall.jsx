import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { supportsWebGL } from "../../lib/webgl.js";
import { AccentedWords } from "./Accented.jsx";
import SceneBoundary from "./SceneBoundary.jsx";
import "./Sections.css";

const loadWall = () => import("./three/ProjectWall.jsx");
const ProjectWall = lazy(loadWall);

/**
 * A pause between the projects and the record: the projects on a curved wall
 * that turns as you scroll, and one line in front of it. The 3D loads as the
 * section approaches; without WebGL the line stands alone.
 */
export default function Wall({ items, line }) {
  const section = useRef(null);
  const [webgl] = useState(supportsWebGL);
  const [near, setNear] = useState(false);

  // Everything the wall needs starts loading as soon as the page is idle: its
  // code, and the screenshots (into the browser cache), so by the time the
  // section is reached they are already there.
  useEffect(() => {
    if (!webgl) return;
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 800));
    const id = idle(() => {
      loadWall();
      items.forEach((p) => {
        if (p.image_url) new Image().src = p.image_url;
      });
      setNear(true);
    });
    return () => (window.cancelIdleCallback ?? clearTimeout)(id);
  }, [webgl, items]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={section} className="wall" aria-label="Project gallery">
      <div className="wall__pin">
        {webgl && near && items.length > 0 && (
          <SceneBoundary fallback={null}>
            <Suspense fallback={null}>
              <ProjectWall projects={items} sectionRef={section} />
            </Suspense>
          </SceneBoundary>
        )}
        {line && (
          <p className="wall__line">
            <AccentedWords text={line} />
          </p>
        )}
      </div>
    </section>
  );
}
