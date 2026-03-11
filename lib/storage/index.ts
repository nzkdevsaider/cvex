import type { Resume } from "@/types/resume";
import type { EnabledOptionalFields, ResumeEntry } from "@/types/storage";

export type { EnabledOptionalFields, ResumeEntry } from "@/types/storage";

const STORAGE_KEY = "cvbuilder_resumes";

// Helpers

function isClient(): boolean {
  return typeof window !== "undefined";
}

function readAll(): Record<string, ResumeEntry> {
  if (!isClient()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ResumeEntry & { title?: string }>;
    for (const entry of Object.values(parsed)) {
      if (!entry.filename) {
        entry.filename = (entry as { title?: string }).title || "Mi currículo";
      }
      if (!entry.tags) {
        entry.tags = [];
      }
    }
    return parsed as Record<string, ResumeEntry>;
  } catch {
    return {};
  }
}

function writeAll(store: Record<string, ResumeEntry>): void {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

// Public API

/** Returns all resume entries sorted by most recently updated. */
export function getResumes(): ResumeEntry[] {
  const store = readAll();
  return Object.values(store).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

/** Returns a single resume entry, or null if not found. */
export function getResume(id: string): ResumeEntry | null {
  const store = readAll();
  return store[id] ?? null;
}

/** Persists updated data for an existing entry. */
export function saveResume(id: string, data: Resume): void {
  const store = readAll();
  if (!store[id]) return;
  store[id] = { ...store[id], data, updatedAt: new Date().toISOString() };
  writeAll(store);
}

/** Deletes a resume entry by ID. */
export function deleteResume(id: string): void {
  const store = readAll();
  delete store[id];
  writeAll(store);
}

/** Creates a new resume from the selected template and returns the new ID. */
export function createResume(templateId: string): string {
  const id = crypto.randomUUID();
  const store = readAll();
  const count = Object.keys(store).length;
  const entry: ResumeEntry = {
    id,
    filename: `Mi currículo #${count + 1}`,
    tags: [],
    templateId,
    updatedAt: new Date().toISOString(),
    data: buildBaseResume(),
  };
  store[id] = entry;
  writeAll(store);
  return id;
}

/** Updates metadata (filename, tags, sectionOrder, enabledOptionalFields, templateId). Does not change data. */
export function updateResumeMeta(
  id: string,
  meta: Partial<Pick<ResumeEntry, "filename" | "tags" | "sectionOrder" | "enabledOptionalFields" | "templateId">>,
): void {
  const store = readAll();
  if (!store[id]) return;
  store[id] = { ...store[id], ...meta, updatedAt: new Date().toISOString() };
  writeAll(store);
}

// Base resume template

function buildBaseResume(): Resume {
  return {
    basics: {
      name: "",
      label: "",
      image: "",
      email: "",
      phone: "",
      url: "",
      summary: "",
      location: {
        address: "",
        postalCode: "",
        city: "",
        countryCode: "",
        region: "",
      },
      profiles: [],
    },
    work: [
      {
        name: "",
        position: "",
        url: "",
        startDate: "",
        endDate: "",
        summary: "",
        highlights: [],
      },
    ],
    volunteer: [],
    education: [
      {
        institution: "",
        url: "",
        area: "",
        studyType: "",
        startDate: "",
        endDate: "",
        score: "",
        courses: [],
      },
    ],
    awards: [],
    certificates: [],
    publications: [],
    skills: [],
    languages: [],
    interests: [],
    references: [],
    projects: [],
  };
}
