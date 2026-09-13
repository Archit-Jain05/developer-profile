import { useEffect, useState } from "react";
import { deleteMediaByUrl, uploadMedia } from "../../lib/storage.js";
import { Field } from "./fields.jsx";
import { fromFormValues, toFormValues } from "./formUtils.js";

const FILE_TYPES = ["image", "pdf"];

/**
 * Generic form for a set of field definitions.
 * `onSave(data)` persists the row and should throw on failure.
 */
export default function EntityForm({
  fields,
  item,
  validate,
  submitLabel = "Save",
  onSave,
  onCancel,
  onDirtyChange,
  children,
}) {
  const [values, setValues] = useState(() => toFormValues(fields, item ?? {}));
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const markDirty = () => {
    setDirty(true);
    if (status.state !== "idle") setStatus({ state: "idle", message: "" });
  };

  const setValue = (name) => (value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
    markDirty();
  };

  const pickFile = (name) => (file) => {
    setFiles((f) => ({ ...f, [name]: file }));
    markDirty();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const { data, errors: found } = fromFormValues(fields, values, validate);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus({ state: "error", message: "Please fix the highlighted fields." });
      return;
    }

    setStatus({ state: "saving", message: "Saving…" });
    const uploaded = [];
    try {
      for (const field of fields.filter((f) => FILE_TYPES.includes(f.type))) {
        const file = files[field.name];
        if (file) {
          data[field.name] = await uploadMedia(file, field.folder, field.type);
          uploaded.push(data[field.name]);
        }
      }

      await onSave(data);

      // Old uploads are removed only after the row saved successfully.
      for (const field of fields.filter((f) => FILE_TYPES.includes(f.type))) {
        const before = item?.[field.name];
        if (before && before !== data[field.name]) deleteMediaByUrl(before);
      }

      setValues(toFormValues(fields, data));
      setFiles({});
      setDirty(false);
      setStatus({ state: "saved", message: "Saved ✓" });
    } catch (error) {
      console.error("[admin] Save failed:", error);
      uploaded.forEach((url) => deleteMediaByUrl(url));
      setStatus({ state: "error", message: `Couldn't save: ${error.message ?? "unknown error"}` });
    }
  }

  return (
    <form className="entity-form" onSubmit={handleSubmit} noValidate>
      <div className="entity-form__fields">
        {fields.map((field) => (
          <div key={field.name} className={`entity-form__cell entity-form__cell--${field.type}`}>
            <Field
              field={field}
              value={values[field.name]}
              error={errors[field.name]}
              onChange={setValue(field.name)}
              pendingFile={files[field.name]}
              onPickFile={pickFile(field.name)}
            />
          </div>
        ))}
      </div>

      {children?.({ values, setValue })}

      <div className="entity-form__actions">
        <button type="submit" className="btn btn--primary" disabled={status.state === "saving"}>
          {status.state === "saving" ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <span
          className={`entity-form__status ${status.state === "error" ? "is-error" : ""} ${status.state === "saved" ? "is-success" : ""}`}
          role="status"
          aria-live="polite"
        >
          {status.state !== "saving" && status.message}
        </span>
      </div>
    </form>
  );
}
