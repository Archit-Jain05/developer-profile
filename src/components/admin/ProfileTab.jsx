import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import { STAT_ICONS } from "../../data/iconMap.js";
import EntityForm from "./EntityForm.jsx";

const PROFILE_FIELDS = [
  { name: "full_name", label: "Full name", type: "text", required: true },
  { name: "eyebrow", label: "Title (e.g. Software Developer, used in the browser tab)", type: "text" },
  { name: "tagline", label: "Tagline (top left of the hero; wrap words in *asterisks* to set them in italics)", type: "text" },
  { name: "intro", label: "Intro (the large statement that opens About; *asterisks* set words in italics)", type: "textarea" },
  {
    name: "hero_image_url",
    label: "Hero photo: yourself with the background removed (transparent PNG or WebP)",
    type: "image",
    folder: "profile",
  },
  {
    name: "about_image_url",
    label: "About photo: a normal photo, shown in the arch beside the intro",
    type: "image",
    folder: "profile",
  },
  { name: "resume_url", label: "Résumé (PDF)", type: "pdf", folder: "resume" },
  { name: "about_heading", label: "Frame heading (the line inside the frame that opens below the hero; *asterisks* set italics)", type: "text" },
  { name: "about_body", label: "About text (blank line between paragraphs)", type: "textarea" },
  { name: "wall_line", label: "Project wall line (in front of the curved wall of projects; *asterisks* set italics)", type: "text" },
  { name: "skills_statement", label: "Skills line (beside the skills groups; *asterisks* set italics)", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "show_phone", label: "Show phone number on the site", type: "checkbox" },
  { name: "github_url", label: "GitHub URL", type: "url" },
  { name: "linkedin_url", label: "LinkedIn URL", type: "url" },
  { name: "hiring_note", label: "Contact note for recruiters (first paragraph in Contact)", type: "textarea" },
  { name: "contact_blurb", label: "Contact note for clients (second paragraph in Contact)", type: "textarea" },
];

// The newest fields need the latest migration; until it has been run, the
// database has no column for them and saving them would fail.
const MIGRATION = "supabase/migrations/20261012000000_redesign_profile.sql";

const STAT_COUNT = 4;

function normaliseStats(stats) {
  const list = Array.isArray(stats) ? stats.slice(0, STAT_COUNT) : [];
  while (list.length < STAT_COUNT) list.push({ value: "", label: "", icon: "star" });
  return list;
}

export default function ProfileTab() {
  const { setDirty } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState([]);
  const [statsDirty, setStatsDirty] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("profile").select("*").eq("id", 1).maybeSingle();
    if (error) {
      setLoadError(error.message);
      return;
    }
    setProfile(data ?? {});
    setStats(normaliseStats(data?.stats));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setDirty(formDirty || statsDirty);
  }, [formDirty, statsDirty, setDirty]);

  const updateStat = (index, key, value) => {
    setStats((list) => list.map((s, i) => (i === index ? { ...s, [key]: value } : s)));
    setStatsDirty(true);
  };

  async function save(data) {
    const cleanStats = stats
      .map((s) => ({ value: s.value.trim(), label: s.label.trim(), icon: s.icon }))
      .filter((s) => s.value || s.label);
    const { data: saved, error } = await supabase
      .from("profile")
      .upsert({ id: 1, ...data, stats: cleanStats })
      .select()
      .single();
    if (error) throw error;
    setProfile(saved);
    setStats(normaliseStats(saved.stats));
    setStatsDirty(false);
  }

  if (loadError) {
    return (
      <p className="field__error" role="alert">
        Couldn't load profile: {loadError}
      </p>
    );
  }
  if (!profile) return <p className="muted">Loading…</p>;

  const fields = PROFILE_FIELDS.filter((field) => field.name in profile);
  const missing = PROFILE_FIELDS.filter((field) => !(field.name in profile));

  return (
    <section className="admin-panel">
      <header className="admin-panel__head">
        <div>
          <h1>Profile</h1>
          <p className="muted">Hero, About, stats and contact details.</p>
        </div>
      </header>

      {missing.length > 0 && (
        <p className="admin-notice" role="status">
          {missing.length === 1 ? "One field is" : `${missing.length} fields are`} hidden until the database is
          updated ({missing.map((f) => f.label.split(" (")[0].split(":")[0]).join(", ")}). Run <code>{MIGRATION}</code> in
          the Supabase SQL Editor, then reload this page.
        </p>
      )}

      <div className="card admin-form-card">
        <EntityForm
          fields={fields}
          item={profile}
          submitLabel="Save profile"
          onSave={save}
          onDirtyChange={setFormDirty}
        >
          {() => (
            <fieldset className="stats-editor">
              <legend>About stats (up to 4)</legend>
              {stats.map((stat, i) => (
                <div key={i} className="stats-editor__row">
                  <div className="field">
                    <label htmlFor={`stat-value-${i}`}>Value</label>
                    <input
                      id={`stat-value-${i}`}
                      type="text"
                      placeholder="4+"
                      value={stat.value}
                      onChange={(e) => updateStat(i, "value", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`stat-label-${i}`}>Label</label>
                    <input
                      id={`stat-label-${i}`}
                      type="text"
                      placeholder="Years building"
                      value={stat.label}
                      onChange={(e) => updateStat(i, "label", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`stat-icon-${i}`}>Icon</label>
                    <select
                      id={`stat-icon-${i}`}
                      value={stat.icon}
                      onChange={(e) => updateStat(i, "icon", e.target.value)}
                    >
                      {Object.keys(STAT_ICONS).map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </fieldset>
          )}
        </EntityForm>
      </div>
    </section>
  );
}
