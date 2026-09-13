import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FiArrowDown, FiArrowUp, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { supabase } from "../../lib/supabase.js";
import { deleteMediaByUrl } from "../../lib/storage.js";
import { swapOrder } from "../../lib/format.js";
import ConfirmDialog from "./ConfirmDialog.jsx";
import EntityForm from "./EntityForm.jsx";

export default function CrudTab({ config }) {
  const { setDirty } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loadState, setLoadState] = useState({ state: "loading", message: "" });
  const [editing, setEditing] = useState(null); // null | "new" | item
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from(config.table)
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      setLoadState({ state: "error", message: error.message });
      return;
    }
    setItems(data);
    setLoadState({ state: "ready", message: "" });
  }, [config.table]);

  useEffect(() => {
    load();
  }, [load]);

  const closeForm = () => {
    setDirty(false);
    setEditing(null);
  };

  async function save(data) {
    if (editing === "new") {
      const nextOrder = items.reduce((max, i) => Math.max(max, i.sort_order ?? 0), 0) + 1;
      const { error } = await supabase.from(config.table).insert({ ...data, sort_order: nextOrder });
      if (error) throw error;
    } else {
      const { error } = await supabase.from(config.table).update(data).eq("id", editing.id);
      if (error) throw error;
    }
    await load();
    // Close shortly after so the "Saved" confirmation is visible.
    setTimeout(closeForm, 500);
  }

  async function move(index, direction) {
    const swapped = swapOrder(items, index, direction);
    if (!swapped) return;
    setBusy(true);
    setActionError("");
    const results = await Promise.all(
      swapped.map((row) =>
        supabase.from(config.table).update({ sort_order: row.sort_order }).eq("id", row.id),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed) setActionError(`Couldn't reorder: ${failed.error.message}`);
    await load();
    setBusy(false);
  }

  async function remove(item) {
    setBusy(true);
    setActionError("");
    const { error } = await supabase.from(config.table).delete().eq("id", item.id);
    if (error) {
      setActionError(`Couldn't delete: ${error.message}`);
    } else {
      config.fields
        .filter((f) => f.type === "image" || f.type === "pdf")
        .forEach((f) => deleteMediaByUrl(item[f.name]));
      if (editing?.id === item.id) closeForm();
      await load();
    }
    setConfirmDelete(null);
    setBusy(false);
  }

  return (
    <section className="admin-panel">
      <header className="admin-panel__head">
        <div>
          <h1>{config.title}</h1>
          <p className="muted">Shown on the site in this order.</p>
        </div>
        {editing === null && (
          <button type="button" className="btn btn--primary" onClick={() => setEditing("new")}>
            <FiPlus aria-hidden="true" /> Add {config.singular}
          </button>
        )}
      </header>

      {editing !== null && (
        <div className="card admin-form-card">
          <h2>{editing === "new" ? `New ${config.singular}` : `Edit ${config.singular}`}</h2>
          <EntityForm
            key={editing === "new" ? "new" : editing.id}
            fields={config.fields}
            item={editing === "new" ? null : editing}
            validate={config.validate}
            submitLabel={editing === "new" ? `Add ${config.singular}` : "Save changes"}
            onSave={save}
            onCancel={closeForm}
            onDirtyChange={setDirty}
          />
        </div>
      )}

      {actionError && (
        <p className="field__error" role="alert">
          {actionError}
        </p>
      )}

      {loadState.state === "loading" && <p className="muted">Loading…</p>}
      {loadState.state === "error" && (
        <p className="field__error" role="alert">
          Couldn't load {config.title.toLowerCase()}: {loadState.message}
        </p>
      )}
      {loadState.state === "ready" && items.length === 0 && (
        <p className="muted empty">No {config.title.toLowerCase()} yet. Add one to show it on the site.</p>
      )}

      <ul className="admin-list">
        {items.map((item, index) => {
          const s = config.summary(item);
          const Icon = s.icon?.icon;
          return (
            <li key={item.id} className={`card admin-row ${editing?.id === item.id ? "is-editing" : ""}`}>
              <div className="admin-row__thumb">
                {Icon ? (
                  <Icon style={{ color: s.icon.color }} aria-hidden="true" />
                ) : s.image ? (
                  <img src={s.image} alt="" />
                ) : (
                  <span aria-hidden="true">{s.title.charAt(0)}</span>
                )}
              </div>
              <div className="admin-row__text">
                <strong>{s.title}</strong>
                {s.subtitle && <span className="muted">{s.subtitle}</span>}
              </div>
              <div className="admin-row__actions">
                <button type="button" className="icon-btn" aria-label="Move up" disabled={busy || index === 0} onClick={() => move(index, -1)}>
                  <FiArrowUp />
                </button>
                <button type="button" className="icon-btn" aria-label="Move down" disabled={busy || index === items.length - 1} onClick={() => move(index, 1)}>
                  <FiArrowDown />
                </button>
                <button type="button" className="icon-btn" aria-label={`Edit ${s.title}`} onClick={() => setEditing(item)}>
                  <FiEdit2 />
                </button>
                <button type="button" className="icon-btn icon-btn--danger" aria-label={`Delete ${s.title}`} disabled={busy} onClick={() => setConfirmDelete(item)}>
                  <FiTrash2 />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete this ${config.singular}?`}
          message={`“${config.summary(confirmDelete).title}” will be removed from the site. This can't be undone.`}
          confirmLabel="Delete"
          busy={busy}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => remove(confirmDelete)}
        />
      )}
    </section>
  );
}
