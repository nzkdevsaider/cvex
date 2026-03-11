"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { updateResumeMeta } from "@/lib/storage";
import type { ResumeEntry } from "@/lib/storage";
import { Edit, Pencil, Plus, Trash, X } from "lucide-react";

interface ResumeCardProps {
  entry: ResumeEntry;
  onDelete: (id: string) => void;
}

export function ResumeCard({ entry, onDelete }: ResumeCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [editingFilename, setEditingFilename] = useState(false);
  const [filenameValue, setFilenameValue] = useState(entry.filename);
  const filenameInputRef = useRef<HTMLInputElement>(null);

  function commitFilename() {
    const trimmed = filenameValue.trim() || entry.filename;
    setFilenameValue(trimmed);
    setEditingFilename(false);
    if (trimmed !== entry.filename) {
      updateResumeMeta(entry.id, { filename: trimmed });
    }
  }

  function startEditingFilename() {
    setFilenameValue(entry.filename);
    setEditingFilename(true);
    setTimeout(() => filenameInputRef.current?.select(), 0);
  }

  const [tags, setTags] = useState<string[]>(entry.tags ?? []);
  const [addingTag, setAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

  function commitTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const next = [...tags, trimmed];
      setTags(next);
      updateResumeMeta(entry.id, { tags: next });
    }
    setTagInput("");
    setAddingTag(false);
  }

  function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    updateResumeMeta(entry.id, { tags: next });
  }

  function startAddingTag() {
    setAddingTag(true);
    setTimeout(() => tagInputRef.current?.focus(), 0);
  }

  const updatedAt = new Date(entry.updatedAt).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <Card className="flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md">
        {/* Filename */}
        <div className="flex items-start gap-1.5">
          {editingFilename ? (
            <input
              ref={filenameInputRef}
              value={filenameValue}
              onChange={(e) => setFilenameValue(e.target.value)}
              onBlur={commitFilename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitFilename();
                if (e.key === "Escape") {
                  setFilenameValue(entry.filename);
                  setEditingFilename(false);
                }
              }}
              className="input input-sm w-full flex-1 font-semibold"
              autoFocus
            />
          ) : (
            <div className="group flex items-center gap-1.5">
              <button
                type="button"
                onClick={startEditingFilename}
                className="flex-1 text-sm font-semibold leading-snug text-start"
                title="Haz clic para editar el nombre"
              >
                {filenameValue}
              </button>
              <Edit
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-6">
          {tags.map((tag) => (
            <span key={tag} className="badge badge-outline badge-sm gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="opacity-50 hover:opacity-100 transition-opacity"
                aria-label={`Quitar etiqueta ${tag}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}

          {addingTag ? (
            <input
              ref={tagInputRef}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onBlur={commitTag}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTag();
                if (e.key === "Escape") {
                  setTagInput("");
                  setAddingTag(false);
                }
              }}
              placeholder="Nueva etiqueta…"
              className="input input-xs w-28"
            />
          ) : (
            <button
              type="button"
              onClick={startAddingTag}
              className="badge badge-ghost badge-sm gap-0.5 opacity-40 hover:opacity-70 transition-opacity"
              title="Añadir etiqueta"
            >
              <Plus size={10} />
              Etiqueta
            </button>
          )}
        </div>

        {/* Updated at */}
        <div
          className="tooltip inline-block self-start"
          data-tip={`${new Date(entry.updatedAt).toLocaleString()}`}
        >
          <p className="text-xs opacity-40">Actualizado: {updatedAt}</p>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-base-300">
          <Link href={`/edit/${entry.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              <Pencil />
              Editar
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            aria-label="Eliminar CV"
          >
            <Trash />
            Eliminar
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar este CV?"
        description={`"${filenameValue}" se eliminará permanentemente de este navegador. Esta acción no se puede deshacer.`}
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
