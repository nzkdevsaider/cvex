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

interface BasicsFormProps {
  register: UseFormRegister<ResumeSchemaType>;
  control: Control<ResumeSchemaType>;
  errors: FieldErrors<ResumeSchemaType>;
  /** List of optional field keys currently enabled for this template + CV. */
  enabledFields?: string[];
}

export function BasicsForm({
  register,
  control,
  errors,
  enabledFields = [],
}: BasicsFormProps) {
  const b = errors.basics;

  const {
    fields: profileFields,
    append: appendProfile,
    remove: removeProfile,
  } = useFieldArray({ control, name: "basics.profiles" });

  const showUrl = enabledFields.includes("url");
  const showCountryCode = enabledFields.includes("location.countryCode");
  const showImage = enabledFields.includes("image");
  const showProfiles = enabledFields.includes("profiles");

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

      {showUrl && (
        <FormField
          label="Sitio web / Portfolio"
          type="url"
          placeholder="https://tuportfolio.com"
          error={b?.url}
          {...register("basics.url")}
        />
      )}

      {showImage && (
        <FormField
          label="Foto de perfil (URL)"
          type="url"
          placeholder="https://ejemplo.com/foto.jpg"
          error={b?.image}
          {...register("basics.image")}
        />
      )}

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

      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Código postal"
          placeholder="28013"
          error={b?.location?.postalCode}
          {...register("basics.location.postalCode")}
        />
        <FormField
          label="Dirección"
          placeholder="Calle Gran Vía 42"
          error={b?.location?.address}
          {...register("basics.location.address")}
        />
      </div>

      {showCountryCode && (
        <FormField
          label="País (código ISO)"
          placeholder="ES"
          maxLength={2}
          error={b?.location?.countryCode}
          {...register("basics.location.countryCode")}
        />
      )}

      {showProfiles && (
        <>
          <div className="divider text-xs font-semibold uppercase tracking-wider opacity-60 my-1">
            Perfiles y redes sociales
          </div>

          <div className="flex flex-col gap-3">
            {profileFields.map((field, index) => {
              const pe = b?.profiles?.[index];
              return (
                <div
                  key={field.id}
                  className="rounded-lg border border-base-300 bg-base-200 p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">
                      Perfil #{index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProfile(index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      label="Red social *"
                      placeholder="LinkedIn"
                      error={pe?.network}
                      {...register(`basics.profiles.${index}.network`)}
                    />
                    <FormField
                      label="Usuario *"
                      placeholder="tu-usuario"
                      error={pe?.username}
                      {...register(`basics.profiles.${index}.username`)}
                    />
                  </div>
                  <FormField
                    label="URL del perfil"
                    type="url"
                    placeholder="https://linkedin.com/in/tu-usuario"
                    error={pe?.url}
                    {...register(`basics.profiles.${index}.url`)}
                  />
                </div>
              );
            })}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                appendProfile({ network: "", username: "", url: "" })
              }
            >
              + Añadir perfil
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
