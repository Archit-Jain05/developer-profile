import { useEffect, useState } from "react";
import { FiSend } from "react-icons/fi";
import { sendMessage } from "../../lib/messages.js";
import { validateContact } from "../../lib/validation.js";

const EMPTY = { name: "", email: "", message: "", website: "" };
const COOLDOWN_MS = 30_000;

/**
 * Contact form. With `topics`, it shows a topic chooser and a character count,
 * and sends the chosen topic as the first line of the message.
 */
export default function ContactForm({ fallbackEmail, topics }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [coolingDown, setCoolingDown] = useState(false);
  const [topic, setTopic] = useState(topics?.[0] ?? "");

  useEffect(() => {
    if (!coolingDown) return;
    const t = setTimeout(() => setCoolingDown(false), COOLDOWN_MS);
    return () => clearTimeout(t);
  }, [coolingDown]);

  const update = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Honeypot: real people never see or fill the "website" field.
    if (values.website) {
      setStatus("success");
      setValues(EMPTY);
      return;
    }

    setStatus("sending");
    try {
      await sendMessage(topic ? { ...values, message: `${topic}\n\n${values.message}` } : values);
      setStatus("success");
      setValues(EMPTY);
      setCoolingDown(true);
    } catch (err) {
      console.error("[contact] Failed to send message:", err);
      setStatus("error");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {topics && (
        <fieldset className="topic-picker">
          <legend>What's this about?</legend>
          <div className="topic-picker__options">
            {topics.map((option) => (
              <label key={option} className={`topic-chip ${topic === option ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="cf-topic"
                  value={option}
                  checked={topic === option}
                  onChange={() => setTopic(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="field">
        <label htmlFor="cf-name">Name</label>
        <input
          id="cf-name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={update("name")}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "cf-name-err" : undefined}
        />
        {errors.name && <span id="cf-name-err" className="field__error">{errors.name}</span>}
      </div>

      <div className="field">
        <label htmlFor="cf-email">Email</label>
        <input
          id="cf-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update("email")}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "cf-email-err" : undefined}
        />
        {errors.email && <span id="cf-email-err" className="field__error">{errors.email}</span>}
      </div>

      <div className="field">
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          rows={4}
          value={values.message}
          onChange={update("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "cf-message-err" : undefined}
        />
        {topics && (
          <span className="field__count" aria-hidden="true">
            {values.message.length} / 2000
          </span>
        )}
        {errors.message && (
          <span id="cf-message-err" className="field__error">{errors.message}</span>
        )}
      </div>

      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input
          id="cf-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={update("website")}
        />
      </div>

      <button
        type="submit"
        className="btn btn--primary"
        disabled={status === "sending" || coolingDown}
      >
        {status === "sending" ? "Sending…" : "Send message"} <FiSend aria-hidden="true" />
      </button>

      <p className="contact-form__status" role="status" aria-live="polite">
        {status === "success" && (
          <span className="is-success">Thanks! I'll get back to you soon.</span>
        )}
        {status === "error" && (
          <span className="is-error">
            Couldn't send.{" "}
            {fallbackEmail && (
              <>
                Email me directly at <a href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a>.
              </>
            )}
          </span>
        )}
      </p>
    </form>
  );
}
