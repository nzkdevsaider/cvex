"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TemplateCard } from "@/components/resume/TemplateCard";
import { useResumeList } from "@/hooks/useResumeList";
import { useTemplateCollections } from "@/hooks/useTemplateCollections";
import { getAllTemplatesGrouped } from "@/lib/template-collections";

export default function NewPage() {
  const router = useRouter();
  const { createResume } = useResumeList();
  const { applyUpdate } = useTemplateCollections();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const groups = getAllTemplatesGrouped();

  function handleSelect(templateId: string) {
    setLoadingId(templateId);
    const id = createResume(templateId);
    router.push(`/edit/${id}`);
  }

  async function handleUpdate(collectionId: string) {
    setUpdatingId(collectionId);
    await applyUpdate(collectionId);
    setUpdatingId(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-10 text-center animate-fade-up">
        <h1 className="text-2xl font-bold">Elige una plantilla</h1>
        <p className="mt-2 text-sm opacity-60">
          ¿Qué mensaje quieres transmitir con tu CV? Elige la plantilla que
          mejor se adapte a tu estilo y al puesto que deseas conseguir.
        </p>
      </div>

      {groups.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-base-content/20 bg-base-200/50 py-24 text-center">
          <span className="text-5xl">📄</span>
          <p className="mt-4 text-sm opacity-60">
            No hay plantillas disponibles.
          </p>
        </div>
      )}

      {groups.map((group, i) => {
        if (group.kind === "builtin") {
          return (
            <section key="builtin" className={i > 0 ? "mt-12" : ""}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide opacity-50">
                Predeterminadas
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {group.templates.map((t, i) => (
                  <div
                    key={t.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${(i + 1) * 80}ms` }}
                  >
                    <TemplateCard
                      id={t.id}
                      name={t.name}
                      description={t.description}
                      preview={t.preview}
                      onClick={handleSelect}
                      loading={loadingId === t.id}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // External collection
        const { collection, templates } = group;
        const shortSha = collection.lastCommitSha
          ? collection.lastCommitSha.substring(0, 7)
          : null;
        const syncedAt = new Date(collection.lastSyncedAt).toLocaleDateString(
          "es-ES",
          { day: "2-digit", month: "short", year: "numeric" },
        );

        return (
          <section key={collection.id} className="mt-12">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold">{collection.name}</h2>
              <span className="badge badge-outline badge-xs">
                v{collection.version}
                {shortSha ? ` · ${shortSha}` : ""}
              </span>
              <span className="text-xs opacity-40">{syncedAt}</span>

              {collection.updateAvailable && (
                <button
                  className="btn btn-xs btn-warning ml-1"
                  onClick={() => handleUpdate(collection.id)}
                  disabled={updatingId === collection.id}
                >
                  {updatingId === collection.id ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    "↑ Actualizar"
                  )}
                </button>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {templates.map((t) => {
                const compositeId = `${collection.id}:${t.id}`;
                return (
                  <TemplateCard
                    key={compositeId}
                    id={compositeId}
                    name={t.name}
                    description={t.description}
                    preview={t.preview}
                    onClick={handleSelect}
                    loading={loadingId === compositeId}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="mt-12 text-center text-xs opacity-40">
        ¿Quieres más plantillas?{" "}
        <Link href="/settings/add-templates-collections" className="link">
          Añade colecciones externas
        </Link>
        .
      </p>
    </div>
  );
}
