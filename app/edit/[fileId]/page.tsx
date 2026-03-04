"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ResumeSchema, type ResumeSchemaType } from "@/validations/resume";
import { useResumeData } from "@/hooks/useResumeData";
import { useLatexWorker } from "@/hooks/useLatexWorker";
import { SectionPanel } from "@/components/resume/SectionPanel";
import { SortableSectionPanel } from "@/components/resume/SortableSectionPanel";
import { BasicsForm } from "@/components/editor/BasicsForm";
import { WorkForm } from "@/components/editor/WorkForm";
import { EducationForm } from "@/components/editor/EducationForm";
import { VolunteerForm } from "@/components/editor/VolunteerForm";
import { SkillsForm } from "@/components/editor/SkillsForm";
import { LanguagesForm } from "@/components/editor/LanguagesForm";
import { AwardsForm } from "@/components/editor/AwardsForm";
import { CertificatesForm } from "@/components/editor/CertificatesForm";
import { ProjectsForm } from "@/components/editor/ProjectsForm";
import { InterestsForm } from "@/components/editor/InterestsForm";
import { ReferencesForm } from "@/components/editor/ReferencesForm";
import { PublicationsForm } from "@/components/editor/PublicationsForm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Resume } from "@/types/resume";

type ViewMode = "form" | "json";

// Section config

const SECTION_CONFIG: Record<
  string,
  { label: string; description: string; emptyEntry?: unknown }
> = {
  work: {
    label: "Experiencia laboral",
    description: "Tus empleos y proyectos profesionales",
    emptyEntry: {
      name: "",
      position: "",
      url: "",
      startDate: "",
      endDate: "",
      summary: "",
      highlights: [],
    },
  },
  education: {
    label: "Formación académica",
    description: "Estudios, diplomas y certificaciones",
    emptyEntry: {
      institution: "",
      area: "",
      studyType: "",
      startDate: "",
      endDate: "",
      score: "",
      courses: [],
    },
  },
  volunteer: {
    label: "Voluntariado",
    description: "Actividades solidarias y sin ánimo de lucro",
    emptyEntry: {
      organization: "",
      position: "",
      url: "",
      startDate: "",
      endDate: "",
      summary: "",
      highlights: [],
    },
  },
  skills: {
    label: "Habilidades",
    description: "Competencias técnicas y blandas",
    emptyEntry: { name: "", level: "", keywords: [] },
  },
  languages: {
    label: "Idiomas",
    description: "Lenguas y nivel de dominio",
    emptyEntry: { language: "", fluency: "" },
  },
  awards: {
    label: "Premios",
    description: "Reconocimientos y distinciones recibidas",
    emptyEntry: { title: "", date: "", awarder: "", summary: "" },
  },
  certificates: {
    label: "Certificados",
    description: "Certificaciones y acreditaciones profesionales",
    emptyEntry: { name: "", date: "", issuer: "", url: "" },
  },
  projects: {
    label: "Proyectos",
    description: "Proyectos personales o en equipo",
    emptyEntry: {
      name: "",
      startDate: "",
      endDate: "",
      description: "",
      highlights: [],
      url: "",
    },
  },
  interests: {
    label: "Intereses",
    description: "Aficiones y actividades personales",
    emptyEntry: { name: "", keywords: [] },
  },
  references: {
    label: "Referencias",
    description: "Personas que pueden avalar tu trabajo",
    emptyEntry: { name: "", reference: "" },
  },
  publications: {
    label: "Publicaciones",
    description: "Artículos, libros o papers publicados",
    emptyEntry: {
      name: "",
      publisher: "",
      releaseDate: "",
      url: "",
      summary: "",
    },
  },
};

const OPTIONAL_KEYS = [
  "volunteer",
  "skills",
  "languages",
  "awards",
  "certificates",
  "projects",
  "interests",
  "references",
  "publications",
] as const;

const DEFAULT_ORDER = ["work", "education"];

const AUTOSAVE_KEY = "cvex:autosave";

export default function EditPage() {
  const params = useParams<{ fileId: string }>();
  const router = useRouter();
  const fileId = params?.fileId ?? "";

  const [autoSave, setAutoSave] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(AUTOSAVE_KEY) !== "false";
  });

  const {
    entry,
    resume,
    hydrated,
    isSaving,
    hasUnsaved,
    updateResume,
    updateSectionOrder,
    saveNow,
  } = useResumeData(fileId, { autoSave });
  const {
    pdfUrl,
    isCompiling,
    isInitializing,
    error: latexError,
    compile,
  } = useLatexWorker();

  const [viewMode, setViewMode] = useState<ViewMode>("form");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_ORDER);
  const sectionOrderRef = useRef<string[]>(DEFAULT_ORDER);

  function setOrder(next: string[]) {
    sectionOrderRef.current = next;
    setSectionOrder(next);
  }

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  /** Save the current form data and immediately re-compile the PDF. */
  function handleSave() {
    saveNow();
    compile(
      form.getValues() as Resume,
      entry?.templateId,
      sectionOrderRef.current,
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sectionOrderRef.current.indexOf(String(active.id));
      const newIndex = sectionOrderRef.current.indexOf(String(over.id));
      const next = arrayMove(sectionOrderRef.current, oldIndex, newIndex);
      setOrder(next);
      updateSectionOrder(next);
      saveNow();
      compile(form.getValues() as Resume, entry?.templateId, next);
    }
  }

  function toggleAutoSave() {
    setAutoSave((prev) => {
      const next = !prev;
      localStorage.setItem(AUTOSAVE_KEY, String(next));
      if (next) handleSave();
      return next;
    });
  }

  const form = useForm<ResumeSchemaType>({
    resolver: zodResolver(ResumeSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (hydrated) {
      if (!entry) {
        router.replace("/files");
        return;
      }
      form.reset(resume as ResumeSchemaType);

      // Restore saved order; extend with any optional sections that already have data
      const saved = entry.sectionOrder ?? [...DEFAULT_ORDER];
      const extra: string[] = [];
      for (const key of OPTIONAL_KEYS) {
        if (!saved.includes(key)) {
          const val = (resume as unknown as Record<string, unknown>)?.[key];
          if (Array.isArray(val) && val.length > 0) extra.push(key);
        }
      }
      setOrder([...saved, ...extra]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    const sub = form.watch((data) => {
      if (!hydrated || !data || viewMode === "json") return;
      updateResume(data as Resume);
    });
    return () => sub.unsubscribe();
  }, [form, hydrated, updateResume, viewMode]);

  useEffect(() => {
    if (!isInitializing && hydrated && resume) {
      compile(resume, entry?.templateId, sectionOrderRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitializing]);

  // Mode switching helpers

  function switchToJson() {
    setJsonText(JSON.stringify(form.getValues(), null, 2));
    setJsonError(null);
    setViewMode("json");
  }

  function applyJson(opts: { thenSwitchToForm?: boolean } = {}) {
    try {
      const parsed = JSON.parse(jsonText) as Resume;
      const result = ResumeSchema.safeParse(parsed);
      if (!result.success) {
        const first = result.error.issues[0];
        setJsonError(`${first.path.join(".")} — ${first.message}`);
        return;
      }
      setJsonError(null);
      form.reset(result.data as ResumeSchemaType);
      updateResume(result.data as Resume);
      compile(
        result.data as Resume,
        entry?.templateId,
        sectionOrderRef.current,
      );
      if (opts.thenSwitchToForm) setViewMode("form");
    } catch {
      setJsonError("JSON inválido: comprueba la sintaxis.");
    }
  }

  function switchToForm() {
    applyJson({ thenSwitchToForm: true });
  }

  function addSection(key: string) {
    const cfg = SECTION_CONFIG[key];
    if (!cfg) return;
    form.setValue(key as never, [cfg.emptyEntry] as never);
    const next = [...sectionOrderRef.current, key];
    setOrder(next);
    updateSectionOrder(next);
  }

  function renderSectionContent(key: string) {
    const p = {
      control: form.control,
      register: form.register,
      errors: form.formState.errors,
    };
    switch (key) {
      case "work":
        return <WorkForm {...p} />;
      case "education":
        return <EducationForm {...p} />;
      case "volunteer":
        return <VolunteerForm {...p} />;
      case "skills":
        return <SkillsForm {...p} />;
      case "languages":
        return <LanguagesForm {...p} />;
      case "awards":
        return <AwardsForm {...p} />;
      case "certificates":
        return <CertificatesForm {...p} />;
      case "projects":
        return <ProjectsForm {...p} />;
      case "interests":
        return <InterestsForm {...p} />;
      case "references":
        return <ReferencesForm {...p} />;
      case "publications":
        return <PublicationsForm {...p} />;
      default:
        return null;
    }
  }

  if (!hydrated) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  const hiddenOptionalKeys = OPTIONAL_KEYS.filter(
    (k) => !sectionOrder.includes(k),
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left panel  */}
      <div className="flex w-1/2 flex-col overflow-y-auto border-r border-base-300">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-base-300 bg-base-200/90 px-5 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Link href="/files">
              <Button variant="ghost" size="sm">
                ← Mis CVs
              </Button>
            </Link>
            <span className="text-xs opacity-40">/</span>
            <span className="text-xs opacity-70">
              {entry?.data.basics.name || "Sin nombre"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Status indicators */}
            {autoSave && isSaving && (
              <span className="text-xs opacity-50">Guardando…</span>
            )}

            {/* View mode toggle */}

            <div role="tablist" className="tabs tabs-boxed tabs-sm">
              <button
                type="button"
                role="tab"
                onClick={() =>
                  viewMode === "json" ? switchToForm() : undefined
                }
                className={[
                  "tab",
                  viewMode === "form" ? "tab-active" : "",
                ].join(" ")}
              >
                Formulario
              </button>
              <button
                type="button"
                role="tab"
                onClick={() =>
                  viewMode === "form" ? switchToJson() : undefined
                }
                className={[
                  "tab",
                  viewMode === "json" ? "tab-active" : "",
                ].join(" ")}
              >
                JSON
              </button>
            </div>

            <div className="divider divider-horizontal" />

            {/* Autosave toggle */}
            <label
              className="flex items-center gap-1.5 cursor-pointer text-xs"
              title={
                autoSave ? "Autoguardado activado" : "Autoguardado desactivado"
              }
            >
              <input
                type="checkbox"
                className="toggle toggle-sm toggle-primary"
                checked={autoSave}
                onChange={toggleAutoSave}
              />
              <span className={autoSave ? "opacity-60" : "opacity-30"}>
                Auto
              </span>
            </label>

            <Button
              size="sm"
              variant="secondary"
              disabled={!hasUnsaved || isSaving || autoSave}
              onClick={handleSave}
            >
              {hasUnsaved ? "● Guardar" : "Guardado"}
            </Button>

            {/* <Link href={`/view/${fileId}`}>
              <Button variant="secondary" size="sm">
                Ver PDF
              </Button>
            </Link> */}
          </div>
        </div>

        {/* Form view */}
        {viewMode === "form" && (
          <form
            className="flex flex-col gap-4 px-5 py-6"
            onBlur={autoSave ? handleSave : undefined}
          >
            {/* Basics */}
            <SectionPanel
              title="Datos básicos"
              description="Información personal y de contacto"
            >
              <BasicsForm
                register={form.register}
                errors={form.formState.errors}
              />
            </SectionPanel>

            {/* sortable sections */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sectionOrder}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-4">
                  {sectionOrder.map((key) => {
                    const cfg = SECTION_CONFIG[key];
                    if (!cfg) return null;
                    return (
                      <SortableSectionPanel
                        key={key}
                        id={key}
                        title={cfg.label}
                        description={cfg.description}
                      >
                        {renderSectionContent(key)}
                      </SortableSectionPanel>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>

            {/* optional section buttons */}
            {hiddenOptionalKeys.length > 0 && (
              <div className="rounded-lg border border-dashed border-base-300 p-4">
                <p className="text-xs font-semibold opacity-40 mb-3 uppercase tracking-wider">
                  Añadir sección opcional
                </p>
                <div className="flex flex-wrap gap-2">
                  {hiddenOptionalKeys.map((key) => {
                    const cfg = SECTION_CONFIG[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        className="btn btn-sm btn-outline"
                        title={cfg?.description}
                        onClick={() => addSection(key)}
                      >
                        + {cfg?.label ?? key}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        )}

        {/* JSON view */}
        {viewMode === "json" && (
          <div className="flex flex-1 flex-col gap-3 px-5 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">JSON Resume</p>
                <p className="mt-0.5 text-xs opacity-60">
                  Edita el JSON directamente. Pulsa «Aplicar» para importar los
                  cambios.
                </p>
              </div>
              <Button size="sm" onClick={() => applyJson()}>
                Aplicar
              </Button>
            </div>

            {jsonError && (
              <div role="alert" className="alert alert-error text-xs py-2">
                {jsonError}
              </div>
            )}

            <textarea
              className="textarea textarea-bordered font-mono text-xs flex-1 min-h-[60vh] resize-none w-full"
              spellCheck={false}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setJsonError(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Right panel: PDF preview */}
      <div className="relative flex w-1/2 flex-col bg-base-300">
        {/* Engine initialising overlay */}
        {isInitializing && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-base-300/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <span className="loading loading-spinner loading-lg" />
              <p className="text-sm font-medium">Cargando motor LaTeX…</p>
              <p className="text-xs opacity-50 max-w-xs">
                La primera vez descarga los paquetes TeX desde la red
                <br />
                (~30 s – 2 min). Las siguientes serán instantáneas.
              </p>
            </div>
          </div>
        )}

        {/* Compiling overlay */}
        {!isInitializing && isCompiling && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-base-300/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <span className="loading loading-spinner loading-lg" />
              <span className="text-xs opacity-60">Compilando LaTeX…</span>
            </div>
          </div>
        )}

        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="h-full w-full border-0"
            title="Previsualización del PDF"
          />
        ) : (
          !isInitializing &&
          !isCompiling && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="text-5xl opacity-20">&#128196;</span>
              {latexError ? (
                <p className="text-sm text-error max-w-sm whitespace-pre-wrap">
                  {latexError}
                </p>
              ) : (
                <p className="text-sm opacity-40">
                  Edita tu CV para generar la previsualización.
                </p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
