"use client";

import { Card } from "@/components/ui/Card";
import type { LatexTemplate } from "@/lib/latex/templates";

/** @deprecated Import LatexTemplate from @/lib/latex/templates instead */
export type Template = LatexTemplate;

interface TemplateCardProps {
  template: LatexTemplate;
  onClick: (templateId: string) => void;
  loading?: boolean;
}

export function TemplateCard({
  template,
  onClick,
  loading = false,
}: TemplateCardProps) {
  return (
    <Card
      hover
      onClick={() => !loading && onClick(template.id)}
      className={`flex flex-col gap-4 select-none ${loading ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* TODO: Thumbnail generator */}
      <div className="flex h-40 items-center justify-center rounded-lg border border-base-300 bg-base-300 text-5xl">
        {template.preview}
      </div>

      <div>
        <h3 className="text-sm font-semibold">{template.name}</h3>
        <p className="mt-1 text-xs opacity-60">{template.description}</p>
      </div>

      <span className="mt-auto text-xs font-medium opacity-60">
        Usar plantilla →
      </span>
    </Card>
  );
}
