-- Project screenshots, and the client sites added as projects.
--
-- The screenshots ship with the site in public/seed/projects/, so deploy the
-- site before running this, or the new images will not load yet.
--
-- Safe to run more than once: ASMAAN's image is only set while it still shows
-- the placeholder, and a project is only added if none has that title yet.
-- Hophead is linked to the Hophead.co role so it appears in that role's
-- details and reads "Built at Hophead.co". Every new project can be edited,
-- reordered or linked to a role in /admin afterwards.

update public.projects
   set image_url = '/seed/projects/asmaan.jpg'
 where title = 'ASMAAN'
   and (image_url is null or image_url = '' or image_url like '%placeholder-project%');

insert into public.projects (title, description, image_url, tech, live_url, experience_id, sort_order)
select v.title, v.description, v.image_url, array['Shopify'], v.live_url,
       (select e.id from public.experience e where e.company = v.company limit 1),
       v.sort_order
  from (values
  ('Hophead', 'Shopify storefront for Hophead, an Indian men''s streetwear label: collections, new arrivals and the brand''s story.', '/seed/projects/hophead.jpg', 'https://hophead.co.in/', 'Hophead.co', 5),
  ('Divara', 'Shopify store for Divara, an Australian fine-jewellery brand: ready-to-ship pieces, engagement and wedding rings, and custom jewellery.', '/seed/projects/divara.jpg', 'https://divara.com.au/', null, 6),
  ('Gut Avatar', 'Shopify store for Gut Avatar, a gut-health brand: products by concern, a book, testimonials and a blog.', '/seed/projects/gutavatar.jpg', 'https://8w6uph-d3.myshopify.com/', null, 7),
  ('Peak', 'Shopify store for Peak, an energy gum brand, with regional currencies and a blog.', '/seed/projects/peak.jpg', 'https://peakenergygum.com/', null, 8),
  ('Youth Global', 'Shopify site for Youth Global, a youth ecosystem linking students with industry through film, music, fashion, courses and internships.', '/seed/projects/youthglobal.jpg', 'https://youthglobalhq.in/', null, 9),
  ('Itara', 'Shopify store for Itara, a jewellery brand of conflict-free natural and lab-grown diamonds, with fine and bespoke collections.', '/seed/projects/itara.jpg', 'https://itarajewelry.in/', null, 10)
  ) as v(title, description, image_url, live_url, company, sort_order)
 where not exists (select 1 from public.projects p where p.title = v.title);
