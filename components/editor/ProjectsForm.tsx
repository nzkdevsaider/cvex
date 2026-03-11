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

interface ProjectsFormProps {
  control: Control<ResumeSchemaType>;
  register: UseFormRegister<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
  enabledFields?: string[];
}

export function ProjectsForm({ control, register, errors, enabledFields = [] }: ProjectsFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });
  const showHighlights = enabledFields.includes("highlights");

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field, index) => {
        const e = errors.projects?.[index];
        return (
          <div
            key={field.id}
            className="rounded-lg border border-base-300 bg-base-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                Proyecto #{index + 1}
              </span>
              <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                Eliminar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Nombre *"
                placeholder="Mi aplicación web"
                error={e?.name}
                {...register(`projects.${index}.name`)}
              />
              <FormField
                label="URL"
                type="url"
                placeholder="https://github.com/usuario/proyecto"
                error={e?.url}
                {...register(`projects.${index}.url`)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Fecha de inicio"
                placeholder="2023-01"
                error={e?.startDate}
                {...register(`projects.${index}.startDate`)}
              />
              <FormField
                label="Fecha de fin"
                placeholder="2023-06"
                error={e?.endDate}
                {...register(`projects.${index}.endDate`)}
              />
            </div>

            <FormField
              label="Descripción"
              textarea
              rows={3}
              placeholder="Qué hace el proyecto, tecnologías usadas..."
              error={e?.description}
              {...register(`projects.${index}.description`)}
            />

            {showHighlights && (
              <Controller
                control={control}
                name={`projects.${index}.highlights`}
                render={({ field: f }) => (
                  <FormField
                    label="Hitos del proyecto"
                    textarea
                    rows={3}
                    placeholder={"Implementado por 10.000 usuarios\nReduje el tiempo de carga en un 40%"}
                    hint="Un hito por línea"
                    value={(f.value ?? []).join("\n")}
                    onChange={(e) =>
                      f.onChange(
                        (e.target as HTMLTextAreaElement).value
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                  />
                )}
              />
            )}
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
            startDate: "",
            endDate: "",
            description: "",
            highlights: [],
            url: "",
          })
        }
      >
        + Añadir proyecto
      </Button>
    </div>
  );
}
