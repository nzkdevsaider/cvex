"use client";

import { useCallback, useState } from "react";
import {
  getCollections,
  saveCollection,
  deleteCollection as storageDeleteCollection,
  markUpdateAvailable,
  clearUpdateFlag,
  updateLastChecked,
} from "@/lib/template-collections/storage";
import { syncCollection, checkForUpdates } from "@/lib/template-collections/sync";
import type { TemplateCollection } from "@/lib/template-collections/types";

/** How long to wait between update checks for the same collection (1 hour). */
const CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function useTemplateCollections() {
  const [collections, setCollections] = useState<TemplateCollection[]>(() =>
    typeof window !== "undefined" ? getCollections() : [],
  );
  /** Per-URL syncing state (keyed by sourceUrl) */
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  /** Per-URL error messages (keyed by sourceUrl) */
  const [errors, setErrors] = useState<Record<string, string>>({});

  const refresh = useCallback(() => {
    setCollections(getCollections());
  }, []);

  /**
   * Synchronises a single URL: fetches the manifest + all template files and
   * saves the resulting collection to localStorage.
   * Returns true on success, false on error.
   */
  const addOrSyncUrl = useCallback(async (url: string): Promise<boolean> => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return false;

    setSyncing((prev) => ({ ...prev, [cleanUrl]: true }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[cleanUrl];
      return next;
    });

    try {
      const collection = await syncCollection(cleanUrl);
      saveCollection(collection);
      setCollections(getCollections());
      return true;
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        [cleanUrl]: e instanceof Error ? e.message : String(e),
      }));
      return false;
    } finally {
      setSyncing((prev) => {
        const next = { ...prev };
        delete next[cleanUrl];
        return next;
      });
    }
  }, []);

  /**
   * Synchronises multiple URLs in parallel.
   * URLs that are already saved as collections will be re-synced (updated).
   */
  const syncUrls = useCallback(
    async (urls: string[]) => {
      await Promise.all(urls.map((url) => addOrSyncUrl(url)));
    },
    [addOrSyncUrl],
  );

  const deleteCollection = useCallback((id: string) => {
    storageDeleteCollection(id);
    setCollections(getCollections());
  }, []);

  /**
   * Checks all saved collections for updates, respecting the 1-hour rate limit.
   * Marks `updateAvailable = true` on any collection that has a newer version.
   */
  const checkUpdates = useCallback(async () => {
    const current = getCollections();
    const now = Date.now();

    const toCheck = current.filter((c) => {
      if (c.updateAvailable) return false; // already flagged
      if (!c.lastCheckedAt) return true;
      return now - new Date(c.lastCheckedAt).getTime() > CHECK_INTERVAL_MS;
    });

    for (const collection of toCheck) {
      updateLastChecked(collection.id);
      try {
        const hasUpdate = await checkForUpdates(collection);
        if (hasUpdate) {
          markUpdateAvailable(collection.id);
        }
      } catch {
        // Ignore individual errors
      }
    }

    setCollections(getCollections());
  }, []);

  /**
   * Re-syncs a specific collection (applying its update) and clears the
   * updateAvailable flag on success.
   */
  const applyUpdate = useCallback(
    async (id: string): Promise<boolean> => {
      const collection = getCollections().find((c) => c.id === id);
      if (!collection) return false;
      const success = await addOrSyncUrl(collection.sourceUrl);
      if (success) clearUpdateFlag(id);
      return success;
    },
    [addOrSyncUrl],
  );

  /** Dismisses the update notification for a collection without applying it. */
  const dismissUpdate = useCallback((id: string) => {
    clearUpdateFlag(id);
    setCollections(getCollections());
  }, []);

  return {
    collections,
    syncing,
    errors,
    addOrSyncUrl,
    syncUrls,
    deleteCollection,
    checkUpdates,
    applyUpdate,
    dismissUpdate,
    refresh,
  };
}
