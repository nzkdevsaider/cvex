import Handlebars from "handlebars";
import { escapeLaTeX } from "../latex/escape";
import { formatDate } from "../latex/helpers";
import type { Resume } from "@/types/resume";
import type { SectionKey } from "../latex/types";

Handlebars.registerHelper("formatDate", function (date: unknown) {
  return typeof date === "string" ? formatDate(date) : "Actualidad";
});

Handlebars.registerHelper("escapeLaTeX", function (text: unknown) {
  return typeof text === "string" ? escapeLaTeX(text) : "";
});

/** Joins an array with a separator */
Handlebars.registerHelper(
  "join",
  function (arr: unknown, separator: unknown) {
    if (!Array.isArray(arr)) return "";
    return arr.join(typeof separator === "string" ? separator : ", ");
  },
);

/** Returns true if a value is non-empty (non-null, non-empty string/array). */
Handlebars.registerHelper("notEmpty", function (value: unknown) {
  if (value == null) return false;
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
});

/** Strict equality check. Useful inside loops: `{{#if (eq this "work")}}` */
Handlebars.registerHelper("eq", function (a: unknown, b: unknown) {
  return a === b;
});

// ─── Section renderers (used by the {{renderSection}} helper) ────────────────

function renderWork(work: Resume["work"]): string {
  if (!work || work.length === 0) return "";
  return work
    .map(
      (w) =>
        `\n  \\subsection*{${escapeLaTeX(w.position)} --- ${escapeLaTeX(w.name)}}\n` +
        `  \\textit{${formatDate(w.startDate)} -- ${formatDate(w.endDate)}}` +
        (w.url ? ` \\hfill \\href{${escapeLaTeX(w.url)}}{${escapeLaTeX(w.url)}}` : "") +
        "\n\n" +
        (w.summary ? `  ${escapeLaTeX(w.summary)}\n` : "") +
        (w.highlights && w.highlights.length > 0
          ? `  \\begin{itemize}\n${w.highlights.map((h) => `    \\item ${escapeLaTeX(h)}`).join("\n")}\n  \\end{itemize}`
          : ""),
    )
    .join("\n\\medskip\n");
}

function renderEducation(education: Resume["education"]): string {
  if (!education || education.length === 0) return "";
  return education
    .map(
      (e) =>
        `\n  \\subsection*{${escapeLaTeX(e.studyType ? `${e.studyType} en ${e.area}` : e.area)} --- ${escapeLaTeX(e.institution)}}\n` +
        `  \\textit{${formatDate(e.startDate)} -- ${formatDate(e.endDate)}}` +
        (e.score ? ` \\hfill Nota: ${escapeLaTeX(e.score)}` : "") +
        (e.courses && e.courses.length > 0
          ? `\n  \\textit{Cursos: ${e.courses.map(escapeLaTeX).join(", ")}}`
          : ""),
    )
    .join("\n\\medskip\n");
}

function renderVolunteer(volunteer: Resume["volunteer"]): string {
  if (!volunteer || volunteer.length === 0) return "";
  return volunteer
    .map(
      (v) =>
        `\n  \\subsection*{${escapeLaTeX(v.position)} --- ${escapeLaTeX(v.organization)}}\n` +
        `  \\textit{${formatDate(v.startDate)} -- ${formatDate(v.endDate)}}\n\n` +
        (v.summary ? `  ${escapeLaTeX(v.summary)}\n` : "") +
        (v.highlights && v.highlights.length > 0
          ? `  \\begin{itemize}\n${v.highlights.map((h) => `    \\item ${escapeLaTeX(h)}`).join("\n")}\n  \\end{itemize}`
          : ""),
    )
    .join("\n\\medskip\n");
}

function renderSkills(skills: Resume["skills"]): string {
  if (!skills || skills.length === 0) return "";
  return skills
    .map(
      (s) =>
        `\\textbf{${escapeLaTeX(s.name)}}${s.level ? ` (${escapeLaTeX(s.level)})` : ""}` +
        (s.keywords && s.keywords.length > 0
          ? `: ${s.keywords.map(escapeLaTeX).join(", ")}`
          : ""),
    )
    .join(" \\textbullet{} ");
}

function renderLanguages(languages: Resume["languages"]): string {
  if (!languages || languages.length === 0) return "";
  return languages
    .map(
      (l) =>
        `${escapeLaTeX(l.language)}${l.fluency ? ` (${escapeLaTeX(l.fluency)})` : ""}`,
    )
    .join(" \\textbullet{} ");
}

function renderAwards(awards: Resume["awards"]): string {
  if (!awards || awards.length === 0) return "";
  return awards
    .map(
      (a) =>
        `\\subsection*{${escapeLaTeX(a.title)}}\n  ` +
        (a.awarder ? `${escapeLaTeX(a.awarder)} ` : "") +
        (a.date ? `\\textit{(${formatDate(a.date)})}` : "") +
        (a.summary ? `\n\n  ${escapeLaTeX(a.summary)}` : ""),
    )
    .join("\n\\medskip\n");
}

function renderCertificates(certificates: Resume["certificates"]): string {
  if (!certificates || certificates.length === 0) return "";
  return certificates
    .map(
      (c) =>
        `\\subsection*{${escapeLaTeX(c.name)}}\n  ` +
        (c.issuer ? `${escapeLaTeX(c.issuer)}` : "") +
        (c.date ? ` \\textit{(${formatDate(c.date)})}` : "") +
        (c.url ? ` --- \\href{${escapeLaTeX(c.url)}}{enlace}` : ""),
    )
    .join("\n\\medskip\n");
}

function renderProjects(projects: Resume["projects"]): string {
  if (!projects || projects.length === 0) return "";
  return projects
    .map(
      (p) =>
        `\n  \\subsection*{${escapeLaTeX(p.name)}${p.url ? ` --- \\href{${escapeLaTeX(p.url)}}{enlace}` : ""}}\n` +
        (p.startDate || p.endDate
          ? `  \\textit{${formatDate(p.startDate)} -- ${formatDate(p.endDate)}}\n\n`
          : "") +
        (p.description ? `  ${escapeLaTeX(p.description)}\n` : "") +
        (p.highlights && p.highlights.length > 0
          ? `  \\begin{itemize}\n${p.highlights.map((h) => `    \\item ${escapeLaTeX(h)}`).join("\n")}\n  \\end{itemize}`
          : ""),
    )
    .join("\n\\medskip\n");
}

function renderInterests(interests: Resume["interests"]): string {
  if (!interests || interests.length === 0) return "";
  return interests
    .map(
      (i) =>
        `\\textbf{${escapeLaTeX(i.name)}}` +
        (i.keywords && i.keywords.length > 0
          ? `: ${i.keywords.map(escapeLaTeX).join(", ")}`
          : ""),
    )
    .join(" \\textbullet{} ");
}

function renderReferences(references: Resume["references"]): string {
  if (!references || references.length === 0) return "";
  return references
    .map(
      (r) =>
        `\\subsection*{${escapeLaTeX(r.name)}}` +
        (r.reference ? `\n  \\textit{«${escapeLaTeX(r.reference)}»}` : ""),
    )
    .join("\n\\medskip\n");
}

function renderPublications(publications: Resume["publications"]): string {
  if (!publications || publications.length === 0) return "";
  return publications
    .map(
      (p) =>
        `\\subsection*{${escapeLaTeX(p.name)}}\n  ` +
        (p.publisher ? `${escapeLaTeX(p.publisher)}` : "") +
        (p.releaseDate ? ` \\textit{(${formatDate(p.releaseDate)})}` : "") +
        (p.url ? ` --- \\href{${escapeLaTeX(p.url)}}{enlace}` : "") +
        (p.summary ? `\n\n  ${escapeLaTeX(p.summary)}` : ""),
    )
    .join("\n\\medskip\n");
}

const SECTION_TITLES: Partial<Record<SectionKey, string>> = {
  work: "Experiencia",
  education: "Formación",
  volunteer: "Voluntariado",
  skills: "Habilidades",
  languages: "Idiomas",
  awards: "Premios",
  certificates: "Certificados",
  projects: "Proyectos",
  interests: "Intereses",
  references: "Referencias",
  publications: "Publicaciones",
};

/**
 * Renders a full section block (\\section*{Title}\\n<body>) for the given
 * section key, using data from the Handlebars root context.
 *
 * Usage in templates: `{{#each _sectionOrder}}{{renderSection this}}{{/each}}`
 * or directly: `{{renderSection "work"}}`
 */
Handlebars.registerHelper(
  "renderSection",
  function (key: unknown, options: Handlebars.HelperOptions) {
    if (typeof key !== "string") return "";
    const root: Resume & { _sectionOrder?: SectionKey[] } =
      options.data?.root ?? {};

    let body = "";
    switch (key as SectionKey) {
      case "work":
        body = renderWork(root.work);
        break;
      case "education":
        body = renderEducation(root.education);
        break;
      case "volunteer":
        body = renderVolunteer(root.volunteer);
        break;
      case "skills":
        body = renderSkills(root.skills);
        break;
      case "languages":
        body = renderLanguages(root.languages);
        break;
      case "awards":
        body = renderAwards(root.awards);
        break;
      case "certificates":
        body = renderCertificates(root.certificates);
        break;
      case "projects":
        body = renderProjects(root.projects);
        break;
      case "interests":
        body = renderInterests(root.interests);
        break;
      case "references":
        body = renderReferences(root.references);
        break;
      case "publications":
        body = renderPublications(root.publications);
        break;
    }

    if (!body) return "";
    const title = SECTION_TITLES[key as SectionKey] ?? key;
    return new Handlebars.SafeString(`\\section*{${title}}\n${body}\n`);
  },
);

/**
 * Builds the contact line for the resume header.
 * Outputs email, phone, URL, and city/countryCode parts joined by \quad.
 * Usage: `{{buildContact this}}`
 */
Handlebars.registerHelper(
  "buildContact",
  function (context: Resume, _options: Handlebars.HelperOptions) {
    const basics = context?.basics ?? ({} as Resume["basics"]);
    const parts: string[] = [];

    if (basics.email)
      parts.push(
        `\\href{mailto:${basics.email}}{${escapeLaTeX(basics.email)}}`,
      );
    if (basics.phone) parts.push(escapeLaTeX(basics.phone));
    if (basics.url)
      parts.push(`\\href{${basics.url}}{${escapeLaTeX(basics.url)}}`);
    if (basics.location?.city) {
      const loc = [basics.location.city, basics.location.countryCode]
        .filter(Boolean)
        .map(escapeLaTeX)
        .join(", ");
      parts.push(loc);
    }

    return new Handlebars.SafeString(parts.join(" \\quad "));
  },
);

/**
 * Builds a LaTeX \href{url}{network} link for a profile entry.
 * Usage: `{{profileLink this}}` inside `{{#each basics.profiles}}`
 */
Handlebars.registerHelper(
  "profileLink",
  function (profile: { url?: string; network?: string }) {
    const url = profile?.url ?? "";
    const network = escapeLaTeX(profile?.network ?? "");
    return new Handlebars.SafeString(`\\href{${url}}{${network}}`);
  },
);

// ────────────────────────────────────────────────────────────────────────────

/**
 * Renders a Handlebars template against a Resume object.
 *
 * The full Resume structure is exposed as Handlebars context, so templates
 * can access {{basics.name}}, {{#each work}}...{{/each}}, etc.
 * The optional sectionOrder array is available as {{_sectionOrder}}.
 * The {{renderSection key}} helper renders a full section block.
 */
export function renderExternalTemplate(
  templateSource: string,
  resume: Resume,
  sectionOrder?: SectionKey[],
): string {
  const template = Handlebars.compile(templateSource, { noEscape: true });
  return template({
    ...resume,
    _sectionOrder: sectionOrder ?? [],
  });
}

