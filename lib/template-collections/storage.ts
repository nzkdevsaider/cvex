import type { TemplateCollection } from "./types";

const COLLECTIONS_KEY = "cvex_template_collections";

type Store = Record<string, TemplateCollection>;

function isClient(): boolean {
  return typeof window !== "undefined";
}

function readAll(): Store {
  if (!isClient()) return {};
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function writeAll(store: Store): void {
  if (!isClient()) return;
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(store));
}

/** Returns all saved collections, sorted by name. */
export function getCollections(): TemplateCollection[] {
  return Object.values(readAll()).sort((a, b) => a.name.localeCompare(b.name));
}

/** Returns a single collection by id, or null. */
export function getCollection(id: string): TemplateCollection | null {
  return readAll()[id] ?? null;
}

/** Creates or fully replaces a collection entry. */
export function saveCollection(collection: TemplateCollection): void {
  const store = readAll();
  store[collection.id] = collection;
  writeAll(store);
}

/** Removes a collection by id. */
export function deleteCollection(id: string): void {
  const store = readAll();
  delete store[id];
  writeAll(store);
}

/** Flags a collection as having an update available. */
export function markUpdateAvailable(id: string): void {
  const store = readAll();
  if (!store[id]) return;
  store[id] = { ...store[id], updateAvailable: true };
  writeAll(store);
}

/** Clears the update-available flag after the user dismisses or applies the update. */
export function clearUpdateFlag(id: string): void {
  const store = readAll();
  if (!store[id]) return;
  store[id] = { ...store[id], updateAvailable: false };
  writeAll(store);
}

/** Stamps the lastCheckedAt timestamp to rate-limit update polling. */
export function updateLastChecked(id: string): void {
  const store = readAll();
  if (!store[id]) return;
  store[id] = { ...store[id], lastCheckedAt: new Date().toISOString() };
  writeAll(store);
}

/**
 * Produces a deterministic, filesystem-safe id from a URL.
 * e.g. "https://raw.githubusercontent.com/user/repo/main" -> "raw.githubusercontent.com_user_repo_main"
 */
export function makeCollectionId(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/\/manifest\.json$/, "")
    .replace(/\/+$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .toLowerCase()
    .substring(0, 80);
}
