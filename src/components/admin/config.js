import { getSkillIcon } from "../../data/iconMap.js";
import { formatDateRange, formatYearRange } from "../../lib/format.js";

/**
 * Field types: text, textarea, url, number, month, checkbox, image, tags, icon, select.
 * A select field reads its options from `source.table`.
 * `summary(item)` returns what the list shows for each row.
 */
export const ENTITY_CONFIGS = [
  {
    table: "skills",
    title: "Skills",
    singular: "skill",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, maxLength: 60 },
      { name: "icon", label: "Icon", type: "icon" },
      { name: "percent", label: "Percent", type: "number", required: true, min: 0, max: 100, default: 80 },
      { name: "show_in_hero", label: "Show in hero “Technologies I work with” row", type: "checkbox", default: false },
    ],
    summary: (item) => ({
      title: item.name,
      subtitle: `${item.percent}%${item.show_in_hero ? " · shown in hero" : ""}`,
      icon: getSkillIcon(item.icon),
    }),
  },
  {
    table: "experience",
    title: "Experience",
    singular: "experience",
    fields: [
      { name: "company", label: "Company", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "logo_url", label: "Logo", type: "image", folder: "logos" },
      { name: "start_date", label: "Start month", type: "month", required: true },
      { name: "end_date", label: "End month (leave empty if current)", type: "month" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "website_url", label: "Website URL", type: "url" },
    ],
    validate: (data) =>
      data.end_date && data.start_date && data.end_date < data.start_date
        ? { end_date: "End month must be after the start month." }
        : {},
    summary: (item) => ({
      title: `${item.role} · ${item.company}`,
      subtitle: formatDateRange(item.start_date, item.end_date),
      image: item.logo_url,
    }),
  },
  {
    table: "education",
    title: "Education",
    singular: "education entry",
    fields: [
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "course", label: "Course", type: "text", required: true },
      { name: "logo_url", label: "Logo", type: "image", folder: "logos" },
      { name: "score", label: "Score (e.g. 93.5% or 9.18 / 10 CGPA)", type: "text" },
      { name: "start_year", label: "Start year", type: "number", min: 1950, max: 2100 },
      { name: "end_year", label: "End year", type: "number", min: 1950, max: 2100 },
      { name: "description", label: "About this course (shown when the card is opened)", type: "textarea" },
      { name: "highlights", label: "Highlights (subjects, awards, activities)", type: "tags" },
    ],
    validate: (data) =>
      data.start_year && data.end_year && data.end_year < data.start_year
        ? { end_year: "End year must be after the start year." }
        : {},
    summary: (item) => ({
      title: item.institution,
      subtitle: [item.course, formatYearRange(item.start_year, item.end_year)].filter(Boolean).join(" · "),
      image: item.logo_url,
    }),
  },
  {
    table: "projects",
    title: "Projects",
    singular: "project",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image_url", label: "Screenshot", type: "image", folder: "projects" },
      { name: "tech", label: "Tech tags", type: "tags" },
      { name: "github_url", label: "GitHub URL", type: "url" },
      { name: "live_url", label: "Live URL", type: "url" },
      {
        name: "experience_id",
        label: "Built at (shows under that experience)",
        type: "select",
        source: {
          table: "experience",
          label: (row) => `${row.company} (${row.role})`,
          emptyLabel: "Personal project",
        },
      },
    ],
    summary: (item) => ({
      title: item.title,
      subtitle: (item.tech ?? []).join(", "),
      image: item.image_url,
    }),
  },
];
