import type { Resume } from "@/types/resume";
import type { LatexTemplate, SectionKey } from "./types";

const registry = new Map<string, LatexTemplate>();

/** Register a template. Throws if a template with the same id already exists. */
export function registerTemplate(template: LatexTemplate): void {
  if (registry.has(template.id)) {
    throw new Error(`Template "${template.id}" is already registered.`);
  }
  registry.set(template.id, template);
}

/** Look up a single template by id. Returns undefined if not found. */
export function getTemplate(id: string): LatexTemplate | undefined {
  return registry.get(id);
}

/** Return all registered templates in registration order. */
export function getAllTemplates(): LatexTemplate[] {
  return Array.from(registry.values());
}

/**
 * Generate LaTeX source for the given template id.
 */
export function generateLatexForTemplate(
  templateId: string,
  resume: Resume,
  sectionOrder?: SectionKey[],
): string {
  const template = registry.get(templateId) ?? registry.values().next().value;
  if (!template) {
    throw new Error("No templates registered.");
  }
  return template.generate(resume, sectionOrder);
}
