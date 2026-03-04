import type { Resume } from "@/types/resume";
import { escapeLaTeX } from "../escape";
import { formatDate } from "../helpers";
import { registerTemplate } from "../registry";
import { DEFAULT_SECTION_ORDER, type SectionKey } from "../types";

// Section renderers

function renderWork(work: Resume["work"]): string {
  if (!work || work.length === 0) return "";
  return work
    .map(
      (w) => `
  \\subsection*{${escapeLaTeX(w.position)} --- ${escapeLaTeX(w.name)}}
  \\textit{${formatDate(w.startDate)} -- ${formatDate(w.endDate)}}${w.url ? ` \\hfill \\href{${escapeLaTeX(w.url)}}{${escapeLaTeX(w.url)}}` : ""}

  ${w.summary ? escapeLaTeX(w.summary) : ""}
  ${
    w.highlights && w.highlights.length > 0
      ? `\\begin{itemize}\n  ${w.highlights.map((h) => `  \\item ${escapeLaTeX(h)}`).join("\n")}\n  \\end{itemize}`
      : ""
  }`,
    )
    .join("\n\\medskip\n");
}

function renderEducation(education: Resume["education"]): string {
  if (!education || education.length === 0) return "";
  return education
    .map(
      (e) => `
  \\subsection*{${escapeLaTeX(e.studyType ? `${e.studyType} en ${e.area}` : e.area)} --- ${escapeLaTeX(e.institution)}}
  \\textit{${formatDate(e.startDate)} -- ${formatDate(e.endDate)}}${e.score ? ` \\hfill Nota: ${escapeLaTeX(e.score)}` : ""}`,
    )
    .join("\n\\medskip\n");
}

function renderVolunteer(volunteer: Resume["volunteer"]): string {
  if (!volunteer || volunteer.length === 0) return "";
  return volunteer
    .map(
      (v) => `
  \\subsection*{${escapeLaTeX(v.position)} --- ${escapeLaTeX(v.organization)}}
  \\textit{${formatDate(v.startDate)} -- ${formatDate(v.endDate)}}

  ${v.summary ? escapeLaTeX(v.summary) : ""}
  ${
    v.highlights && v.highlights.length > 0
      ? `\\begin{itemize}\n  ${v.highlights.map((h) => `  \\item ${escapeLaTeX(h)}`).join("\n")}\n  \\end{itemize}`
      : ""
  }`,
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
        `${a.awarder ? `${escapeLaTeX(a.awarder)} ` : ""}` +
        `${a.date ? `\\textit{(${formatDate(a.date)})}` : ""}` +
        `${a.summary ? `\n\n  ${escapeLaTeX(a.summary)}` : ""}`,
    )
    .join("\n\\medskip\n");
}

function renderCertificates(certificates: Resume["certificates"]): string {
  if (!certificates || certificates.length === 0) return "";
  return certificates
    .map(
      (c) =>
        `\\subsection*{${escapeLaTeX(c.name)}}\n  ` +
        `${c.issuer ? `${escapeLaTeX(c.issuer)}` : ""}` +
        `${c.date ? ` \\textit{(${formatDate(c.date)})}` : ""}` +
        `${c.url ? ` --- \\href{${escapeLaTeX(c.url)}}{enlace}` : ""}`,
    )
    .join("\n\\medskip\n");
}

function renderProjects(projects: Resume["projects"]): string {
  if (!projects || projects.length === 0) return "";
  return projects
    .map(
      (p) => `
  \\subsection*{${escapeLaTeX(p.name)}${p.url ? ` --- \\href{${escapeLaTeX(p.url)}}{enlace}` : ""}}
  ${p.startDate || p.endDate ? `\\textit{${formatDate(p.startDate)} -- ${formatDate(p.endDate)}}` : ""}

  ${p.description ? escapeLaTeX(p.description) : ""}
  ${
    p.highlights && p.highlights.length > 0
      ? `\\begin{itemize}\n  ${p.highlights.map((h) => `  \\item ${escapeLaTeX(h)}`).join("\n")}\n  \\end{itemize}`
      : ""
  }`,
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
        `${p.publisher ? `${escapeLaTeX(p.publisher)}` : ""}` +
        `${p.releaseDate ? ` \\textit{(${formatDate(p.releaseDate)})}` : ""}` +
        `${p.url ? ` --- \\href{${escapeLaTeX(p.url)}}{enlace}` : ""}` +
        `${p.summary ? `\n\n  ${escapeLaTeX(p.summary)}` : ""}`,
    )
    .join("\n\\medskip\n");
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
    skills,
    languages,
    volunteer,
    awards,
    certificates,
    projects,
    interests,
    references,
    publications,
  } = resume;

  const contactParts: string[] = [];
  if (basics.email)
    contactParts.push(
      `\\href{mailto:${basics.email}}{${escapeLaTeX(basics.email)}}`,
    );
  if (basics.phone) contactParts.push(escapeLaTeX(basics.phone));
  if (basics.url)
    contactParts.push(`\\href{${basics.url}}{${escapeLaTeX(basics.url)}}`);
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.countryCode]
      .filter(Boolean)
      .map(escapeLaTeX)
      .join(", ");
    contactParts.push(loc);
  }

  const profileLinks = (basics.profiles ?? [])
    .map((p) => `\\href{${p.url}}{${escapeLaTeX(p.network)}}`)
    .join(" \\textbullet{} ");

  const sectionRenderer: Record<
    SectionKey,
    { title: string; body: () => string }
  > = {
    work: { title: "Experiencia", body: () => renderWork(work ?? []) },
    education: {
      title: "Formación",
      body: () => renderEducation(education ?? []),
    },
    volunteer: {
      title: "Voluntariado",
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
      return body ? `\\section*{${s.title}}\n${body}` : "";
    })
    .filter(Boolean)
    .join("\n\n");

  return `\\documentclass[11pt,a4paper]{article}

% Packages
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[spanish]{babel}
\\usepackage[top=2cm, bottom=2cm, left=2.2cm, right=2.2cm]{geometry}
\\usepackage{hyperref}
\\usepackage{parskip}
\\usepackage{enumitem}
\\usepackage{titlesec}

% Style
\\hypersetup{colorlinks=true, urlcolor=black, linkcolor=black}
\\pagestyle{empty}
\\setlist[itemize]{leftmargin=*, topsep=2pt, itemsep=1pt}
\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{8pt}{4pt}

% Document
\\begin{document}

{\\Huge \\textbf{${escapeLaTeX(basics.name)}}}
\\\\[2pt]
{\\large ${escapeLaTeX(basics.label)}}
\\\\[4pt]
${contactParts.join(" \\quad ")}
${profileLinks ? `\\\\[2pt]\n${profileLinks}` : ""}

${basics.summary ? `\\section*{Sobre mí}\n${escapeLaTeX(basics.summary)}` : ""}

${sectionsLatex}

\\end{document}
`;
}

registerTemplate({
  id: "default",
  name: "Clásico",
  description:
    "Diseño limpio con secciones separadas por líneas. Equilibrio entre legibilidad y densidad de información.",
  preview: "📄",
  generate,
});
