import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FiMail, FiTrash2 } from "react-icons/fi";
import { supabase } from "../../lib/supabase.js";
import ConfirmDialog from "./ConfirmDialog.jsx";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function MessagesTab() {
  const { refreshUnread } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [loadState, setLoadState] = useState({ state: "loading", message: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setLoadState({ state: "error", message: error.message });
      return;
    }
    setMessages(data);
    setLoadState({ state: "ready", message: "" });
    refreshUnread();
  }, [refreshUnread]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleRead(message) {
    setActionError("");
    const { error } = await supabase
      .from("messages")
      .update({ is_read: !message.is_read })
      .eq("id", message.id);
    if (error) setActionError(`Couldn't update: ${error.message}`);
    await load();
  }

  async function remove(message) {
    setBusy(true);
    setActionError("");
    const { error } = await supabase.from("messages").delete().eq("id", message.id);
    if (error) setActionError(`Couldn't delete: ${error.message}`);
    setConfirmDelete(null);
    setBusy(false);
    await load();
  }

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <section className="admin-panel">
      <header className="admin-panel__head">
        <div>
          <h1>Messages</h1>
          <p className="muted">
            {messages.length} total · {unread} unread
          </p>
        </div>
      </header>

      {actionError && (
        <p className="field__error" role="alert">
          {actionError}
        </p>
      )}
      {loadState.state === "loading" && <p className="muted">Loading…</p>}
      {loadState.state === "error" && (
        <p className="field__error" role="alert">
          Couldn't load messages: {loadState.message}
        </p>
      )}
      {loadState.state === "ready" && messages.length === 0 && (
        <p className="muted empty">No messages yet. Submissions from the contact form appear here.</p>
      )}

      <ul className="admin-list">
        {messages.map((m) => (
          <li key={m.id} className={`card message ${m.is_read ? "" : "is-unread"}`}>
            <div className="message__head">
              <div>
                <strong>{m.name}</strong>{" "}
                <a className="link-in" href={`mailto:${m.email}`}>
                  <FiMail aria-hidden="true" /> {m.email}
                </a>
              </div>
              <time className="muted" dateTime={m.created_at}>
                {dateFormat.format(new Date(m.created_at))}
              </time>
            </div>
            <p className="message__body">{m.body}</p>
            <div className="message__actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => toggleRead(m)}>
                Mark as {m.is_read ? "unread" : "read"}
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirmDelete(m)}>
                <FiTrash2 aria-hidden="true" /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this message?"
          message={`The message from ${confirmDelete.name} will be permanently deleted.`}
          confirmLabel="Delete"
          busy={busy}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => remove(confirmDelete)}
        />
      )}
    </section>
  );
}
