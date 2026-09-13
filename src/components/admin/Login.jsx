import { useState } from "react";
import { signIn } from "../../hooks/useAuth.js";
import logo from "../../assets/pfp.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error: authError } = await signIn(email.trim(), password);
    setBusy(false);
    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Invalid email or password."
          : authError.message,
      );
    }
    // On success useAuth picks up the new session and renders the dashboard.
  }

  return (
    <div className="admin-center">
      <form className="card admin-center__card login" onSubmit={handleSubmit}>
        <img src={logo} alt="" width="40" height="40" />
        <h1>Admin sign in</h1>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            required
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <a className="muted login__back" href="/">
          ← Back to site
        </a>
      </form>
    </div>
  );
}
