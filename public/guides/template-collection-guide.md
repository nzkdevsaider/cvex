# CVeX - Guía para crear colecciones de plantillas

CVeX carga plantillas LaTeX externas desde repositorios públicos. Una colección es un directorio accesible por HTTP que contiene un `manifest.json` y archivos de plantilla en formato JSON.

## Estructura de carpetas

```
mi-coleccion/
├── manifest.json
└── templates/
    ├── moderno.json
    └── minimalista.json
```

## manifest.json

```json
{
  "manifestVersion": "1",
  "name": "Mi Colección",
  "version": "1.0.0",
  "templatesPath": "templates",
  "templates": [
    {
      "id": "moderno",
      "name": "Moderno",
      "description": "Diseño limpio con columna lateral.",
      "preview": "🎨",
      "file": "moderno.json"
    }
  ]
}
```

## Archivo de plantilla (moderno.json)

Cada plantilla es un JSON con un campo `template` que contiene código LaTeX con sintaxis Handlebars. El objeto completo del JSON Resume está disponible como contexto.

```json
{
  "template": "aquí va el código LaTeX con sintaxis Handlebars (ver ejemplo abajo)"
}
```

### Helpers Handlebars disponibles

| Helper | Uso | Descripción |
|---|---|---|
| `escapeLaTeX` | `{{escapeLaTeX basics.name}}` | Escapa caracteres especiales de LaTeX (\, {, }, $, &, #, ^, _, ~, %) |
| `formatDate` | `{{formatDate startDate}}` | Formatea "2024-01-15" → "ene. 2024" |
| `join` | `{{join keywords ", "}}` | Une un array con un separador |
| `notEmpty` | `{{#if (notEmpty work)}}` | True si el valor no es vacío/null |
| `renderSection` | `{{renderSection "work"}}` | Renderiza una sección completa (`\section*{Título}` + cuerpo) |
| `buildContact` | `{{buildContact this}}` | Línea de contacto (email, teléfono, URL, ciudad) separados por `\quad` |
| `profileLink` | `{{profileLink this}}` dentro de `{{#each basics.profiles}}` | Genera `\href{url}{network}` para cada perfil social |

> **Aviso**: nunca colocar `{` o `}` de LaTeX inmediatamente adyacentes a `{{` o `}}` de Handlebars. El lexer fusiona `{` + `{{` en `{{{` (expresión sin escapado) y `}}` + `}` en `}}}` que rompe el parser. Siempre separar con un espacio:
> - ✅ `\textbf{ {{escapeLaTeX name}} }` 
> - ❌ `\textbf{{{escapeLaTeX name}}}`

### Datos disponibles en la plantilla (JSON Resume Schema)

- `basics` — name, label, email, phone, url, summary, location, profiles[]
- `work[]` — name, position, url, startDate, endDate, summary, highlights[]
- `education[]` — institution, area, studyType, startDate, endDate, score, courses[]
- `volunteer[]` — organization, position, url, startDate, endDate, summary, highlights[]
- `skills[]` — name, level, keywords[]
- `languages[]` — language, fluency
- `awards[]` — title, date, awarder, summary
- `certificates[]` — name, date, issuer, url
- `projects[]` — name, startDate, endDate, description, highlights[], url
- `interests[]` — name, keywords[]
- `references[]` — name, reference
- `publications[]` — name, publisher, releaseDate, url, summary
- `_sectionOrder` — array de claves de sección en el orden personalizado del usuario (ej. `["work", "education", "skills", ...]`). Usar `{{#each _sectionOrder}}{{renderSection this}}{{/each}}` para renderizar todas las secciones respetando ese orden.

## Cómo convertir un archivo LaTeX existente a plantilla CVeX

1. **Envuelve el contenido en un JSON**: el LaTeX completo va en el campo `template` como string.
2. **Escapa para JSON**: usa `\n` para saltos de línea, `\"` para comillas dobles, `\\` para backslash. Las llaves dobles `{{` y `}}` son de Handlebars; las simples de LaTeX no necesitan escape.
3. **Reemplaza valores estáticos por variables Handlebars**:
   - Nombre del candidato: `{{escapeLaTeX basics.name}}`
   - Email: `{{basics.email}}`
   - Iterar experiencia: `{{#each work}}...{{/each}}`
   - Fechas: `{{formatDate startDate}}`
   - Texto con caracteres especiales: siempre usar `{{escapeLaTeX campo}}`
4. **Condicionalmente mostrar secciones vacías**:

```
{{#if (notEmpty work)}}
\section{Experiencia}
{{#each work}}...{{/each}}
{{/if}}
```

## Ejemplo mínimo completo de moderno.json

El valor de `template` debe ser un string JSON en una sola línea (aquí formateado para legibilidad).

### Patrón recomendado — usando `renderSection` y `_sectionOrder`

Este patrón delega el renderizado de secciones a CVeX y respeta el orden que el usuario configure en el editor:

```latex
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[margin=2cm]{geometry}
\usepackage{hyperref}
\usepackage{titlesec}
\titleformat{\section}{\large\bfseries}{}{0em}{}[\titlerule]
\pagestyle{empty}
\begin{document}

{\LARGE \textbf{ {{escapeLaTeX basics.name}} }}\\
{\large {{escapeLaTeX basics.label}} }\\
{{buildContact this}}
{{#if basics.profiles}}
\\
{{#each basics.profiles}}{{profileLink this}}{{#unless @last}} | {{/unless}}{{/each}}
{{/if}}

{{#if basics.summary}}
\section*{Sobre mí}
{{escapeLaTeX basics.summary}}
{{/if}}

{{#each _sectionOrder}}{{renderSection this}}{{/each}}

\end{document}
```

### Patrón alternativo — secciones manuales

Si necesitas control total sobre el renderizado de cada sección puedes escribirlo manualmente. Las secciones se mostrarán siempre en el orden hardcodeado en la plantilla, ignorando la preferencia del usuario:

```latex
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[margin=2cm]{geometry}
\begin{document}

{\LARGE \textbf{ {{escapeLaTeX basics.name}} }}\\
{{basics.email}}

{{#if (notEmpty work)}}
\section*{Experiencia}
{{#each work}}
\textbf{ {{escapeLaTeX name}} } --- {{escapeLaTeX position}}\\
{{formatDate startDate}} -- {{formatDate endDate}}\\
{{escapeLaTeX summary}}

{{/each}}
{{/if}}

{{#if (notEmpty education)}}
\section*{Formación}
{{#each education}}
\textbf{ {{escapeLaTeX institution}} } --- {{escapeLaTeX area}}\\
{{formatDate startDate}} -- {{formatDate endDate}}
{{/each}}
{{/if}}

{{#if (notEmpty skills)}}
\section*{Habilidades}
{{#each skills}}
\textbf{ {{escapeLaTeX name}} }: {{join keywords ", "}}\\
{{/each}}
{{/if}}

\end{document}
```

En el JSON, el bloque LaTeX va como string con `\n` en lugar de saltos de línea y `\\` en lugar de `\`.

## URL para añadir en CVeX

Si usas GitHub, apunta a la raíz del directorio en `raw.githubusercontent.com`:

```
https://raw.githubusercontent.com/tu-usuario/mi-coleccion/main
```

CVeX añadirá `/manifest.json` automáticamente. También puedes apuntar directamente:

```
https://raw.githubusercontent.com/tu-usuario/mi-coleccion/main/manifest.json
```
