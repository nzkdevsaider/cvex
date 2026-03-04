import type { Resume } from "@/types/resume";

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
 * A LaTeX resume template.
 *
 * To add a new built-in template:
 *   1. Create `lib/latex/templates/<your-id>.ts`
 *   2. Implement `generate(resume, sectionOrder?) => string`
 *   3. Call `registerTemplate({ id, name, description, preview, generate })` at the bottom of that file
 *   4. Import the file in `lib/latex/templates.ts`
 *
 *  TODO: User-defined templates
 */
export interface LatexTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  generate: (resume: Resume, sectionOrder?: SectionKey[]) => string;
}
