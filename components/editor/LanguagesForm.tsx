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

interface LanguagesFormProps {
  control: Control<ResumeSchemaType>;
  register: UseFormRegister<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
}

export function LanguagesForm({
  control,
  register,
  errors,
}: LanguagesFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "languages",
  });

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field, index) => {
        const e = errors.languages?.[index];
        return (
          <div
            key={field.id}
            className="rounded-lg border border-base-300 bg-base-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                Idioma #{index + 1}
              </span>
              <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                Eliminar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Idioma *"
                placeholder="Inglés"
                error={e?.language}
                {...register(`languages.${index}.language`)}
              />
              <FormField
                label="Nivel"
                placeholder="Nativo, C1, Básico…"
                error={e?.fluency}
                {...register(`languages.${index}.fluency`)}
              />
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ language: "", fluency: "" })}
      >
        + Añadir idioma
      </Button>
    </div>
  );
}
