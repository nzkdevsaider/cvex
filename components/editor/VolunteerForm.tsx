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

interface VolunteerFormProps {
  control: Control<ResumeSchemaType>;
  register: UseFormRegister<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
}

export function VolunteerForm({
  control,
  register,
  errors,
}: VolunteerFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "volunteer",
  });

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field, index) => {
        const e = errors.volunteer?.[index];
        return (
          <div
            key={field.id}
            className="rounded-lg border border-base-300 bg-base-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                Voluntariado #{index + 1}
              </span>
              <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                Eliminar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Organización *"
                placeholder="Cruz Roja"
                error={e?.organization}
                {...register(`volunteer.${index}.organization`)}
              />
              <FormField
                label="Cargo *"
                placeholder="Coordinador/a de eventos"
                error={e?.position}
                {...register(`volunteer.${index}.position`)}
              />
            </div>

            <FormField
              label="URL"
              type="url"
              placeholder="https://organizacion.org"
              error={e?.url}
              {...register(`volunteer.${index}.url`)}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Fecha de inicio *"
                placeholder="2020-06"
                error={e?.startDate}
                {...register(`volunteer.${index}.startDate`)}
              />
              <FormField
                label="Fecha de fin"
                placeholder="Actualidad"
                error={e?.endDate}
                {...register(`volunteer.${index}.endDate`)}
              />
            </div>

            <FormField
              label="Descripción"
              textarea
              rows={3}
              placeholder="Describe tu contribución..."
              error={e?.summary}
              {...register(`volunteer.${index}.summary`)}
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
            organization: "",
            position: "",
            url: "",
            startDate: "",
            endDate: "",
            summary: "",
            highlights: [],
          })
        }
      >
        + Añadir voluntariado
      </Button>
    </div>
  );
}
