import { z } from "zod";

export const ResumLocationSchema = z.object({
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().min(1, "La ciudad es obligatoria"),
  countryCode: z
    .string()
    .length(
      2,
      "El código de país debe tener exactamente 2 caracteres (ej. US, ES)",
    )
    .optional(),
  region: z.string().optional(),
});

export const ResumeProfileSchema = z.object({
  network: z.string().min(1, "El nombre de la red es obligatorio"),
  username: z.string().min(1, "El nombre de usuario es obligatorio"),
  url: z
    .string()
    .url("La URL del perfil debe ser válida")
    .optional()
    .or(z.literal("")),
});

export const ResumeBasicsSchema = z.object({
  name: z.string().min(1, "El nombre completo es obligatorio"),
  label: z.string().optional(),
  image: z
    .string()
    .url("La imagen debe ser una URL válida")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Debe ser un correo electrónico válido"),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,20}$/, "Debe ser un número de teléfono válido")
    .optional()
    .or(z.literal("")),
  url: z
    .string()
    .url("El sitio web debe ser una URL válida")
    .optional()
    .or(z.literal("")),
  summary: z.string().optional(),
  location: ResumLocationSchema.optional(),
  profiles: z.array(ResumeProfileSchema).optional(),
});

export const ResumeWorkSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre de la empresa u organización es obligatorio"),
  position: z.string().min(1, "El cargo es obligatorio"),
  url: z
    .string()
    .url("La URL de la empresa debe ser válida")
    .optional()
    .or(z.literal("")),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const ResumeVolunteerSchema = z.object({
  organization: z
    .string()
    .min(1, "El nombre de la organización es obligatorio"),
  position: z.string().min(1, "El cargo es obligatorio"),
  url: z.string().url("La URL debe ser válida").optional().or(z.literal("")),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const ResumeEducationSchema = z.object({
  institution: z.string().min(1, "El nombre de la institución es obligatorio"),
  url: z
    .string()
    .url("La URL de la institución debe ser válida")
    .optional()
    .or(z.literal("")),
  area: z.string().min(1, "El área de estudio es obligatoria"),
  studyType: z.string().optional(),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  endDate: z.string().optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).optional(),
});

export const ResumeAwardSchema = z.object({
  title: z.string().min(1, "El título del premio es obligatorio"),
  date: z.string().optional(),
  awarder: z.string().optional(),
  summary: z.string().optional(),
});

export const ResumeCertificateSchema = z.object({
  name: z.string().min(1, "El nombre del certificado es obligatorio"),
  date: z.string().optional(),
  issuer: z.string().optional(),
  url: z
    .string()
    .url("La URL del certificado debe ser válida")
    .optional()
    .or(z.literal("")),
});

export const ResumePublicationSchema = z.object({
  name: z.string().min(1, "El nombre de la publicación es obligatorio"),
  publisher: z.string().optional(),
  releaseDate: z.string().optional(),
  url: z
    .string()
    .url("La URL de la publicación debe ser válida")
    .optional()
    .or(z.literal("")),
  summary: z.string().optional(),
});

export const ResumeSkillSchema = z.object({
  name: z.string().min(1, "El nombre de la habilidad es obligatorio"),
  level: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export const ResumeLanguageSchema = z.object({
  language: z.string().min(1, "El nombre del idioma es obligatorio"),
  fluency: z.string().optional(),
});

export const ResumeInterestSchema = z.object({
  name: z.string().min(1, "El nombre del interés es obligatorio"),
  keywords: z.array(z.string()).optional(),
});

export const ResumeReferenceSchema = z.object({
  name: z.string().min(1, "El nombre de la referencia es obligatorio"),
  reference: z.string().optional(),
});

export const ResumeProjectSchema = z.object({
  name: z.string().min(1, "El nombre del proyecto es obligatorio"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  url: z
    .string()
    .url("La URL del proyecto debe ser válida")
    .optional()
    .or(z.literal("")),
});

export const ResumeSchema = z.object({
  basics: ResumeBasicsSchema,
  work: z
    .array(ResumeWorkSchema)
    .min(1, "Se requiere al menos una experiencia laboral"),
  education: z
    .array(ResumeEducationSchema)
    .min(1, "Se requiere al menos una entrada de educación"),

  volunteer: z.array(ResumeVolunteerSchema).optional(),
  awards: z.array(ResumeAwardSchema).optional(),
  certificates: z.array(ResumeCertificateSchema).optional(),
  publications: z.array(ResumePublicationSchema).optional(),
  skills: z.array(ResumeSkillSchema).optional(),
  languages: z.array(ResumeLanguageSchema).optional(),
  interests: z.array(ResumeInterestSchema).optional(),
  references: z.array(ResumeReferenceSchema).optional(),
  projects: z.array(ResumeProjectSchema).optional(),
});

export type ResumeSchemaType = z.infer<typeof ResumeSchema>;
