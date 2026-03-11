"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";

interface SectionPanelProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  /** Spread onto the drag-handle element to activate @dnd-kit drag */
  dragListeners?: Record<string, unknown>;
  /** Spread onto the drag-handle element for accessibility attributes */
  dragAttributes?: Record<string, unknown>;
  /** Whether the section can be deleted. Pass false to show the option disabled (e.g. basics). */
  canDelete?: boolean;
  onDelete?: () => void;
  /** Whether the template supports additional optional fields for this section. */
  hasOptionalFields?: boolean;
  onAddOptionalFields?: () => void;
}

export function SectionPanel({
  title,
  description,
  defaultOpen = true,
  children,
  dragListeners,
  dragAttributes,
  canDelete,
  onDelete,
  hasOptionalFields,
  onAddOptionalFields,
}: SectionPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`collapse collapse-arrow bg-base-200 border border-base-300 rounded-xl ${
        open ? "collapse-open" : "collapse-close"
      }`}
    >
      {/* Header */}
      <div className="collapse-title flex items-center py-4 px-5 min-h-0 gap-2">
        {/* Drag handle */}
        {dragListeners && (
          <button
            type="button"
            className="cursor-grab touch-none shrink-0 opacity-40 hover:opacity-80 focus:outline-none transition-all duration-150 hover:scale-110"
            {...dragListeners}
            {...dragAttributes}
            aria-label="Reordenar sección"
          >
            {/* 6-dot */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="5" cy="3" r="1.5" />
              <circle cx="11" cy="3" r="1.5" />
              <circle cx="5" cy="8" r="1.5" />
              <circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="13" r="1.5" />
              <circle cx="11" cy="13" r="1.5" />
            </svg>
          </button>
        )}

        {/* Clickable title area */}
        <div
          className="flex flex-col flex-1 cursor-pointer"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-sm font-semibold">{title}</span>
          {description && (
            <p className="mt-0.5 text-xs opacity-60">{description}</p>
          )}
        </div>

        {/* Section options menu (3-dots) */}
        {canDelete !== undefined && (
          <div
            className="dropdown dropdown-end shrink-0 mr-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-xs"
              aria-label="Opciones de sección"
            >
              <MoreVertical size={14} />
              Más opciones
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-1 shadow-lg border border-base-300 text-sm"
            >
              <li>
                <button
                  type="button"
                  className={
                    !hasOptionalFields ? "opacity-40 cursor-not-allowed" : ""
                  }
                  disabled={!hasOptionalFields}
                  onClick={hasOptionalFields ? onAddOptionalFields : undefined}
                >
                  Añadir campo adicional
                </button>
              </li>
              <li>
                <hr className="my-0.5 border-base-300" />
              </li>
              <li>
                <button
                  type="button"
                  className={
                    !canDelete
                      ? "opacity-40 cursor-not-allowed"
                      : "text-error hover:bg-error/10"
                  }
                  disabled={!canDelete}
                  onClick={canDelete ? onDelete : undefined}
                >
                  Eliminar sección
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="collapse-content px-5 pb-4">{children}</div>
    </div>
  );
}
