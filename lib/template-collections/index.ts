import type { Resume } from "@/types/resume";
import type { SectionKey, TemplateFieldUsage } from "../latex/types";
import { getTemplate, getAllTemplates } from "../latex/templates";
import type { LatexTemplate } from "../latex/types";
import { getCollections } from "./storage";
import { renderExternalTemplate } from "./renderer";
import { parseHandlebarsSource } from "../latex/field-parser";
import type { ExternalTemplate, TemplateCollection } from "./types";

// Template resolution

/**
 * Looks up an external template by its composite id ("{collectionId}:{templateId}").
 * Returns null for built-in ids (no colon) or if not found.
 */
export function resolveExternalTemplate(
  templateId: string,
): ExternalTemplate | null {
  const sepIdx = templateId.indexOf(":");
  if (sepIdx === -1) return null;

  const collectionId = templateId.substring(0, sepIdx);
  const tId = templateId.substring(sepIdx + 1);

  const collections = getCollections();
  const collection = collections.find((c) => c.id === collectionId);
  return collection?.templates.find((t) => t.id === tId) ?? null;
}

/**
 * Generates LaTeX for any template id — built-in or external.
 *
 * Built-in ids are plain strings (e.g. "default").
 * External ids use the form "{collectionId}:{templateId}".
 *
 * Falls back to the first registered built-in if the template is not found.
 */
export function generateLatexForAnyTemplate(
  templateId: string,
  resume: Resume,
  sectionOrder?: SectionKey[],
): string {
  // 1. Look up built-in registry — now uses Handlebars just like externals
  const builtIn = getTemplate(templateId);
  if (builtIn) {
    return renderExternalTemplate(builtIn.templateSource, resume, sectionOrder);
  }

  // 2. Look up external collections
  const external = resolveExternalTemplate(templateId);
  if (external) {
    return renderExternalTemplate(external.templateSource, resume, sectionOrder);
  }

  // 3. Fallback: first available built-in
  const all = getAllTemplates();
  if (all.length > 0) {
    return renderExternalTemplate(all[0].templateSource, resume, sectionOrder);
  }

  throw new Error(`Plantilla no encontrada: ${templateId}`);
}

/**
 * Resolves the TemplateFieldUsage for any template id — built-in or external.
 * Returns empty usage if the template is not found or has no meta info.
 * Both built-in and external templates are parsed the same way from their templateSource.
 */
export function resolveTemplateFieldUsage(
  templateId: string,
): TemplateFieldUsage {
  const empty: TemplateFieldUsage = { basicsOptional: [], sectionsAdditional: {}, templateSections: null };

  // 1. Built-in template — parse from templateSource (same as external)
  const builtIn = getTemplate(templateId);
  if (builtIn) {
    return parseHandlebarsSource(builtIn.templateSource);
  }

  // 2. External template — use pre-computed fieldUsage or parse from source
  const external = resolveExternalTemplate(templateId);
  if (external) {
    return external.fieldUsage ?? parseHandlebarsSource(external.templateSource);
  }

  return empty;
}

// Grouped template listing (for /new page)

export type TemplateGroup =
  | { kind: "builtin"; templates: LatexTemplate[] }
  | {
      kind: "collection";
      collection: TemplateCollection;
      templates: ExternalTemplate[];
    };

/**
 * Returns all available templates grouped for display in the /new page.
 * First group is always the built-in templates; subsequent groups are external
 * collections in alphabetical order.
 */
export function getAllTemplatesGrouped(): TemplateGroup[] {
  const groups: TemplateGroup[] = [];

  const builtIns = getAllTemplates();
  if (builtIns.length > 0) {
    groups.push({ kind: "builtin", templates: builtIns });
  }

  const collections = getCollections();
  for (const collection of collections) {
    if (collection.templates.length > 0) {
      groups.push({
        kind: "collection",
        collection,
        templates: collection.templates,
      });
    }
  }

  return groups;
}

/**
 * Returns the display name for any template id — built-in or external.
 * Falls back to "Plantilla desconocida" if the template cannot be resolved.
 */
export function resolveTemplateName(templateId: string): string {
  const builtIn = getTemplate(templateId);
  if (builtIn) return builtIn.name;

  const external = resolveExternalTemplate(templateId);
  if (external) return external.name;

  return "Plantilla desconocida";
}

// Re-exports for convenience
export { getCollections } from "./storage";
export { syncCollection, checkForUpdates } from "./sync";
export type { ExternalTemplate, TemplateCollection } from "./types";
