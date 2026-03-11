"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useResumeList } from "@/hooks/useResumeList";
import { useTemplateCollections } from "@/hooks/useTemplateCollections";
import { ResumeCard } from "@/components/resume/ResumeCard";
import { CollectionUpdateDrawer } from "@/components/templates/CollectionUpdateDrawer";
import { Button } from "@/components/ui/Button";

export default function FilesPage() {
  const { resumes, deleteResume } = useResumeList();
  const { collections, checkUpdates, applyUpdate, dismissUpdate } =
    useTemplateCollections();

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const collectionsWithUpdates = collections.filter((c) => c.updateAvailable);

  useEffect(() => {
    checkUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpdate(id: string): Promise<boolean> {
    setUpdatingId(id);
    const result = await applyUpdate(id);
    setUpdatingId(null);
    return result;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold">Mis CVs</h1>
          <p className="mt-1 text-sm opacity-60">
            Todos tus currículos guardados localmente en este navegador.
          </p>
        </div>
        <Link href="/new">
          <Button size="md">+ Nuevo CV</Button>
        </Link>
      </div>

      {/* Grid */}
      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-base-content/20 bg-base-200/50 py-24 text-center">
          <span className="text-5xl animate-float inline-block">&#128196;</span>
          <h2 className="mt-4 text-base font-semibold">
            Aún no tienes ningún CV
          </h2>
          <p className="mt-1 text-sm opacity-60">
            Crea tu primer currículum eligiendo una plantilla.
          </p>
          <Link href="/new" className="mt-6">
            <Button>Crear mi primer CV</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((entry, i) => (
            <div
              key={entry.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <ResumeCard entry={entry} onDelete={deleteResume} />
            </div>
          ))}
        </div>
      )}

      {/* Collection update notification */}
      {collectionsWithUpdates.length > 0 && (
        <CollectionUpdateDrawer
          collections={collectionsWithUpdates}
          onUpdate={handleUpdate}
          onDismiss={dismissUpdate}
          updatingId={updatingId}
        />
      )}
    </div>
  );
}
