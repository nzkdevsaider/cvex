import type { TemplateFieldUsage, SectionKey } from "./types";

const SECTION_KEYS = new Set<string>([
  "work",
  "education",
  "volunteer",
  "skills",
  "languages",
  "awards",
  "certificates",
  "projects",
  "interests",
  "references",
  "publications",
]);

/**
 * Basics fields that are always shown in the form regardless of template.
 * Only keys NOT in this set can become optional/toggleable.
 */
const BASICS_ALWAYS_SHOWN = new Set<string>([
  "name",
  "label",
  "email",
  "phone",
  "summary",
  "location",
  "location.city",
  "location.region",
  "location.postalCode",
  "location.address",
]);

/**
 * Parses a Handlebars-like template string to determine which optional fields
 * the template supports rendering.
 *
 * Works for both:
 * - Built-in template `meta` strings (simplified syntax with optional explicit closing tags)
 * - Full Handlebars templates from external collections
 *
 * Detected patterns:
 * - `{{basics.X}}` or `{{#if basics.X}}` → basicsOptional << 'X'
 * - `{{#each basics.profiles}}` → basicsOptional << 'profiles'
 * - `{{#each sectionKey}}...{{#each subField}}...` → sectionsAdditional[sectionKey] << 'subField'
 */
export function parseHandlebarsSource(source: string): TemplateFieldUsage {
  if (!source) return { basicsOptional: [], sectionsAdditional: {}, templateSections: null };

  const basicsOptionalSet = new Set<string>();
  const sectionsAdditional: Partial<Record<SectionKey, Set<string>>> = {};

  const topLevelSectionsUsed = new Set<string>();
  // Stack tracking which section(s) we are currently nested inside
  const sectionStack: string[] = [];

  // Extract all {{...}} token contents
  const tokens = [...source.matchAll(/\{\{([\s\S]*?)\}\}/g)].map((m) =>
    m[1].trim(),
  );

  for (const token of tokens) {
    if (token.startsWith("#each ")) {
      const expr = token.slice(6).trim();

      if (expr === "basics.profiles") {
        basicsOptionalSet.add("profiles");
        // basics.profiles is not a SectionKey — don't push to sectionStack
      } else if (expr.startsWith("basics.")) {
        const field = expr.slice(7);
        if (!BASICS_ALWAYS_SHOWN.has(field)) basicsOptionalSet.add(field);
      } else if (SECTION_KEYS.has(expr)) {
        topLevelSectionsUsed.add(expr);
        sectionStack.push(expr);
      } else if (
        sectionStack.length > 0 &&
        !expr.includes(".") &&
        !expr.includes(" ")
      ) {
        // Sub-array inside a section block (e.g. highlights, courses)
        const section = sectionStack[sectionStack.length - 1] as SectionKey;
        if (!sectionsAdditional[section]) {
          sectionsAdditional[section] = new Set();
        }
        sectionsAdditional[section]!.add(expr);
      }
    } else if (token.startsWith("/each")) {
      const rest = token.slice(5).trim();
      if (rest && SECTION_KEYS.has(rest)) {
        // Explicit closing tag (e.g. {{/each work}}) — find and remove that section
        const idx = sectionStack.lastIndexOf(rest);
        if (idx !== -1) sectionStack.splice(idx, 1);
      } else if (sectionStack.length > 0) {
        // Generic {{/each}} — pop the most recent section
        sectionStack.pop();
      }
    } else if (token.startsWith("#if ")) {
      const expr = token.slice(4).trim();
      if (expr.startsWith("basics.")) {
        const field = expr.slice(7);
        if (!BASICS_ALWAYS_SHOWN.has(field)) basicsOptionalSet.add(field);
      }
    } else if (token.startsWith("#unless ")) {
      const expr = token.slice(8).trim();
      if (expr.startsWith("basics.")) {
        const field = expr.slice(7);
        if (!BASICS_ALWAYS_SHOWN.has(field)) basicsOptionalSet.add(field);
      }
    } else if (
      !token.startsWith("/") &&
      !token.startsWith("#") &&
      !token.startsWith("!") &&
      !token.includes(" ") &&
      !token.includes("~")
    ) {
      // Plain expression like {{basics.image}}
      if (token.startsWith("basics.")) {
        const field = token.slice(7);
        if (!BASICS_ALWAYS_SHOWN.has(field)) basicsOptionalSet.add(field);
      }
    }
  }

  // Determine templateSections:
  // If the template uses `_sectionOrder` or `renderSection`, it supports all sections dynamically.
  const isDynamic =
    source.includes("_sectionOrder") || source.includes("renderSection");
  const templateSections: SectionKey[] | null = isDynamic
    ? null
    : ([...topLevelSectionsUsed].filter((k) =>
        SECTION_KEYS.has(k),
      ) as SectionKey[]);

  const result: TemplateFieldUsage = {
    basicsOptional: [...basicsOptionalSet],
    sectionsAdditional: {},
    templateSections,
  };
  for (const [k, v] of Object.entries(sectionsAdditional)) {
    result.sectionsAdditional[k as SectionKey] = [...(v as Set<string>)];
  }
  return result;
}
