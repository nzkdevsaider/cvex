import type { TemplateFieldUsage } from "@/lib/latex/types";

/**
 * Shape of the manifest.json that a template collection repository must expose.
 *
 * Example:
 * {
 *   "manifestVersion": "1",
 *   "name": "My Collection",
 *   "version": "1.0.0",
 *   "templatesPath": "templates",
 *   "templates": [
 *     { "id": "modern", "name": "Moderno", "description": "...", "preview": "🎨", "file": "modern.json" }
 *   ]
 * }
 *
 * Each file listed under templates/ must be a JSON file with a "template" field
 * containing a Handlebars string:
 * { "template": "\\documentclass{article}\n...{{basics.name}}..." }
 */
export interface ManifestTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  file: string;
}

export interface TemplateCollectionManifest {
  manifestVersion: "1";
  name: string;
  version: string;
  templatesPath: string;
  templates: ManifestTemplate[];
}

export interface ExternalTemplate {
  id: string;
  collectionId: string;
  name: string;
  description: string;
  preview: string;
  templateSource: string;
  /** Field usage derived by parsing the Handlebars templateSource. */
  fieldUsage?: TemplateFieldUsage;
}

export interface TemplateCollection {
  id: string;
  sourceUrl: string;
  name: string;
  version: string;
  lastCommitSha?: string;
  lastSyncedAt: string;
  lastCheckedAt?: string;
  templates: ExternalTemplate[];
  updateAvailable: boolean;
}
