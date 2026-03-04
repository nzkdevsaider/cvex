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

interface EducationFormProps {
  control: Control<ResumeSchemaType>;
  register: UseFormRegister<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
}

export function EducationForm({
  control,
  register,
  errors,
}: EducationFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field, index) => {
        const e = errors.education?.[index];
        return (
          <div
            key={field.id}
            className="rounded-lg border border-base-300 bg-base-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                Formación #{index + 1}
              </span>
              {fields.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                  Eliminar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Institución *"
                placeholder="Universidad Politécnica de Madrid"
                error={e?.institution}
                {...register(`education.${index}.institution`)}
              />
              <FormField
                label="Área de estudio *"
                placeholder="Ingeniería Informática"
                error={e?.area}
                {...register(`education.${index}.area`)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Tipo de estudio"
                placeholder="Grado, Máster, Bootcamp..."
                error={e?.studyType}
                {...register(`education.${index}.studyType`)}
              />
              <FormField
                label="Nota / Calificación"
                placeholder="8.5 / 10"
                error={e?.score}
                {...register(`education.${index}.score`)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Fecha de inicio *"
                placeholder="2013-09"
                error={e?.startDate}
                {...register(`education.${index}.startDate`)}
              />
              <FormField
                label="Fecha de fin"
                placeholder="2017-06"
                error={e?.endDate}
                {...register(`education.${index}.endDate`)}
              />
            </div>

            <FormField
              label="URL de la institución"
              type="url"
              placeholder="https://universidad.es"
              error={e?.url}
              {...register(`education.${index}.url`)}
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
            institution: "",
            url: "",
            area: "",
            studyType: "",
            startDate: "",
            endDate: "",
            score: "",
            courses: [],
          })
        }
      >
        + Añadir formación
      </Button>
    </div>
  );
}
