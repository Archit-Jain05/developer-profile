import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { SKILL_ICONS, getSkillIcon } from "../../data/iconMap.js";
import { acceptFor, validateFile } from "../../lib/storage.js";
import { supabase } from "../../lib/supabase.js";

/**
 * Renders one form field. File fields keep the chosen File in `pendingFiles`
 * so nothing is uploaded until the form is saved.
 */
export function Field({ field, value, error, onChange, pendingFile, onPickFile }) {
  const id = useId();
  const errorId = `${id}-err`;
  const common = {
    id,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
  };

  let control;
  switch (field.type) {
    case "textarea":
      control = <textarea {...common} rows={4} value={value} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "number":
      control = (
        <input
          {...common}
          type="number"
          inputMode="numeric"
          min={field.min}
          max={field.max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "month":
      control = (
        <input {...common} type="month" value={value} onChange={(e) => onChange(e.target.value)} />
      );
      break;
    case "url":
      control = (
        <input
          {...common}
          type="url"
          placeholder="https://"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "checkbox":
      return (
        <label className="check">
          <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span>{field.label}</span>
        </label>
      );
    case "tags":
      control = <TagsInput {...common} value={value} onChange={onChange} />;
      break;
    case "icon":
      control = <IconPicker {...common} value={value} onChange={onChange} />;
      break;
    case "select":
      control = <SourceSelect {...common} source={field.source} value={value} onChange={onChange} />;
      break;
    case "image":
    case "pdf":
      control = (
        <FileInput
          kind={field.type}
          value={value}
          pendingFile={pendingFile}
          onPickFile={onPickFile}
          onClear={() => {
            onPickFile(null);
            onChange("");
          }}
        />
      );
      break;
    default:
      control = (
        <input
          {...common}
          type="text"
          maxLength={field.maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }

  return (
    <div className="field">
      <label htmlFor={id}>
        {field.label}
        {field.required && <span className="req"> *</span>}
      </label>
      {control}
      {error && (
        <span id={errorId} className="field__error">
          {error}
        </span>
      )}
    </div>
  );
}

function TagsInput({ value, onChange, ...rest }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const tag = draft.trim().replace(/,$/, "");
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div className="tags-input">
      {value.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))}>
            <FiX />
          </button>
        </span>
      ))}
      <input
        {...rest}
        type="text"
        placeholder="Type and press Enter"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={add}
      />
    </div>
  );
}

function SourceSelect({ source, value, onChange, ...rest }) {
  const [options, setOptions] = useState(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from(source.table)
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setProblem(error.message);
        else setOptions(data);
      });
    return () => {
      cancelled = true;
    };
  }, [source.table]);

  return (
    <>
      <select {...rest} value={value} disabled={!options} onChange={(e) => onChange(e.target.value)}>
        <option value="">{options ? source.emptyLabel : "Loading…"}</option>
        {options?.map((row) => (
          <option key={row.id} value={row.id}>
            {source.label(row)}
          </option>
        ))}
      </select>
      {problem && <span className="field__error">Couldn't load the list: {problem}</span>}
    </>
  );
}

function IconPicker({ value, onChange, ...rest }) {
  const [query, setQuery] = useState("");
  const current = getSkillIcon(value);
  const CurrentIcon = current.icon;

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.entries(SKILL_ICONS).filter(([, v]) => !q || v.label.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="icon-picker">
      <div className="icon-picker__current">
        <CurrentIcon style={{ color: current.color }} aria-hidden="true" />
        <span>{value ? current.label : "No icon selected"}</span>
      </div>
      <input
        {...rest}
        type="search"
        placeholder="Search icons…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="icon-picker__grid" role="listbox" aria-label="Icons">
        {options.map(([key, { icon: Icon, label, color }]) => (
          <button
            key={key}
            type="button"
            role="option"
            aria-selected={value === key}
            className={value === key ? "is-selected" : ""}
            title={label}
            onClick={() => onChange(key)}
          >
            <Icon style={{ color }} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
        {options.length === 0 && <p className="muted">No icons match.</p>}
      </div>
    </div>
  );
}

function FileInput({ kind, value, pendingFile, onPickFile, onClear }) {
  const inputRef = useRef(null);
  const [problem, setProblem] = useState("");
  const previewUrl = useMemo(() => (pendingFile ? URL.createObjectURL(pendingFile) : null), [pendingFile]);
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);
  const shown = previewUrl || value;

  return (
    <div className="file-input">
      {shown ? (
        kind === "image" ? (
          <img className="file-input__preview" src={shown} alt="Preview" />
        ) : (
          <a className="link-arrow" href={shown} target="_blank" rel="noopener noreferrer">
            {pendingFile ? pendingFile.name : "View current file"}
          </a>
        )
      ) : (
        <div className="file-input__empty muted">No file</div>
      )}
      <div className="file-input__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => inputRef.current?.click()}>
          <FiUpload aria-hidden="true" /> {shown ? "Replace" : "Upload"}
        </button>
        {shown && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClear}>
            <FiTrash2 aria-hidden="true" /> Remove
          </button>
        )}
      </div>
      {pendingFile && <span className="muted file-input__note">Uploads when you save.</span>}
      {problem && <span className="field__error">{problem}</span>}
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={acceptFor(kind)}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const err = validateFile(file, kind);
          setProblem(err ?? "");
          if (!err) onPickFile(file);
        }}
      />
    </div>
  );
}
