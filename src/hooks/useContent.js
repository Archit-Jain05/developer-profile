import { useEffect, useState } from "react";
import { fetchContent, loadContent } from "../lib/content.js";
import { isSupabaseConfigured } from "../lib/supabase.js";
import { fallbackContent } from "../data/fallback.js";

export function useContent() {
  const [state, setState] = useState(() =>
    isSupabaseConfigured
      ? { status: "loading", content: null }
      : { status: "fallback", content: fallbackContent },
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    loadContent({ loader: () => fetchContent(), fallback: fallbackContent }).then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
