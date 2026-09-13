import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiAward, FiBookOpen, FiBriefcase, FiExternalLink, FiFolder, FiInbox, FiLogOut, FiUser,
} from "react-icons/fi";
import { signOut } from "../../hooks/useAuth.js";
import { supabase } from "../../lib/supabase.js";
import ConfirmDialog from "./ConfirmDialog.jsx";
import logo from "../../assets/pfp.svg";

const TABS = [
  { to: "/admin/profile", label: "Profile", icon: FiUser },
  { to: "/admin/skills", label: "Skills", icon: FiAward },
  { to: "/admin/experience", label: "Experience", icon: FiBriefcase },
  { to: "/admin/education", label: "Education", icon: FiBookOpen },
  { to: "/admin/projects", label: "Projects", icon: FiFolder },
  { to: "/admin/messages", label: "Messages", icon: FiInbox },
];

export default function AdminLayout({ user }) {
  const navigate = useNavigate();
  const [dirty, setDirty] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);
    if (!error) setUnread(count ?? 0);
  }, []);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const guard = (action) => (e) => {
    if (!dirty) return;
    e.preventDefault();
    setPendingNav(() => action);
  };

  const outletContext = useMemo(() => ({ setDirty, refreshUnread }), [refreshUnread]);

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">
          <img src={logo} alt="" width="26" height="26" />
          <span>Portfolio admin</span>
        </div>
        <nav className="admin__tabs" aria-label="Admin sections">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={guard(() => navigate(to))}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {to === "/admin/messages" && unread > 0 && <span className="badge">{unread}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="admin__footer">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <FiExternalLink aria-hidden="true" /> <span>View site</span>
          </a>
          <button type="button" onClick={() => (dirty ? setPendingNav(() => signOut) : signOut())}>
            <FiLogOut aria-hidden="true" /> <span>Log out</span>
          </button>
          <span className="admin__user" title={user?.email}>
            {user?.email}
          </span>
        </div>
      </aside>

      <main className="admin__main">
        <Outlet context={outletContext} />
      </main>

      {pendingNav && (
        <ConfirmDialog
          title="Discard changes?"
          message="You have unsaved changes. If you leave now they will be lost."
          confirmLabel="Discard"
          onCancel={() => setPendingNav(null)}
          onConfirm={() => {
            const action = pendingNav;
            setPendingNav(null);
            setDirty(false);
            action();
          }}
        />
      )}
    </div>
  );
}
