# CVeX — Instrucciones para Agentes de Código

## Propósito del Proyecto

**CVeX** es una aplicación web de creación y gestión de CVs/Currículums. Permite a los usuarios:
- Crear y gestionar múltiples CVs en el navegador
- Editar datos estructurados mediante formularios
- Elegir entre plantillas LaTeX integradas o externas (desde repositorios GitHub)
- Generar y descargar PDFs directamente en el navegador (sin backend)
- Gestionar colecciones de plantillas externas con soporte de actualizaciones

**Principio clave**: Aplicación 100% client-side. No hay backend. Todo persiste en `localStorage`.

---

## Comandos de Desarrollo

```bash
pnpm dev        # Servidor de desarrollo (Next.js + Turbopack)
pnpm build      # Build de producción
pnpm lint       # ESLint
pnpm tsc        # TypeScript watch sin emitir archivos
```

---

## Stack Tecnológico

| Área | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) con Turbopack |
| UI | React 19, Tailwind CSS v4, DaisyUI v5 |
| Tema DaisyUI | `business` (definido en `app/layout.tsx`) |
| Fuentes | Geist Sans + Geist Mono |
| Formularios | React Hook Form + Zod |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Iconos | lucide-react |
| Plantillas integradas y externas | Handlebars |
| PDF/LaTeX | SwiftLaTeX (WASM, inline en hilo principal) |
| Lenguaje | TypeScript con path alias `@/*` → raíz |
| Package manager | pnpm (workspace) |

---

## Estructura de Directorios

```
app/                        → Páginas y layouts (Next.js App Router)
  layout.tsx                → Root layout: Navbar + datos globales
  page.tsx                  → Redirige a /files
  files/page.tsx            → Dashboard: lista de CVs + botón crear
  new/page.tsx              → Selección de plantilla al crear
  edit/[fileId]/page.tsx    → Editor principal con preview LaTeX
  view/[fileId]/page.tsx    → Visor de PDF, descarga, exportar JSON
  settings/
    layout.tsx              → Layout con sidebar de navegación de ajustes
    page.tsx                → Hub de ajustes (usa SETTINGS_ITEMS de lib/config.ts)
    add-templates-collections/page.tsx → Añadir/sincronizar colecciones

components/
  editor/                   → 12 formularios de secciones (BasicsForm, WorkForm, SkillsForm, …)
  layout/Navbar.tsx         → Barra de navegación superior fija
  resume/
    ResumeCard.tsx          → Tarjeta de CV con acciones (Editar/Ver/Eliminar)
    SectionPanel.tsx        → Panel colapsable con drag handle
    SortableSectionPanel.tsx → SectionPanel envuelto con @dnd-kit
    TemplateCard.tsx        → Tarjeta de selección de plantilla
  templates/
    CollectionUpdateDrawer.tsx → Notificación flotante de actualizaciones disponibles
  ui/
    Button.tsx              → Botón polimórfico (variants: primary/secondary/ghost/danger; sizes: sm/md/lg)
    Card.tsx                → Contenedor composable (Card, CardHeader, CardTitle, CardDescription)
    FormField.tsx           → Input/Textarea integrado con React Hook Form
    ConfirmDialog.tsx       → Modal de confirmación con gestión de foco
    OptionalFieldsModal.tsx → Modal para activar/desactivar campos opcionales por sección

hooks/
  useResumeData.ts          → Carga y auto-guardado de un CV (debounce 1.5s)
  useResumeList.ts          → CRUD de la lista de CVs
  useTemplateCollections.ts → Sync, check-updates y CRUD de colecciones
  useLatexWorker.ts         → Compilación LaTeX → PDF via SwiftLaTeX WASM

lib/
  config.ts                 → Constantes de configuración global (SETTINGS_ITEMS, etc.)
  storage/index.ts          → Capa de persistencia sobre localStorage
  latex/
    registry.ts             → Registro de plantillas integradas (Map simple)
    templates.ts            → Importa JSONs de builtin/ y los registra
    builtin/
      default.json          → Plantilla "Clásico" (ID: "default") en formato Handlebars JSON
    helpers.ts              → formatDate(): "2024-01-15" → "ene. 2024"
    escape.ts               → escapeLaTeX(): escapa \ { } $ & # ^ _ ~ %
    types.ts                → Tipos del sistema LaTeX (LatexTemplate, SectionKey, DEFAULT_SECTION_ORDER, TemplateFieldUsage)
    field-labels.ts         → FIELD_LABELS: etiquetas en español para campos opcionales
    field-parser.ts         → parseHandlebarsSource(): analiza una plantilla e infiere TemplateFieldUsage
  template-collections/
    types.ts                → TemplateCollection, ExternalTemplate, Manifest
    index.ts                → generateLatexForAnyTemplate() y resolveTemplateFieldUsage() — puntos de entrada principales
    storage.ts              → CRUD de colecciones en localStorage
    sync.ts                 → syncCollection(), checkForUpdates()
    renderer.ts             → Renderizado Handlebars con helpers (formatDate, escapeLaTeX, join, notEmpty, eq, renderSection, buildContact, profileLink)

types/
  resume.d.ts               → Modelo Resume (JSON Resume Schema completo)

validations/
  resume.ts                 → Esquemas Zod por sección (mensajes en español)

public/
  PdfTeXEngine.js           → Motor SwiftLaTeX (cargado dinámicamente)
  swiftlatexpdftex.js       → Binario de soporte
```

---

## Modelo de Datos Principal

### `ResumeEntry` (localStorage key: `cvbuilder_resumes`)
```typescript
{
  id: string                              // UUID
  title: string                           // Nombre del CV
  templateId: string                      // "default" | "{collectionId}:{templateId}"
  sectionOrder?: string[]                 // Orden personalizado de secciones
  enabledOptionalFields?: EnabledOptionalFields // Campos opcionales activos por sección
  updatedAt: string                       // ISO timestamp
  data: Resume                            // Datos JSON Resume completos
}

// EnabledOptionalFields (lib/storage/index.ts)
type EnabledOptionalFields = { [section: string]: string[] | undefined }
// Ejemplo: { basics: ["image", "profiles"], work: ["highlights"] }
```

### `Resume` (JSON Resume Schema — `types/resume.d.ts`)
Secciones: `basics`, `work[]`, `education[]`, `volunteer[]`, `skills[]`, `languages[]`, `interests[]`, `awards[]`, `certificates[]`, `projects[]`, `publications[]`, `references[]`

### `TemplateCollection` (localStorage key: `cvex_template_collections`)
```typescript
{
  id: string                // ID seguro generado desde URL
  sourceUrl: string         // URL del repositorio GitHub
  name: string
  version: string
  lastCommitSha?: string    // SHA para comparar actualizaciones (solo GitHub)
  lastSyncedAt: string
  lastCheckedAt?: string    // Rate limit: 1h entre comprobaciones
  templates: ExternalTemplate[]
  updateAvailable: boolean
}
```

---

## Patrones y Convenciones

### IDs de plantillas
- **Integradas**: string simple → `"default"`
- **Externas**: `"{collectionId}:{templateId}"` (separado por dos puntos)

### Auto-guardado
`useResumeData` aplica debounce de **1.5s** en cada cambio de formulario antes de escribir a localStorage.

### Hidratación client-side
Todos los hooks que acceden a localStorage comprueban `typeof window !== "undefined"`. Exponen un flag `hydrated` para evitar errores de SSR.

### Formularios de editor
Cada formulario en `components/editor/` usa `react-hook-form` con `register()` + resolución Zod desde `validations/resume.ts`. Los campos usan `<FormField {...register("section.field")} />`.

### Reordenación de secciones
`SortableSectionPanel` usa `@dnd-kit`. El orden se persiste en `ResumeEntry.sectionOrder` y afecta directamente la salida LaTeX generada.

### Generación de LaTeX
El punto de entrada es `generateLatexForAnyTemplate(templateId, resume, sectionOrder)` en `lib/template-collections/index.ts`. Busca primero en el registro integrado, luego en colecciones externas por formato `collectionId:templateId`, y hace fallback a `"default"`. **Todas** las plantillas (integradas y externas) se renderizan con `renderExternalTemplate()` de `renderer.ts`.

### Sistema de campos opcionales
Las plantillas pueden declarar qué campos opcionales soportan (imagen, perfiles, logros, etc.). El flujo completo:
1. `parseHandlebarsSource(templateSource)` (`lib/latex/field-parser.ts`) — analiza la plantilla Handlebars e infiere un `TemplateFieldUsage`
2. `resolveTemplateFieldUsage(templateId)` (`lib/template-collections/index.ts`) — devuelve el `TemplateFieldUsage` para cualquier plantilla (integrada o externa)
3. En el editor, el usuario activa/desactiva campos opcionales por sección via `OptionalFieldsModal`
4. Los campos habilitados se persisten en `ResumeEntry.enabledOptionalFields` y se pasan a cada formulario de sección para controlar la visibilidad de campos

**`TemplateFieldUsage`** (definido en `lib/latex/types.ts`):
```typescript
interface TemplateFieldUsage {
  basicsOptional: string[]            // Campos opcionales de básicos (image, url, profiles…)
  sectionsAdditional: Partial<Record<SectionKey, string[]>> // Campos adicionales por sección (highlights, courses…)
  templateSections: SectionKey[] | null // null = soporta todas; array = solo esas secciones
}
```
- `templateSections: null` indica que la plantilla usa `{{renderSection key}}` o `_sectionOrder` (compatible con todas las secciones)
- `templateSections: ["work", "education"]` indica que la plantilla solo renderiza esas secciones explícitamente

**`FIELD_LABELS`** (`lib/latex/field-labels.ts`) contiene las etiquetas en español de los campos opcionales para mostrar en `OptionalFieldsModal`.

### Colecciones externas (manifest)
Las colecciones deben exponer un `manifest.json` con estructura:
```json
{
  "manifestVersion": "1",
  "name": "Nombre",
  "version": "1.0.0",
  "templatesPath": "templates",
  "templates": [{ "id": "modern", "name": "Modern", "file": "modern.json", "preview": "🎨", "description": "..." }]
}
```
Cada archivo de plantilla: `{ "template": "\\documentclass{...}{{basics.name}}..." }`

### Sistema de plantillas unificado (integradas y externas)
Ambos tipos de plantilla comparten el mismo formato Handlebars JSON y el mismo pipeline de renderizado:
```json
{
  "id": "my-template",
  "name": "Mi Plantilla",
  "description": "...",
  "preview": "📄",
  "templateSource": "...contenido Handlebars..."
}
```
**Helpers Handlebars disponibles** (registrados en `lib/template-collections/renderer.ts`):
- `{{escapeLaTeX value}}` — escapa caracteres especiales de LaTeX
- `{{formatDate date}}` — convierte fecha ISO a "mes. año"
- `{{join array sep}}` — une un array con separador
- `{{notEmpty value}}` — truthy si no está vacío
- `{{eq a b}}` — igualdad estricta (`===`); útil en bucles: `{{#if (eq this "work")}}`
- `{{renderSection key}}` — renderiza un bloque `\section*{Título}\n<cuerpo>` completo
- `{{buildContact this}}` — renderiza la línea de contacto (email, teléfono, URL, ciudad) separados por `\quad`
- `{{profileLink this}}` — dentro de `{{#each basics.profiles}}`, genera `\href{url}{network}`

**Variables de contexto disponibles en plantillas:**
`basics`, `work`, `education`, `skills`, `languages`, `volunteer`, `awards`, `certificates`, `projects`, `interests`, `references`, `publications`, `_sectionOrder`

> ⚠️ **Trámpa crítica de Handlebars + LaTeX**: nunca colocar `{` o `}` de LaTeX inmediatamente adyacentes a `{{` o `}}` de Handlebars — el lexer los fusiona en `{{{` (expresión sin escape) o `}}}}` (raw block closer). Siempre separar con un espacio: `\textbf{ {{helper value}} }` en lugar de `\textbf{{{helper value}}}`.

### Añadir una nueva plantilla integrada
1. Crear `lib/latex/builtin/<id>.json` con `{ "id", "name", "description", "preview", "templateSource" }`
2. En `lib/latex/templates.ts`: `import myTemplate from "./builtin/<id>.json"; registerTemplate(myTemplate);`
3. Los helpers Handlebars mencionados arriba están disponibles automáticamente.

### Añadir una nueva sección de Ajustes
Añadir la entrada en `SETTINGS_ITEMS` en `lib/config.ts`. El sidebar (`app/settings/layout.tsx`) y la página hub (`app/settings/page.tsx`) se actualizan automáticamente.

---

## Notas Importantes

- **No hay backend ni autenticación.** Todo es localStorage. No añadir llamadas a APIs externas sin consultar.
- **No usar estado global** (Redux, Zustand, Context). Los hooks React + localStorage son el patrón establecido.
- **La compilación LaTeX ocurre en el hilo principal** via SwiftLaTeX WASM. No mover a worker sin discutirlo.
- **Idioma de la interfaz**: Español. Textos visibles al usuario deben ir en español.
- **DaisyUI v5**: Usar clases de utilidad DaisyUI antes que CSS personalizado.
- No utilizar PowerShell o comandos específicos de Windows para editar archivos.
