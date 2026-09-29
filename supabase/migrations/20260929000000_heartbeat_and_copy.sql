-- 1. Keep-alive heartbeat
--
-- Supabase pauses free projects after a week without activity. A scheduled
-- GitHub Action (.github/workflows/supabase-keepalive.yml) calls
-- public.heartbeat(), which writes one timestamp to a table nobody else reads.
--
-- The table lives in its own schema, `internal`, which the API does not expose:
-- the site, the admin and anyone holding the public anon key cannot see it or
-- touch it directly. The only way in is the function below, which does exactly
-- one thing — bump the timestamp — so granting it to anon is harmless.

create schema if not exists internal;
revoke all on schema internal from public, anon, authenticated;

create table if not exists internal.heartbeat (
  id smallint primary key default 1 check (id = 1),
  beat_at timestamptz not null default now(),
  beats bigint not null default 0
);

insert into internal.heartbeat (id) values (1) on conflict (id) do nothing;

create or replace function public.heartbeat()
returns timestamptz
language sql
security definer
set search_path = ''
as $$
  update internal.heartbeat
     set beat_at = now(), beats = beats + 1
   where id = 1
  returning beat_at;
$$;

revoke all on function public.heartbeat() from public;
grant execute on function public.heartbeat() to anon, authenticated;

-- 2. Copy for the redesigned site
--
-- Replaces the placeholder intro and the two placeholder project descriptions,
-- and reworks stock phrases, using the owner's own content (experience,
-- projects, repositories). Also points the hero at the background-removed
-- portrait, and credits Velora to ZootechX, where it was built.

update public.profile
   set intro = $c$I'm an IT student at DJSCE in Mumbai who builds for real clients alongside my degree: Shopify storefronts, Next.js platforms and a Flutter app. Right now I'm a software developer at ZootechX.$c$,
       about_heading = $c$Building real products since my diploma$c$,
       about_body = $c$I started building for clients during my diploma in Information Technology: a website for Dcyber Techlabs' Africa region, then a year looking after Hophead.co's Shopify and React storefronts. Today I'm studying for my B.Tech at DJSCE and working as a software developer at ZootechX, where I build client platforms like Velora and talk to clients directly about what they need.

I freelance too. ASMAAN, a 3D Shopify storefront for a botanical drink brand, is in pre-launch now. And I build things to learn from, like a capture-the-flag platform set on a 3D island and MoneyMind, a Flutter app that scans bills and turns them into invoices. Next, I want to bring machine learning into the apps I make. If you have a project, or a role where that fits, I'd like to hear about it.$c$,
       contact_blurb = $c$Tell me what you're building and when you need it. I reply by email, usually within a day or two.$c$,
       hero_image_url = '/seed/archit-cutout.webp'
 where id = 1;

update public.projects
   set description = $c$Luxury travel platform for curated journeys, with a departures calendar, enquiries, and an admin for editing itineraries day by day.$c$,
       experience_id = (select id from public.experience where company = 'ZootechX' limit 1)
 where title = 'Velora';

update public.projects
   set description = $c$Capture-the-flag platform with challenges in seven categories, team scoring, hints and a live leaderboard, set on a 3D island.$c$
 where title = 'bb3';
