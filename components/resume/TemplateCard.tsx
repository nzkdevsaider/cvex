"use client";

import { Card } from "@/components/ui/Card";
import { ArrowRight } from "lucide-react";

interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  preview: string;
  onClick: (templateId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function TemplateCard({
  id,
  name,
  description,
  preview,
  onClick,
  loading = false,
  disabled = false,
}: TemplateCardProps) {
  return (
    <Card
      hover
      onClick={() => !loading && !disabled && onClick(id)}
      className={`group flex flex-col gap-4 select-none ${loading ? "opacity-50 pointer-events-none" : ""} ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* TODO: Thumbnail generator */}
      <div className="flex h-40 items-center justify-center rounded-lg border border-base-300 bg-base-300 text-5xl overflow-hidden">
        <span className="transition-transform duration-300 group-hover:scale-110 inline-block">
          {preview}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold">{name}</h3>
        <p className="mt-1 text-xs opacity-60">{description}</p>
      </div>

      <span className="mt-auto text-xs font-medium opacity-60 flex items-center gap-1">
        Usar plantilla
        <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">
          {disabled ? "(No disponible)" : <ArrowRight className="w-4 h-4" />}
        </span>
      </span>
    </Card>
  );
}
