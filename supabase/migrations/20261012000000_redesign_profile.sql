-- Profile fields for the October 2026 redesign.
--
-- 1. New columns, so the lines the new layout adds can be edited in /admin:
--    the photo in About, the note to recruiters in Contact, the line beside
--    the skills, and the line in front of the curved project wall.
-- 2. Italic accents: the site sets any phrase wrapped in *asterisks* in the
--    serif italic. One phrase each is marked in the tagline, the intro and
--    the heading inside the frame below the hero.
--
-- Safe to run more than once: columns are only added if missing, and text is
-- only filled in where it is still empty or still has no asterisks.

alter table public.profile
  add column if not exists about_image_url text,
  add column if not exists hiring_note text not null default '',
  add column if not exists skills_statement text not null default '',
  add column if not exists wall_line text not null default '';

update public.profile
   set about_image_url = coalesce(about_image_url, '/seed/archit.jpg'),
       hiring_note = case when hiring_note = ''
         then 'Hiring for an internship or a developer role? Send me the details.' else hiring_note end,
       skills_statement = case when skills_statement = ''
         then 'Shopify for stores, Next.js for platforms, *Flutter for apps*.' else skills_statement end,
       wall_line = case when wall_line = ''
         then 'Some for clients. Some *to learn something new*.' else wall_line end
 where id = 1;

update public.profile
   set tagline = replace(tagline, 'web and mobile', '*web and mobile*')
 where id = 1 and tagline not like '%*%';

update public.profile
   set intro = replace(intro, 'for real clients', 'for *real clients*')
 where id = 1 and intro not like '%*%';

update public.profile
   set about_heading = replace(about_heading, 'since my diploma', '*since my diploma*')
 where id = 1 and about_heading not like '%*%';
