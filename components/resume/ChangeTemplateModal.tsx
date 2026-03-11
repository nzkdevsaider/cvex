"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { TemplateCard } from "@/components/resume/TemplateCard";
import { getAllTemplatesGrouped } from "@/lib/template-collections";

interface ChangeTemplateModalProps {
  open: boolean;
  currentTemplateId: string;
  onSelect: (templateId: string) => void;
  onClose: () => void;
}

export function ChangeTemplateModal({
  open,
  currentTemplateId,
  onSelect,
  onClose,
}: ChangeTemplateModalProps) {
  if (!open) return null;

  const groups = getAllTemplatesGrouped();

  function handleSelect(templateId: string) {
    if (templateId === currentTemplateId) {
      onClose();
      return;
    }
    onSelect(templateId);
  }

  return createPortal(
    <div
      className="modal modal-open z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-template-title"
      onClick={onClose}
    >
      <div
        className="modal-box max-w-3xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div>
            <h2 id="change-template-title" className="text-base font-semibold">
              Cambiar plantilla
            </h2>
            <p className="text-xs opacity-60 mt-0.5">
              Elige una nueva plantilla para tu CV. Los datos se conservan.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-ghost btn-circle"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Template list */}
        <div className="overflow-y-auto flex-1 -mx-6 p-6">
          {groups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl opacity-20">📄</span>
              <p className="mt-3 text-sm opacity-50">No hay plantillas disponibles.</p>
            </div>
          )}

          {groups.map((group, i) => {
            if (group.kind === "builtin") {
              return (
                <section key="builtin" className={i > 0 ? "mt-8" : ""}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide opacity-40">
                    Predeterminadas
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {group.templates.map((t) => {
                      const isActive = t.id === currentTemplateId;
                      return (
                        <div
                          key={t.id}
                          className={`rounded-xl transition-all ${isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-base-100" : ""}`}
                        >
                          <TemplateCard
                            id={t.id}
                            name={t.name}
                            description={
                              isActive
                                ? `${t.description}`
                                : t.description
                            }
                            preview={t.preview}
                            onClick={handleSelect}
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            }

            const { collection, templates } = group;
            return (
              <section key={collection.id} className="mt-8">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="text-xs font-semibold">{collection.name}</h3>
                  <span className="badge badge-outline badge-xs">
                    v{collection.version}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {templates.map((t) => {
                    const compositeId = `${collection.id}:${t.id}`;
                    const isActive = compositeId === currentTemplateId;
                    return (
                      <div
                        key={compositeId}
                        className={`rounded-xl transition-all ${isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-base-100" : ""}`}
                      >
                        <TemplateCard
                          id={compositeId}
                          name={t.name}
                          description={
                            isActive
                              ? `✓ Plantilla actual · ${t.description}`
                              : t.description
                          }
                          preview={t.preview}
                          onClick={handleSelect}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
