"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FIELD_LABELS } from "@/lib/latex/field-labels";

interface OptionalFieldsModalProps {
  open: boolean;
  sectionTitle: string;
  availableFields: string[];
  enabledFields: string[];
  onSave: (enabled: string[]) => void;
  onClose: () => void;
}

export function OptionalFieldsModal({
  open,
  sectionTitle,
  availableFields,
  enabledFields,
  onSave,
  onClose,
}: OptionalFieldsModalProps) {
  // Initialized from props on mount. The parent ensures the component
  // remounts (via conditional render) each time a different section is opened,
  // so this always reflects the current enabledFields for that section.
  const [local, setLocal] = useState<string[]>(() => [...enabledFields]);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function toggle(field: string) {
    setLocal((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  }

  return createPortal(
    <div
      className="modal modal-open z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="optional-fields-title"
      onClick={onClose}
    >
      <div
        className="modal-box max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="optional-fields-title"
          className="font-semibold text-base mb-0.5"
        >
          Campos adicionales
        </h3>
        <p className="text-xs opacity-50 mb-4">{sectionTitle}</p>

        {availableFields.length === 0 ? (
          <p className="text-sm opacity-50 text-center py-6">
            Esta plantilla no admite campos adicionales en esta sección.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {availableFields.map((field) => (
              <label
                key={field}
                className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-base-200 transition-colors"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={local.includes(field)}
                  onChange={() => toggle(field)}
                />
                <span className="text-sm">
                  {FIELD_LABELS[field] ?? field}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="modal-action mt-5">
          <button
            ref={cancelRef}
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              onSave(local);
              onClose();
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
