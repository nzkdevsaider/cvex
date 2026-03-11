import type { Resume } from "@/types/resume";

/** Per-section record of which optional fields the user has enabled. */
export interface EnabledOptionalFields {
  [section: string]: string[] | undefined;
}

export interface ResumeEntry {
  id: string;
  filename: string;
  tags: string[];
  templateId: string;
  sectionOrder?: string[];
  enabledOptionalFields?: EnabledOptionalFields;
  updatedAt: string; // ISO string
  data: Resume;
}
