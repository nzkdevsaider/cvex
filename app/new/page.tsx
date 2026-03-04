"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TemplateCard } from "@/components/resume/TemplateCard";
import { useResumeList } from "@/hooks/useResumeList";
import { getAllTemplates } from "@/lib/latex/templates";

export default function NewPage() {
  const router = useRouter();
  const { createResume } = useResumeList();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function handleSelect(templateId: string) {
    setLoadingId(templateId);
    const id = createResume(templateId);
    router.push(`/edit/${id}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold">Elige una plantilla</h1>
        <p className="mt-2 text-sm opacity-60">
          ¿Qué mensaje quieres transmitir con tu CV? Elige la plantilla que
          mejor se adapte a tu estilo y al puesto que deseas conseguir.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {getAllTemplates().map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            onClick={handleSelect}
            loading={loadingId === t.id}
          />
        ))}
      </div>
    </div>
  );
}
