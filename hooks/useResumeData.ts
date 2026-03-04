"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Resume } from "@/types/resume";
import {
  getResume,
  saveResume,
  updateResumeMeta,
  type ResumeEntry,
} from "@/lib/storage";

const DEBOUNCE_MS = 1500;

interface UseResumeDataOptions {
  autoSave?: boolean;
}

export function useResumeData(
  fileId: string,
  { autoSave = true }: UseResumeDataOptions = {},
) {
  const [entry, setEntry] = useState<ResumeEntry | null>(() =>
    typeof window !== "undefined" ? getResume(fileId) : null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestData = useRef<Resume | null>(entry?.data ?? null);

  const updateResume = useCallback(
    (data: Resume) => {
      latestData.current = data;
      setEntry((prev) => (prev ? { ...prev, data } : prev));

      if (autoSave) {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        setIsSaving(true);
        setHasUnsaved(false);
        debounceTimer.current = setTimeout(() => {
          saveResume(fileId, data);
          setIsSaving(false);
        }, DEBOUNCE_MS);
      } else {
        setHasUnsaved(true);
      }
    },
    [fileId, autoSave],
  );

  const saveNow = useCallback(() => {
    if (!latestData.current) return;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    saveResume(fileId, latestData.current);
    setIsSaving(false);
    setHasUnsaved(false);
  }, [fileId]);

  const updateSectionOrder = useCallback(
    (order: string[]) => {
      updateResumeMeta(fileId, { sectionOrder: order });
      setEntry((prev) => (prev ? { ...prev, sectionOrder: order } : prev));
    },
    [fileId],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return {
    entry,
    resume: entry?.data ?? null,
    sectionOrder: entry?.sectionOrder,
    hydrated: true,
    isSaving,
    hasUnsaved,
    updateResume,
    updateSectionOrder,
    saveNow,
  };
}
