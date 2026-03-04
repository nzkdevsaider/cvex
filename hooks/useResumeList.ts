"use client";

import { useCallback, useState } from "react";
import {
  createResume,
  deleteResume,
  getResumes,
  type ResumeEntry,
} from "@/lib/storage";

export function useResumeList() {
  const [resumes, setResumes] = useState<ResumeEntry[]>(() =>
    typeof window !== "undefined" ? getResumes() : [],
  );

  const handleCreate = useCallback((templateId: string): string => {
    const id = createResume(templateId);
    setResumes(getResumes());
    return id;
  }, []);

  const handleDelete = useCallback((id: string): void => {
    deleteResume(id);
    setResumes(getResumes());
  }, []);

  return {
    resumes,
    createResume: handleCreate,
    deleteResume: handleDelete,
  };
}
