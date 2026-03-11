"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SectionPanel } from "./SectionPanel";

interface SortableSectionPanelProps {
  id: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  canDelete?: boolean;
  onDelete?: () => void;
  hasOptionalFields?: boolean;
  onAddOptionalFields?: () => void;
}

export function SortableSectionPanel({
  id,
  title,
  description,
  defaultOpen = true,
  children,
  canDelete,
  onDelete,
  hasOptionalFields,
  onAddOptionalFields,
}: SortableSectionPanelProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionPanel
        title={title}
        description={description}
        defaultOpen={defaultOpen}
        dragListeners={listeners as Record<string, unknown> | undefined}
        dragAttributes={attributes as unknown as Record<string, unknown>}
        canDelete={canDelete}
        onDelete={onDelete}
        hasOptionalFields={hasOptionalFields}
        onAddOptionalFields={onAddOptionalFields}
      >
        {children}
      </SectionPanel>
    </div>
  );
}
