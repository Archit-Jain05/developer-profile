# Backend setup (Supabase, free)

This connects the portfolio to a free Supabase project so you can edit everything from `/admin`.
It takes about 15 minutes. Until you finish, the site still works: it shows the bundled
content from `src/data/fallback.js`, and `/admin` shows a "not connected" notice.

## 1. Create the project

1. Sign up at <https://supabase.com> (free, no card needed) and click **New project**.
2. Pick a name (e.g. `portfolio`), set a strong database password (save it in a password manager),
   and choose the region closest to you (e.g. Mumbai).
3. Wait for the project to finish provisioning.

## 2. Create the tables, security rules and storage bucket

1. Open **SQL Editor → New query**.
2. Paste the whole of `supabase/migrations/20260913000000_portfolio_schema.sql` and click **Run**.
3. Open another new query, paste `supabase/seed.sql`, and click **Run**. This fills in your current
   experience, education and projects plus clearly marked `[Placeholder]` content.

## 3. Lock down sign-ups and create your admin login

1. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up".
   (Email provider stays enabled so you can log in.)
2. **Authentication → Users → Add user → Create new user**: enter your email and a strong password,
   and tick **Auto Confirm User**.
3. Copy the new user's **UID** from the users list.
4. In **SQL Editor**, run (replace the UID):

   ```sql
   insert into public.admins (user_id) values ('PASTE-YOUR-USER-UID-HERE');
   ```

Only users listed in `admins` can change content, even if someone else somehow gets an account.

## 4. Connect the site

1. **Project Settings → API Keys**: copy the **Project URL** and the **anon / publishable** key.
   Never use the `service_role` / secret key in this project.
2. In the project root, copy `.env.example` to `.env` and fill both values in.
3. Restart `npm run dev`. The site now loads content from Supabase.
4. Go to <http://localhost:5173/admin>, sign in, and start replacing the placeholders.

## 5. Check the security rules

```bash
npm run verify:rls
```

Every line should say `PASS`. The check leaves one test message named "RLS check" in
**Admin → Messages**; delete it there.

## 6. Keep the free project awake

Supabase pauses free projects after a week with too little database activity. The workflow in
`.github/workflows/supabase-keepalive.yml` queries the database every 3 days.

1. Push the repo to GitHub.
2. **Repo → Settings → Secrets and variables → Actions → New repository secret**, add
   `SUPABASE_URL` and `SUPABASE_ANON_KEY` (same values as `.env`).
3. **Actions → Supabase keep-alive → Run workflow** once to confirm it goes green.

If the project ever does pause, the site automatically shows the bundled content instead of breaking.
Restore the project from the Supabase dashboard.

## 7. Deploy on Vercel (free)

1. Import the GitHub repo at <https://vercel.com/new>. Vercel detects Vite automatically.
2. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Deploy. `vercel.json` makes `/admin` links work after a page refresh.
4. In Supabase **Authentication → URL Configuration**, set **Site URL** to your Vercel URL.

## Local development with Docker (optional)

If Docker Desktop is running you can use a throwaway local Supabase instead of the cloud project:

```bash
npx supabase start          # applies the migration and seed automatically
npx supabase status         # shows the local API URL and anon key for .env
```

Create a local admin user in Studio at <http://127.0.0.1:54323>, then insert its id into `admins`
as in step 3. `npx supabase stop` shuts it down.

## Updating the seed

`supabase/seed.sql` is generated from `src/data/fallback.js`. After editing that file, run
`npm run seed:generate`. Content you edit in `/admin` lives in the database and is not written back
to `fallback.js`.
