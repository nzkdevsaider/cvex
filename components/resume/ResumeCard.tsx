"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { ResumeEntry } from "@/lib/storage";

interface ResumeCardProps {
  entry: ResumeEntry;
  onDelete: (id: string) => void;
}

export function ResumeCard({ entry, onDelete }: ResumeCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const updatedAt = new Date(entry.updatedAt).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const name = entry.data.basics.name || "Sin nombre";
  const label = entry.data.basics.label || "CV sin título";

  return (
    <>
      <Card className="flex flex-col gap-4">
        <CardHeader>
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription className="mt-0.5">{label}</CardDescription>
          </div>
          <span className="badge badge-outline badge-sm ml-auto shrink-0">
            {entry.templateId}
          </span>
        </CardHeader>

        <p className="text-xs opacity-40">Actualizado: {updatedAt}</p>

        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-base-300">
          <Link href={`/edit/${entry.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              Editar
            </Button>
          </Link>
          <Link href={`/view/${entry.id}`} className="flex-1">
            <Button variant="ghost" size="sm" className="w-full">
              Ver PDF
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            aria-label="Eliminar CV"
          >
            ✕
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar este CV?"
        description={`El CV de "${name}" se eliminará permanentemente de este navegador. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        danger
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(entry.id);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
