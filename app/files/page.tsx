"use client";

import Link from "next/link";
import { useResumeList } from "@/hooks/useResumeList";
import { ResumeCard } from "@/components/resume/ResumeCard";
import { Button } from "@/components/ui/Button";

export default function FilesPage() {
  const { resumes, deleteResume } = useResumeList();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
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
          <span className="text-5xl">&#128196;</span>
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
          {resumes.map((entry) => (
            <ResumeCard key={entry.id} entry={entry} onDelete={deleteResume} />
          ))}
        </div>
      )}
    </div>
  );
}
