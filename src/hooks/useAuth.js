import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

async function checkAdmin(userId) {
  const { data, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

/**
 * Session + admin status.
 * status: "loading" | "signed-out" | "not-admin" | "admin" | "error"
 */
export function useAuth() {
  const [state, setState] = useState({ status: "loading", user: null });

  useEffect(() => {
    let cancelled = false;

    async function resolve(session) {
      if (!session?.user) {
        if (!cancelled) setState({ status: "signed-out", user: null });
        return;
      }
      try {
        const admin = await checkAdmin(session.user.id);
        if (!cancelled) setState({ status: admin ? "admin" : "not-admin", user: session.user });
      } catch (error) {
        console.error("[auth] Admin check failed:", error);
        if (!cancelled) setState({ status: "error", user: session.user });
      }
    }

    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        // Defer so Supabase finishes its own auth work before we query.
        setTimeout(() => resolve(session), 0);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signOut() {
  return supabase.auth.signOut();
}
