const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate contact form values. Returns a map of field → error message. */
export function validateContact({ name, email, message }) {
  const errors = {};
  const n = (name || "").trim();
  const e = (email || "").trim();
  const m = (message || "").trim();

  if (!n) errors.name = "Please enter your name.";
  else if (n.length > 100) errors.name = "Name must be 100 characters or fewer.";

  if (!e) errors.email = "Please enter your email.";
  else if (e.length > 254 || !EMAIL_RE.test(e)) errors.email = "Please enter a valid email.";

  if (!m) errors.message = "Please enter a message.";
  else if (m.length < 10) errors.message = "Message must be at least 10 characters.";
  else if (m.length > 2000) errors.message = "Message must be 2000 characters or fewer.";

  return errors;
}
