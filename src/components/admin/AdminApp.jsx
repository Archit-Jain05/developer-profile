import { Navigate, Route, Routes } from "react-router-dom";
import { isSupabaseConfigured } from "../../lib/supabase.js";
import { useAuth, signOut } from "../../hooks/useAuth.js";
import Login from "./Login.jsx";
import AdminLayout from "./AdminLayout.jsx";
import ProfileTab from "./ProfileTab.jsx";
import CrudTab from "./CrudTab.jsx";
import MessagesTab from "./MessagesTab.jsx";
import { ENTITY_CONFIGS } from "./config.js";
import Backdrop from "../public/Backdrop.jsx";
import "./Admin.css";

function Centered({ children }) {
  return (
    <div className="admin-center">
      <div className="glass admin-center__card">{children}</div>
    </div>
  );
}

function NotConfigured() {
  return (
    <Centered>
      <h1>Admin is not connected</h1>
      <p className="muted">
        Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a{" "}
        <code>.env</code> file, then restart the dev server. See <code>supabase/SETUP.md</code>.
      </p>
      <a className="btn btn--ghost" href="/">
        Back to site
      </a>
    </Centered>
  );
}

export default function AdminApp() {
  return (
    <>
      <Backdrop />
      {isSupabaseConfigured ? <ConnectedAdmin /> : <NotConfigured />}
    </>
  );
}

function ConnectedAdmin() {
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <Centered>
        <p className="muted">Checking your session…</p>
      </Centered>
    );
  }

  if (status === "signed-out") {
    return (
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  if (status === "not-admin" || status === "error") {
    return (
      <Centered>
        <h1>{status === "error" ? "Couldn't verify access" : "This account is not an admin"}</h1>
        <p className="muted">
          Signed in as {user?.email}.{" "}
          {status === "error"
            ? "Check your connection and try again."
            : "Add this user's id to the admins table to grant access."}
        </p>
        <button type="button" className="btn btn--ghost" onClick={() => signOut()}>
          Log out
        </button>
      </Centered>
    );
  }

  return (
    <Routes>
      <Route element={<AdminLayout user={user} />}>
        <Route index element={<Navigate to="/admin/profile" replace />} />
        <Route path="login" element={<Navigate to="/admin/profile" replace />} />
        <Route path="profile" element={<ProfileTab />} />
        {ENTITY_CONFIGS.map((config) => (
          <Route
            key={config.table}
            path={config.table}
            element={<CrudTab key={config.table} config={config} />}
          />
        ))}
        <Route path="messages" element={<MessagesTab />} />
        <Route path="*" element={<Navigate to="/admin/profile" replace />} />
      </Route>
    </Routes>
  );
}
