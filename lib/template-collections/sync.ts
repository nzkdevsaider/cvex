import type {
  ExternalTemplate,
  TemplateCollection,
  TemplateCollectionManifest,
} from "./types";
import { makeCollectionId } from "./storage";
import { parseHandlebarsSource } from "@/lib/latex/field-parser";

/**
 * Resolves a relative path against a base URL string.
 * Works in both browser and Node environments.
 */
function resolveUrl(base: string, relative: string): string {
  const normalizedBase = base.endsWith("/") ? base : base + "/";
  return new URL(relative, normalizedBase).toString();
}

/**
 * Returns true if the URL is a GitHub raw content URL
 * (raw.githubusercontent.com), allowing us to use the GitHub API for
 * commit-SHA-based update checks.
 */
export function isGitHubRawUrl(url: string): boolean {
  return url.includes("raw.githubusercontent.com");
}

/**
 * Extracts {owner, repo, branch} from a raw.githubusercontent.com URL.
 * Returns null for non-GitHub URLs.
 */
function extractGitHubInfo(
  url: string,
): { owner: string; repo: string; branch: string } | null {
  const match = url.match(
    /raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)/,
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2], branch: match[3] };
}

/**
 * Fetches and validates the manifest.json for a collection.
 * `url` can be either the directory URL (manifest.json is appended) or the
 * direct URL to manifest.json itself.
 */
export async function fetchManifest(
  url: string,
): Promise<TemplateCollectionManifest> {
  const manifestUrl = url.endsWith("manifest.json")
    ? url
    : resolveUrl(url, "manifest.json");

  const response = await fetch(manifestUrl);
  if (!response.ok) {
    throw new Error(
      `No se pudo obtener el manifest (${response.status}): ${manifestUrl}`,
    );
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    !("manifestVersion" in data) ||
    !("name" in data) ||
    !("templates" in data) ||
    !Array.isArray((data as Record<string, unknown>).templates)
  ) {
    throw new Error(
      "El manifest.json no tiene el formato esperado (manifestVersion, name, templates requeridos).",
    );
  }

  return data as TemplateCollectionManifest;
}

/**
 * Fetches a single template JSON file and extracts its Handlebars source.
 */
async function fetchTemplateSource(
  baseUrl: string,
  templatesPath: string,
  file: string,
): Promise<string> {
  const fileUrl = resolveUrl(resolveUrl(baseUrl, templatesPath + "/"), file);
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(
      `No se pudo obtener la plantilla (${response.status}): ${fileUrl}`,
    );
  }

  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as Record<string, unknown>).template !== "string"
  ) {
    throw new Error(
      `El archivo de plantilla no tiene el campo "template" requerido: ${fileUrl}`,
    );
  }

  return (data as { template: string }).template;
}

/**
 * Fetches the manifest and all template files from a remote collection,
 * optionally obtaining the latest GitHub commit SHA, and returns a
 * ready-to-save TemplateCollection object.
 */
export async function syncCollection(
  sourceUrl: string,
): Promise<TemplateCollection> {
  const manifest = await fetchManifest(sourceUrl);
  const collectionId = makeCollectionId(sourceUrl);

  const templates: ExternalTemplate[] = await Promise.all(
    manifest.templates.map(async (t) => {
      const templateSource = await fetchTemplateSource(
        sourceUrl,
        manifest.templatesPath,
        t.file,
      );
      return {
        id: t.id,
        collectionId,
        name: t.name,
        description: t.description,
        preview: t.preview,
        templateSource,
        fieldUsage: parseHandlebarsSource(templateSource),
      };
    }),
  );

  // For GitHub repos, grab the latest commit SHA for future update checks.
  let lastCommitSha: string | undefined;
  const ghInfo = extractGitHubInfo(sourceUrl);
  if (ghInfo) {
    try {
      const apiUrl = `https://api.github.com/repos/${ghInfo.owner}/${ghInfo.repo}/commits/${ghInfo.branch}`;
      const resp = await fetch(apiUrl, {
        headers: { Accept: "application/vnd.github.v3+json" },
      });
      if (resp.ok) {
        const commit = (await resp.json()) as { sha: string };
        lastCommitSha = commit.sha;
      }
    } catch {
      // SHA is optional
    }
  }

  return {
    id: collectionId,
    sourceUrl,
    name: manifest.name,
    version: manifest.version,
    lastCommitSha,
    lastSyncedAt: new Date().toISOString(),
    templates,
    updateAvailable: false,
  };
}

/**
 * Checks whether a newer version of the collection is available remotely.
 *
 * - For GitHub raw URLs: compares the current commit SHA against the latest
 *   commit on the same branch via the GitHub API.
 * - For other URLs: re-fetches the manifest and compares the `version` field.
 *
 * Returns true if an update is available, false otherwise (including on errors).
 */
export async function checkForUpdates(
  collection: TemplateCollection,
): Promise<boolean> {
  const ghInfo = extractGitHubInfo(collection.sourceUrl);

  if (ghInfo) {
    try {
      const apiUrl = `https://api.github.com/repos/${ghInfo.owner}/${ghInfo.repo}/commits/${ghInfo.branch}`;
      const resp = await fetch(apiUrl, {
        headers: { Accept: "application/vnd.github.v3+json" },
      });
      if (!resp.ok) return false;
      const commit = (await resp.json()) as { sha: string };
      return commit.sha !== collection.lastCommitSha;
    } catch {
      return false;
    }
  }

  // Non-GitHub: compare manifest version string
  try {
    const manifest = await fetchManifest(collection.sourceUrl);
    return manifest.version !== collection.version;
  } catch {
    return false;
  }
}
