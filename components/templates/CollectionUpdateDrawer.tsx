"use client";

import { useRef } from "react";
import type { TemplateCollection } from "@/lib/template-collections/types";
import { Button } from "@/components/ui/Button";

interface CollectionUpdateDrawerProps {
  collections: TemplateCollection[];
  onUpdate: (id: string) => Promise<boolean>;
  onDismiss: (id: string) => void;
  updatingId?: string | null;
}

export function CollectionUpdateDrawer({
  collections,
  onUpdate,
  onDismiss,
  updatingId,
}: CollectionUpdateDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function open() {
    dialogRef.current?.showModal();
  }

  return (
    <>
      {/* Floating notification bar */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        <div className="alert alert-warning shadow-lg flex gap-3 pr-3">
          <span className="text-base">🔔</span>
          <span className="text-sm font-medium">
            {collections.length === 1
              ? `La colección "${collections[0].name}" tiene una actualización disponible.`
              : `${collections.length} colecciones de plantillas tienen actualizaciones.`}
          </span>
          <button className="btn btn-sm btn-warning" onClick={open}>
            Ver
          </button>
        </div>
      </div>

      {/* DaisyUI modal */}
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box w-full max-w-md">
          <h3 className="mb-4 text-lg font-bold">
            Actualizaciones de plantillas
          </h3>

          <div className="flex flex-col gap-3">
            {collections.map((c) => {
              const shortSha = c.lastCommitSha
                ? c.lastCommitSha.substring(0, 7)
                : null;
              const isUpdating = updatingId === c.id;

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-base-300 bg-base-200 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs opacity-50">
                      v{c.version}
                      {shortSha ? ` · ${shortSha}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => onUpdate(c.id)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        "Actualizar"
                      )}
                    </Button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onDismiss(c.id)}
                    >
                      Ignorar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="modal-action mt-4">
            <form method="dialog">
              <button className="btn btn-sm">Cerrar</button>
            </form>
          </div>
        </div>

        {/* Click outside to close */}
        <form method="dialog" className="modal-backdrop">
          <button>cerrar</button>
        </form>
      </dialog>
    </>
  );
}
