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

interface AwardsFormProps {
  control: Control<ResumeSchemaType>;
  register: UseFormRegister<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
}

export function AwardsForm({ control, register, errors }: AwardsFormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "awards" });

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field, index) => {
        const e = errors.awards?.[index];
        return (
          <div
            key={field.id}
            className="rounded-lg border border-base-300 bg-base-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                Premio #{index + 1}
              </span>
              <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                Eliminar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Título *"
                placeholder="Ej: Premio Nacional de Innovación"
                error={e?.title}
                {...register(`awards.${index}.title`)}
              />
              <FormField
                label="Fecha"
                placeholder="2023-05"
                error={e?.date}
                {...register(`awards.${index}.date`)}
              />
            </div>

            <FormField
              label="Entidad que lo otorga"
              placeholder="Ej: Institución, organización, empresa..."
              error={e?.awarder}
              {...register(`awards.${index}.awarder`)}
            />

            <FormField
              label="Descripción"
              textarea
              rows={2}
              placeholder="Ej: Reconocimiento por..."
              error={e?.summary}
              {...register(`awards.${index}.summary`)}
            />
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          append({ title: "", date: "", awarder: "", summary: "" })
        }
      >
        + Añadir premio
      </Button>
    </div>
  );
}
