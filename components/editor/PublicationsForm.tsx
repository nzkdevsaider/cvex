"use client";

import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import type { ResumeSchemaType } from "@/validations/resume";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

interface PublicationsFormProps {
  control: Control<ResumeSchemaType>;
  register: UseFormRegister<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
}

export function PublicationsForm({
  control,
  register,
  errors,
}: PublicationsFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "publications",
  });

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field, index) => {
        const e = errors.publications?.[index];
        return (
          <div
            key={field.id}
            className="rounded-lg border border-base-300 bg-base-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                Publicación #{index + 1}
              </span>
              <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                Eliminar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Nombre *"
                placeholder="Optimizing React Performance"
                error={e?.name}
                {...register(`publications.${index}.name`)}
              />
              <FormField
                label="Editorial / Medio"
                placeholder="Dev.to, Medium, IEEE…"
                error={e?.publisher}
                {...register(`publications.${index}.publisher`)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Fecha de publicación"
                placeholder="2024-09"
                error={e?.releaseDate}
                {...register(`publications.${index}.releaseDate`)}
              />
              <FormField
                label="URL"
                type="url"
                placeholder="https://..."
                error={e?.url}
                {...register(`publications.${index}.url`)}
              />
            </div>

            <FormField
              label="Resumen"
              textarea
              rows={2}
              placeholder="Breve descripción del contenido..."
              error={e?.summary}
              {...register(`publications.${index}.summary`)}
            />
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          append({
            name: "",
            publisher: "",
            releaseDate: "",
            url: "",
            summary: "",
          })
        }
      >
        + Añadir publicación
      </Button>
    </div>
  );
}
