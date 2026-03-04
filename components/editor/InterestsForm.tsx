"use client";

import {
  useFieldArray,
  Controller,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import type { ResumeSchemaType } from "@/validations/resume";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

interface InterestsFormProps {
  control: Control<ResumeSchemaType>;
  register: UseFormRegister<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
}

export function InterestsForm({
  control,
  register,
  errors,
}: InterestsFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "interests",
  });

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field, index) => {
        const e = errors.interests?.[index];
        return (
          <div
            key={field.id}
            className="rounded-lg border border-base-300 bg-base-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                Interés #{index + 1}
              </span>
              <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                Eliminar
              </Button>
            </div>

            <FormField
              label="Nombre *"
              placeholder="Fotografía"
              error={e?.name}
              {...register(`interests.${index}.name`)}
            />

            <Controller
              control={control}
              name={`interests.${index}.keywords`}
              render={({ field: f }) => (
                <FormField
                  label="Palabras clave"
                  placeholder="Paisajes, Retrato, Analógica"
                  hint="Separadas por comas"
                  value={(f.value ?? []).join(", ")}
                  onChange={(e) =>
                    f.onChange(
                      e.target.value
                        .split(",")
                        .map((k) => k.trim())
                        .filter(Boolean),
                    )
                  }
                />
              )}
            />
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ name: "", keywords: [] })}
      >
        + Añadir interés
      </Button>
    </div>
  );
}
