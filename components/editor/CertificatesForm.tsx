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

interface CertificatesFormProps {
  control: Control<ResumeSchemaType>;
  register: UseFormRegister<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
}

export function CertificatesForm({
  control,
  register,
  errors,
}: CertificatesFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "certificates",
  });

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field, index) => {
        const e = errors.certificates?.[index];
        return (
          <div
            key={field.id}
            className="rounded-lg border border-base-300 bg-base-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                Certificado #{index + 1}
              </span>
              <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                Eliminar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Nombre *"
                placeholder="AWS Certified Developer"
                error={e?.name}
                {...register(`certificates.${index}.name`)}
              />
              <FormField
                label="Fecha"
                placeholder="2024-02"
                error={e?.date}
                {...register(`certificates.${index}.date`)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Expedidor"
                placeholder="Amazon Web Services"
                error={e?.issuer}
                {...register(`certificates.${index}.issuer`)}
              />
              <FormField
                label="URL"
                type="url"
                placeholder="https://certif.example.com/verify/..."
                error={e?.url}
                {...register(`certificates.${index}.url`)}
              />
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ name: "", date: "", issuer: "", url: "" })}
      >
        + Añadir certificado
      </Button>
    </div>
  );
}
