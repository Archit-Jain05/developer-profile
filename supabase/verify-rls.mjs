// Checks that the database security rules behave as intended, using only the
// public anon key (exactly what a visitor to the site has).
//
// Usage: node --env-file=.env supabase/verify-rls.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (e.g. in .env).");
  process.exit(1);
}

const anon = createClient(url, key, { auth: { persistSession: false } });
let failures = 0;

async function check(name, fn) {
  try {
    const ok = await fn();
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
    if (!ok) failures++;
  } catch (error) {
    console.log(`FAIL  ${name} (threw: ${error.message})`);
    failures++;
  }
}

const CONTENT_TABLES = ["profile", "skills", "experience", "education", "projects"];

for (const table of CONTENT_TABLES) {
  await check(`anon can read ${table}`, async () => {
    const { data, error } = await anon.from(table).select("*").limit(1);
    return !error && data.length === 1;
  });
}

await check("anon cannot insert skills", async () => {
  const { error } = await anon.from("skills").insert({ name: "hacked", percent: 1 });
  return Boolean(error);
});

for (const table of CONTENT_TABLES) {
  await check(`anon update on ${table} changes nothing`, async () => {
    const column = { profile: "full_name", skills: "name", experience: "company", education: "institution", projects: "title" }[table];
    const { data, error } = await anon.from(table).update({ [column]: "hacked" }).neq(column, "hacked").select();
    return Boolean(error) || data.length === 0;
  });

  await check(`anon delete on ${table} removes nothing`, async () => {
    const { data, error } = await anon.from(table).delete().not("id", "is", null).select();
    return Boolean(error) || data.length === 0;
  });
}

await check("anon can submit a contact message", async () => {
  const { error } = await anon
    .from("messages")
    .insert({ name: "RLS check", email: "rls@example.com", body: "Automated security check message." });
  return !error;
});

await check("anon cannot submit a message pre-marked as read", async () => {
  const { error } = await anon
    .from("messages")
    .insert({ name: "RLS check", email: "rls@example.com", body: "Automated security check message.", is_read: true });
  return Boolean(error);
});

await check("anon cannot read messages", async () => {
  const { data, error } = await anon.from("messages").select("*");
  return Boolean(error) || data.length === 0;
});

await check("anon cannot read admins", async () => {
  const { data, error } = await anon.from("admins").select("*");
  return Boolean(error) || data.length === 0;
});

await check("anon cannot upload to media bucket", async () => {
  const { error } = await anon.storage
    .from("media")
    .upload(`rls-check/${Date.now()}.txt`, new Blob(["x"], { type: "image/png" }), { contentType: "image/png" });
  return Boolean(error);
});

await check("anon cannot sign up", async () => {
  const { data, error } = await anon.auth.signUp({ email: `rls-${Date.now()}@example.com`, password: "Sup3r-secret-pass!" });
  return Boolean(error) || !data.user;
});

console.log(failures === 0 ? "\nAll security checks passed." : `\n${failures} check(s) failed.`);
console.log("Note: this adds a test message named \"RLS check\"; delete it from /admin → Messages.");
process.exit(failures === 0 ? 0 : 1);
