"use client";

import { useState } from "react";

interface SectionPanelProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  /** Spread onto the drag-handle element to activate @dnd-kit drag */
  dragListeners?: Record<string, unknown>;
  /** Spread onto the drag-handle element for accessibility attributes */
  dragAttributes?: Record<string, unknown>;
}

export function SectionPanel({
  title,
  description,
  defaultOpen = true,
  children,
  dragListeners,
  dragAttributes,
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
            className="cursor-grab touch-none shrink-0 opacity-40 hover:opacity-80 focus:outline-none"
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
      </div>

      {/* Body */}
      <div className="collapse-content px-5 pb-4">{children}</div>
    </div>
  );
}
