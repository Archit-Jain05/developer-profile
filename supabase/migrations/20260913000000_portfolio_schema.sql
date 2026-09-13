-- Portfolio schema: content tables, admin check, row level security, media bucket.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Content tables
-- ---------------------------------------------------------------------------
create table public.profile (
  id int primary key default 1 check (id = 1),
  full_name text not null default '',
  eyebrow text not null default '',
  tagline text not null default '',
  intro text not null default '',
  about_heading text not null default '',
  about_body text not null default '',
  hero_image_url text,
  resume_url text,
  email text not null default '',
  phone text not null default '',
  show_phone boolean not null default true,
  github_url text,
  linkedin_url text,
  contact_blurb text not null default '',
  stats jsonb not null default '[]'::jsonb check (jsonb_typeof(stats) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  icon text,
  percent int not null default 80 check (percent between 0 and 100),
  show_in_hero boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.experience (
  id uuid primary key default gen_random_uuid(),
  company text not null check (char_length(company) >= 1),
  role text not null check (char_length(role) >= 1),
  logo_url text,
  start_date date not null,
  end_date date check (end_date is null or end_date >= start_date),
  description text,
  website_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null check (char_length(institution) >= 1),
  course text not null check (char_length(course) >= 1),
  logo_url text,
  score text,
  start_year int check (start_year between 1950 and 2100),
  end_year int check (end_year between 1950 and 2100),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) >= 1),
  description text,
  image_url text,
  tech text[] not null default '{}',
  github_url text,
  live_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  body text not null check (char_length(body) between 10 and 2000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_created_at_idx on public.messages (created_at desc);

create trigger profile_updated_at before update on public.profile
  for each row execute function public.set_updated_at();
create trigger skills_updated_at before update on public.skills
  for each row execute function public.set_updated_at();
create trigger experience_updated_at before update on public.experience
  for each row execute function public.set_updated_at();
create trigger education_updated_at before update on public.education
  for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.profile enable row level security;
alter table public.skills enable row level security;
alter table public.experience enable row level security;
alter table public.education enable row level security;
alter table public.projects enable row level security;
alter table public.messages enable row level security;

create policy "admins read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Content: everyone reads, only admins write.
do $$
declare
  t text;
begin
  foreach t in array array['profile', 'skills', 'experience', 'education', 'projects'] loop
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end;
$$;

-- Messages: anyone can submit an unread message; only admins read or manage them.
create policy "anyone submits" on public.messages
  for insert to anon, authenticated with check (is_read = false);
create policy "admin read" on public.messages
  for select to authenticated using (public.is_admin());
create policy "admin update" on public.messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.messages
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: public-read media bucket, admin-only writes
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do nothing;

create policy "media admin read" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
