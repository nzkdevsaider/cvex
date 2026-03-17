export interface TemplateFieldUsage {
  basicsOptional: string[];
  sectionsAdditional: Partial<Record<SectionKey, string[]>>;
  /**
   * Which top-level sections the template explicitly renders.
   * `null` means the template supports all sections (uses `_sectionOrder`/`renderSection`).
   * An array means only those section keys are rendered by the template.
   */
  templateSections: SectionKey[] | null;
}

/**
 * Keys for all orderable sections in a resume.
 * The basics header is always fixed at the top and is not part of this order.
 */
export type SectionKey =
  | "work"
  | "education"
  | "volunteer"
  | "skills"
  | "languages"
  | "awards"
  | "certificates"
  | "projects"
  | "interests"
  | "references"
  | "publications";

/** Default rendering order used when no custom order is stored. */
export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "work",
  "education",
  "skills",
  "languages",
  "volunteer",
  "awards",
  "certificates",
  "projects",
  "interests",
  "references",
  "publications",
];

/**
 * A built-in LaTeX resume template defined as a Handlebars source string.
 *
 * To add a new built-in template:
 *   1. Create `lib/latex/builtin/<your-id>.json` with the template source
 *   2. Call `registerTemplate({ id, name, description, preview, templateSource })` in `lib/latex/registry.ts`
 *   3. Import the JSON file in `lib/latex/templates.ts` and register it
 *
 * The same Handlebars helpers available for external templates are available here:
 *   - `{{escapeLaTeX value}}` — escapes LaTeX special characters
 *   - `{{formatDate date}}` — formats ISO date to "mes. año"
 *   - `{{join array separator}}` — joins an array with a separator
 *   - `{{notEmpty value}}` — truthy if value is non-empty
 *   - `{{renderSection key}}` — renders a full resume section block (uses _sectionOrder context)
 *
 * Available template context variables same as external templates:
 *   - `basics`, `work`, `education`, `skills`, `languages`, `volunteer`,
 *     `awards`, `certificates`, `projects`, `interests`, `references`, `publications`
 *   - `_sectionOrder` — array of section keys in user-defined order
 */
export interface LatexTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  templateSource: string;
  disabled?: boolean;
}
