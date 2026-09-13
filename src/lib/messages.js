import { supabase } from "./supabase.js";

/** Store a contact form submission. Throws when not configured or on failure. */
export async function sendMessage({ name, email, message }) {
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase
    .from("messages")
    .insert({ name: name.trim(), email: email.trim(), body: message.trim() });
  if (error) throw error;
}
