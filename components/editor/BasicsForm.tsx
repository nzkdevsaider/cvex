"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ResumeSchemaType } from "@/validations/resume";
import { FormField } from "@/components/ui/FormField";

interface BasicsFormProps {
  register: UseFormRegister<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
}

export function BasicsForm({ register, errors }: BasicsFormProps) {
  const b = errors.basics;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Nombre completo *"
          placeholder="María García López"
          error={b?.name}
          {...register("basics.name")}
        />
        <FormField
          label="Cargo / Título profesional"
          placeholder="Ingeniera de Software"
          error={b?.label}
          {...register("basics.label")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Correo electrónico *"
          type="email"
          placeholder="nombre@email.com"
          error={b?.email}
          {...register("basics.email")}
        />
        <FormField
          label="Teléfono"
          type="tel"
          placeholder="+34 612 345 678"
          error={b?.phone}
          {...register("basics.phone")}
        />
      </div>

      <FormField
        label="Sitio web / Portfolio"
        type="url"
        placeholder="https://tuportfolio.com"
        error={b?.url}
        {...register("basics.url")}
      />

      <FormField
        label="Resumen profesional"
        textarea
        rows={4}
        placeholder="Breve descripción de tu perfil profesional..."
        error={b?.summary}
        {...register("basics.summary")}
      />

      <div className="divider text-xs font-semibold uppercase tracking-wider opacity-60 my-1">
        Ubicación
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Ciudad *"
          placeholder="Madrid"
          error={b?.location?.city}
          {...register("basics.location.city")}
        />
        <FormField
          label="Región / Comunidad"
          placeholder="Comunidad de Madrid"
          error={b?.location?.region}
          {...register("basics.location.region")}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <FormField
          label="Código postal"
          placeholder="28013"
          error={b?.location?.postalCode}
          {...register("basics.location.postalCode")}
        />
        <FormField
          label="País (código ISO)"
          placeholder="ES"
          maxLength={2}
          error={b?.location?.countryCode}
          {...register("basics.location.countryCode")}
        />
        <FormField
          label="Dirección"
          placeholder="Calle Gran Vía 42"
          error={b?.location?.address}
          {...register("basics.location.address")}
        />
      </div>
    </div>
  );
}
