export function escapeLaTeX(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);

  return str
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\$/g, "\\$")
    .replace(/&/g, "\\&")
    .replace(/#/g, "\\#")
    .replace(/\^/g, "\\^{}")
    .replace(/_/g, "\\_")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/%/g, "\\%");
}
