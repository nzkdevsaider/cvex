"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Resume } from "@/types/resume";
import {
  getResume,
  saveResume,
  updateResumeMeta,
  type ResumeEntry,
  type EnabledOptionalFields,
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

  const updateFilename = useCallback(
    (filename: string) => {
      updateResumeMeta(fileId, { filename });
      setEntry((prev) => (prev ? { ...prev, filename } : prev));
    },
    [fileId],
  );

  const updateTags = useCallback(
    (tags: string[]) => {
      updateResumeMeta(fileId, { tags });
      setEntry((prev) => (prev ? { ...prev, tags } : prev));
    },
    [fileId],
  );

  const updateSectionOrder = useCallback(
    (order: string[]) => {
      updateResumeMeta(fileId, { sectionOrder: order });
      setEntry((prev) => (prev ? { ...prev, sectionOrder: order } : prev));
    },
    [fileId],
  );

  const updateEnabledOptionalFields = useCallback(
    (section: string, fields: string[]) => {
      setEntry((prev) => {
        if (!prev) return prev;
        const next: EnabledOptionalFields = {
          ...(prev.enabledOptionalFields ?? {}),
          [section]: fields,
        };
        updateResumeMeta(fileId, { enabledOptionalFields: next });
        return { ...prev, enabledOptionalFields: next };
      });
    },
    [fileId],
  );

  const updateTemplateId = useCallback(
    (templateId: string) => {
      updateResumeMeta(fileId, { templateId });
      setEntry((prev) => (prev ? { ...prev, templateId } : prev));
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
    filename: entry?.filename ?? "",
    tags: entry?.tags ?? [],
    sectionOrder: entry?.sectionOrder,
    enabledOptionalFields: entry?.enabledOptionalFields,
    hydrated: true,
    isSaving,
    hasUnsaved,
    updateResume,
    updateFilename,
    updateTags,
    updateSectionOrder,
    updateEnabledOptionalFields,
    updateTemplateId,
    saveNow,
  };
}
