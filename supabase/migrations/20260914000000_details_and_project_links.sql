-- Expanded detail views: academic details on education, and projects grouped by experience.
-- Existing row level security policies already cover the new columns.

alter table public.education
  add column description text,
  add column highlights text[] not null default '{}';

alter table public.projects
  add column experience_id uuid references public.experience (id) on delete set null;

create index projects_experience_id_idx on public.projects (experience_id);
