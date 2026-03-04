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

interface ReferencesFormProps {
  control: Control<ResumeSchemaType>;
  register: UseFormRegister<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
}

export function ReferencesForm({
  control,
  register,
  errors,
}: ReferencesFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "references",
  });

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field, index) => {
        const e = errors.references?.[index];
        return (
          <div
            key={field.id}
            className="rounded-lg border border-base-300 bg-base-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                Referencia #{index + 1}
              </span>
              <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                Eliminar
              </Button>
            </div>

            <FormField
              label="Nombre *"
              placeholder="Ada Lovelace"
              error={e?.name}
              {...register(`references.${index}.name`)}
            />

            <FormField
              label="Referencia"
              textarea
              rows={3}
              placeholder="«Un placer trabajar con...»"
              error={e?.reference}
              {...register(`references.${index}.reference`)}
            />
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ name: "", reference: "" })}
      >
        + Añadir referencia
      </Button>
    </div>
  );
}
