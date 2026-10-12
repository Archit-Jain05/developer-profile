import { useEffect, useState } from "react";

/**
 * The id of whichever of `ids` crosses the middle of the screen, or "" when
 * none does (at the top of the page, say). `ready` re-runs the watch once the
 * sections have rendered.
 */
export function useCurrentSection(ids, ready = true) {
  const [current, setCurrent] = useState("");
  const key = ids.join(",");

  useEffect(() => {
    if (!ready) return;
    const list = key.split(",");
    const crossing = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        setCurrent(list.find((id) => crossing.has(id)) ?? "");
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    for (const id of list) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => {
      observer.disconnect();
      setCurrent("");
    };
  }, [key, ready]);

  return current;
}
