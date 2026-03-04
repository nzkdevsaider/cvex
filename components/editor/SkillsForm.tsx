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

interface SkillsFormProps {
  control: Control<ResumeSchemaType>;
  register: UseFormRegister<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
}

export function SkillsForm({ control, register, errors }: SkillsFormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "skills" });

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field, index) => {
        const e = errors.skills?.[index];
        return (
          <div
            key={field.id}
            className="rounded-lg border border-base-300 bg-base-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                Habilidad #{index + 1}
              </span>
              <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                Eliminar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Nombre *"
                placeholder="Programación web"
                error={e?.name}
                {...register(`skills.${index}.name`)}
              />
              <FormField
                label="Nivel"
                placeholder="Avanzado, Experto, Básico…"
                error={e?.level}
                {...register(`skills.${index}.level`)}
              />
            </div>

            <Controller
              control={control}
              name={`skills.${index}.keywords`}
              render={({ field: f }) => (
                <FormField
                  label="Palabras clave"
                  placeholder="JavaScript, TypeScript, React"
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
        onClick={() => append({ name: "", level: "", keywords: [] })}
      >
        + Añadir habilidad
      </Button>
    </div>
  );
}
