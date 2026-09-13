import { describe, expect, it } from "vitest";
import { fromFormValues, toFormValues } from "./formUtils.js";
import { ENTITY_CONFIGS } from "./config.js";

const byTable = Object.fromEntries(ENTITY_CONFIGS.map((c) => [c.table, c]));

describe("toFormValues", () => {
  it("fills defaults for a new skill", () => {
    expect(toFormValues(byTable.skills.fields)).toEqual({
      name: "",
      icon: "",
      percent: "80",
      show_in_hero: false,
    });
  });

  it("converts dates to month inputs and keeps arrays", () => {
    const exp = toFormValues(byTable.experience.fields, { start_date: "2023-08-01", end_date: null });
    expect(exp.start_date).toBe("2023-08");
    expect(exp.end_date).toBe("");
    expect(toFormValues(byTable.projects.fields, { tech: ["React"] }).tech).toEqual(["React"]);
  });
});

describe("fromFormValues", () => {
  it("builds a payload with nulls for empty optional fields", () => {
    const { data, errors } = fromFormValues(byTable.experience.fields, {
      company: " ZootechX ",
      role: "Developer",
      logo_url: "",
      start_date: "2026-08",
      end_date: "",
      description: "",
      website_url: "",
    });
    expect(errors).toEqual({});
    expect(data).toEqual({
      company: "ZootechX",
      role: "Developer",
      logo_url: null,
      start_date: "2026-08-01",
      end_date: null,
      description: null,
      website_url: null,
    });
  });

  it("reports required, range and url errors", () => {
    const { errors } = fromFormValues(byTable.skills.fields, { name: "", icon: "", percent: "150", show_in_hero: false });
    expect(errors.name).toMatch(/required/);
    expect(errors.percent).toMatch(/at most 100/);

    const project = fromFormValues(byTable.projects.fields, { title: "X", tech: [], github_url: "github.com/x" });
    expect(project.errors.github_url).toMatch(/https?/);
  });

  it("runs the config's cross-field validation", () => {
    const { errors } = fromFormValues(
      byTable.experience.fields,
      { company: "A", role: "B", start_date: "2024-05", end_date: "2023-01" },
      byTable.experience.validate,
    );
    expect(errors.end_date).toMatch(/after the start/);
  });

  it("trims and drops empty tags", () => {
    const { data } = fromFormValues(byTable.projects.fields, { title: "X", tech: [" React ", "", "Vite"] });
    expect(data.tech).toEqual(["React", "Vite"]);
  });
});
