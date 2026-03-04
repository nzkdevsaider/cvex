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

interface WorkFormProps {
  control: Control<ResumeSchemaType>;
  register: UseFormRegister<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
}

export function WorkForm({ control, register, errors }: WorkFormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "work" });

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field, index) => {
        const e = errors.work?.[index];
        return (
          <div
            key={field.id}
            className="rounded-lg border border-base-300 bg-base-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                Empleo #{index + 1}
              </span>
              {fields.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                  Eliminar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Empresa / Organización *"
                placeholder="Acme Corp"
                error={e?.name}
                {...register(`work.${index}.name`)}
              />
              <FormField
                label="Cargo *"
                placeholder="Ingeniera Senior"
                error={e?.position}
                {...register(`work.${index}.position`)}
              />
            </div>

            <FormField
              label="URL de la empresa"
              type="url"
              placeholder="https://empresa.com"
              error={e?.url}
              {...register(`work.${index}.url`)}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Fecha de inicio *"
                placeholder="2022-03"
                error={e?.startDate}
                {...register(`work.${index}.startDate`)}
              />
              <FormField
                label="Fecha de fin"
                placeholder="Actualidad"
                error={e?.endDate}
                {...register(`work.${index}.endDate`)}
              />
            </div>

            <FormField
              label="Descripción"
              textarea
              rows={3}
              placeholder="Describe tus responsabilidades..."
              error={e?.summary}
              {...register(`work.${index}.summary`)}
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
            position: "",
            url: "",
            startDate: "",
            endDate: "",
            summary: "",
            highlights: [],
          })
        }
      >
        + Añadir experiencia
      </Button>
    </div>
  );
}
