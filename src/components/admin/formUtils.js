/** Convert a database row into editable form values (strings, booleans, arrays). */
export function toFormValues(fields, item = {}) {
  const values = {};
  for (const field of fields) {
    const raw = item[field.name];
    switch (field.type) {
      case "checkbox":
        values[field.name] = raw ?? field.default ?? false;
        break;
      case "tags":
        values[field.name] = Array.isArray(raw) ? raw : [];
        break;
      case "month":
        values[field.name] = raw ? String(raw).slice(0, 7) : "";
        break;
      case "number":
        values[field.name] = raw ?? field.default ?? "";
        values[field.name] = values[field.name] === "" ? "" : String(values[field.name]);
        break;
      default:
        values[field.name] = raw ?? field.default ?? "";
    }
  }
  return values;
}

const URL_RE = /^https?:\/\/\S+$/i;

/**
 * Convert form values into a database payload and collect validation errors.
 * Empty optional values become null.
 */
export function fromFormValues(fields, values, extraValidate) {
  const data = {};
  const errors = {};

  for (const field of fields) {
    const raw = values[field.name];
    const label = field.label.replace(/\s*\(.*\)$/, "");

    if (field.type === "checkbox") {
      data[field.name] = Boolean(raw);
      continue;
    }
    if (field.type === "tags") {
      data[field.name] = (raw ?? []).map((t) => t.trim()).filter(Boolean);
      continue;
    }

    const text = typeof raw === "string" ? raw.trim() : raw;
    if (text === "" || text === null || text === undefined) {
      if (field.required) errors[field.name] = `${label} is required.`;
      data[field.name] = null;
      continue;
    }

    switch (field.type) {
      case "number": {
        const n = Number(text);
        if (!Number.isInteger(n)) errors[field.name] = `${label} must be a whole number.`;
        else if (field.min !== undefined && n < field.min) errors[field.name] = `${label} must be at least ${field.min}.`;
        else if (field.max !== undefined && n > field.max) errors[field.name] = `${label} must be at most ${field.max}.`;
        data[field.name] = n;
        break;
      }
      case "month":
        if (!/^\d{4}-\d{2}$/.test(text)) errors[field.name] = `${label} must be a month.`;
        data[field.name] = `${text}-01`;
        break;
      case "url":
        if (!URL_RE.test(text)) errors[field.name] = `${label} must start with http:// or https://`;
        data[field.name] = text;
        break;
      default:
        if (field.maxLength && text.length > field.maxLength) {
          errors[field.name] = `${label} must be ${field.maxLength} characters or fewer.`;
        }
        data[field.name] = text;
    }
  }

  if (extraValidate && Object.keys(errors).length === 0) {
    Object.assign(errors, extraValidate(data));
  }

  return { data, errors };
}
