import type { Resume } from "@/types/resume";
import { escapeLaTeX } from "../escape";
import { formatDate } from "../helpers";
import { registerTemplate } from "../registry";
import { DEFAULT_SECTION_ORDER, type SectionKey } from "../types";

function renderWork(work: Resume["work"]): string {
  if (!work || work.length === 0) return "";
  return work
    .map(
      (w) => `
\\textbf{${escapeLaTeX(w.name)}}${w.location ? ` \\hfill ${escapeLaTeX(w.location)}` : ""}

\\textbf{${escapeLaTeX(w.position)}} \\hfill ${formatDate(w.startDate)} -- ${formatDate(w.endDate)}
${
  w.highlights && w.highlights.length > 0
    ? `\\begin{itemize}[noitemsep, topsep=0pt, partopsep=0pt, parsep=0pt]\n${w.highlights.map((h) => `  \\item ${escapeLaTeX(h)}`).join("\n")}\n\\end{itemize}`
    : w.summary
      ? escapeLaTeX(w.summary)
      : ""
}`,
    )
    .join("\n\\vspace{12pt}\n");
}

function renderEducation(education: Resume["education"]): string {
  if (!education || education.length === 0) return "";
  return education
    .map(
      (e) => `
\\textbf{${escapeLaTeX(e.institution)}}

${escapeLaTeX([e.studyType, e.area].filter(Boolean).join(", "))}${e.score ? `. GPA ${escapeLaTeX(e.score)}` : ""} \\hfill ${formatDate(e.endDate)}`,
    )
    .join("\n\\vspace{12pt}\n");
}

function renderVolunteer(volunteer: Resume["volunteer"]): string {
  if (!volunteer || volunteer.length === 0) return "";
  return volunteer
    .map(
      (v) => `
\\textbf{${escapeLaTeX(v.organization)}}

\\textbf{${escapeLaTeX(v.position)}} \\hfill ${formatDate(v.startDate)} -- ${formatDate(v.endDate)}
${
  v.highlights && v.highlights.length > 0
    ? `\\begin{itemize}[noitemsep, topsep=0pt, partopsep=0pt, parsep=0pt]\n${v.highlights.map((h) => `  \\item ${escapeLaTeX(h)}`).join("\n")}\n\\end{itemize}`
    : v.summary
      ? escapeLaTeX(v.summary)
      : ""
}`,
    )
    .join("\n\\vspace{12pt}\n");
}

function renderSkills(skills: Resume["skills"]): string {
  if (!skills || skills.length === 0) return "";
  const lines = skills.map(
    (s) =>
      `\\textbf{${escapeLaTeX(s.name)}}${s.level ? ` (${escapeLaTeX(s.level)})` : ""}` +
      (s.keywords && s.keywords.length > 0
        ? `: ${s.keywords.map(escapeLaTeX).join(", ")}`
        : ""),
  );
  return lines.join(" \\\\\\\\\n");
}

function renderLanguages(languages: Resume["languages"]): string {
  if (!languages || languages.length === 0) return "";
  return languages
    .map(
      (l) =>
        `${escapeLaTeX(l.language)}${l.fluency ? ` (${escapeLaTeX(l.fluency)})` : ""}`,
    )
    .join(", ");
}

function renderAwards(awards: Resume["awards"]): string {
  if (!awards || awards.length === 0) return "";
  return awards
    .map(
      (a) =>
        `\\textbf{${escapeLaTeX(a.title)}}` +
        `${a.awarder ? ` --- ${escapeLaTeX(a.awarder)}` : ""}` +
        `${a.date ? ` \\hfill ${formatDate(a.date)}` : ""}` +
        `${a.summary ? `\n${escapeLaTeX(a.summary)}` : ""}`,
    )
    .join("\n\\vspace{8pt}\n");
}

function renderCertificates(certificates: Resume["certificates"]): string {
  if (!certificates || certificates.length === 0) return "";
  return certificates
    .map(
      (c) =>
        `\\textbf{${escapeLaTeX(c.name)}}` +
        `${c.issuer ? ` --- ${escapeLaTeX(c.issuer)}` : ""}` +
        `${c.date ? ` \\hfill ${formatDate(c.date)}` : ""}` +
        `${c.url ? `\n\\href{${escapeLaTeX(c.url)}}{Verificar certificado}` : ""}`,
    )
    .join("\n\\vspace{8pt}\n");
}

function renderProjects(projects: Resume["projects"]): string {
  if (!projects || projects.length === 0) return "";
  return projects
    .map(
      (p) => `
\\textbf{${escapeLaTeX(p.name)}}${p.url ? ` --- \\href{${escapeLaTeX(p.url)}}{enlace}` : ""}
${p.startDate ? `\\hfill ${formatDate(p.startDate)} -- ${formatDate(p.endDate)}` : ""}
${p.description ? escapeLaTeX(p.description) : ""}
${
  p.highlights && p.highlights.length > 0
    ? `\\begin{itemize}[noitemsep, topsep=0pt, partopsep=0pt, parsep=0pt]\n${p.highlights.map((h) => `  \\item ${escapeLaTeX(h)}`).join("\n")}\n\\end{itemize}`
    : ""
}`,
    )
    .join("\n\\vspace{12pt}\n");
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
    .join(" \\\\\\\\\n");
}

function renderReferences(references: Resume["references"]): string {
  if (!references || references.length === 0) return "";
  return references
    .map(
      (r) =>
        `\\textbf{${escapeLaTeX(r.name)}}` +
        (r.reference
          ? `\n\\textit{\\guillemotleft ${escapeLaTeX(r.reference)}\\guillemotright}`
          : ""),
    )
    .join("\n\\vspace{8pt}\n");
}

function renderPublications(publications: Resume["publications"]): string {
  if (!publications || publications.length === 0) return "";
  return publications
    .map(
      (p) =>
        `\\textbf{${escapeLaTeX(p.name)}}` +
        `${p.publisher ? ` --- ${escapeLaTeX(p.publisher)}` : ""}` +
        `${p.releaseDate ? ` \\hfill ${formatDate(p.releaseDate)}` : ""}` +
        `${p.url ? `\n\\href{${escapeLaTeX(p.url)}}{Leer publicación}` : ""}` +
        `${p.summary ? `\n${escapeLaTeX(p.summary)}` : ""}`,
    )
    .join("\n\\vspace{8pt}\n");
}

// Generator

function generate(
  resume: Resume,
  sectionOrder: SectionKey[] = DEFAULT_SECTION_ORDER,
): string {
  const {
    basics,
    work,
    education,
    volunteer,
    skills,
    languages,
    awards,
    certificates,
    projects,
    interests,
    references,
    publications,
  } = resume;

  // Contact line
  const contactParts: string[] = [];
  if (basics.location) {
    const loc = [
      basics.location.address,
      basics.location.city,
      basics.location.region,
    ]
      .filter(Boolean)
      .map(escapeLaTeX)
      .join(", ");
    if (loc) contactParts.push(loc);
  }
  if (basics.email)
    contactParts.push(
      `\\href{mailto:${basics.email}}{${escapeLaTeX(basics.email)}}`,
    );
  if (basics.phone) contactParts.push(escapeLaTeX(basics.phone));

  const sectionRenderer: Record<
    SectionKey,
    { title: string; body: () => string }
  > = {
    work: { title: "Experiencia", body: () => renderWork(work ?? []) },
    education: {
      title: "Educación",
      body: () => renderEducation(education ?? []),
    },
    volunteer: {
      title: "Liderazgo y Actividades",
      body: () => renderVolunteer(volunteer ?? []),
    },
    skills: { title: "Habilidades", body: () => renderSkills(skills ?? []) },
    languages: {
      title: "Idiomas",
      body: () => renderLanguages(languages ?? []),
    },
    awards: { title: "Premios", body: () => renderAwards(awards ?? []) },
    certificates: {
      title: "Certificados",
      body: () => renderCertificates(certificates ?? []),
    },
    projects: {
      title: "Proyectos",
      body: () => renderProjects(projects ?? []),
    },
    interests: {
      title: "Intereses",
      body: () => renderInterests(interests ?? []),
    },
    references: {
      title: "Referencias",
      body: () => renderReferences(references ?? []),
    },
    publications: {
      title: "Publicaciones",
      body: () => renderPublications(publications ?? []),
    },
  };

  const sectionsLatex = sectionOrder
    .map((key) => {
      const s = sectionRenderer[key];
      if (!s) return "";
      const body = s.body();
      return body
        ? `\\vspace{12pt}\n\\begin{center}\\textbf{${s.title}}\\end{center}\n${body}`
        : "";
    })
    .filter(Boolean)
    .join("\n");

  return `\\documentclass[11pt]{article}
\\setlength{\\parindent}{0pt}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[left=1.06cm,top=1.7cm,right=1.06cm,bottom=0.49cm]{geometry}

\\hypersetup{colorlinks=true, urlcolor=black, linkcolor=black}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
  \\textbf{${escapeLaTeX(basics.name)}}\\\\
  \\hrulefill
\\end{center}

\\begin{center}
  ${contactParts.join(" \\textbullet\\ ")}
\\end{center}

\\vspace{0.5pt}

${sectionsLatex}

\\end{document}
`;
}

// Registration

registerTemplate({
  id: "harvard",
  name: "Harvard",
  description:
    "Diseño caracterizado por ser limpio y sin muchos adornos. Centrado en la legibilidad y organización clara de la información.",
  preview: "🎓",
  generate,
});
