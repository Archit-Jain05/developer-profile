import { useEffect, useState } from "react";
import { signIn } from "../../hooks/useAuth.js";
import logo from "../../assets/pfp.svg";

const MAX_ATTEMPTS = 3;
const LOCK_MS = 15 * 60 * 1000;
const KEY = "admin-login-lock";

/*
 * Three wrong passwords lock the form for 15 minutes. This is a convenience
 * for the honest visitor and slows a casual guesser: it lives in the browser,
 * so a script can skip it. The real brute-force limit is Supabase's own auth
 * rate limit (Authentication > Rate Limits in the dashboard).
 */
function readLock() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? { fails: 0, until: 0 };
  } catch {
    return { fails: 0, until: 0 };
  }
}

function writeLock(lock) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lock));
  } catch {
    // Storage can be refused; the form still works, just without the lock.
  }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [lock, setLock] = useState(readLock);
  const locked = lock.until > now;

  // Counts the lock down, and frees the form when it ends.
  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [locked]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (Date.now() < lock.until) return;
    setError("");
    setBusy(true);
    const { error: authError } = await signIn(email.trim(), password);
    setBusy(false);
    if (authError) {
      const fails = (Date.now() > lock.until && lock.until ? 0 : lock.fails) + 1;
      const next = fails >= MAX_ATTEMPTS ? { fails: 0, until: Date.now() + LOCK_MS } : { fails, until: 0 };
      writeLock(next);
      setLock(next);
      setNow(Date.now());
      setError(
        next.until
          ? ""
          : authError.message === "Invalid login credentials"
            ? `Invalid email or password. ${MAX_ATTEMPTS - fails} attempt${MAX_ATTEMPTS - fails === 1 ? "" : "s"} left.`
            : authError.message,
      );
    } else {
      writeLock({ fails: 0, until: 0 });
    }
    // On success useAuth picks up the new session and renders the dashboard.
  }

  return (
    <div className="admin-center">
      <form className="glass admin-center__card login" onSubmit={handleSubmit}>
        <img src={logo} alt="" width="40" height="40" />
        <h1>Admin sign in</h1>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {locked && (
          <p className="field__error" role="alert">
            Too many attempts. Try again in {Math.ceil((lock.until - now) / 60000)} min.
          </p>
        )}
        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary" disabled={busy || locked}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <a className="muted login__back" href="/">
          ← Back to site
        </a>
      </form>
    </div>
  );
}
