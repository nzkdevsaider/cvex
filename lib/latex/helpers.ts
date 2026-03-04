export function formatDate(date: string): string {
  if (!date) return "Actualidad";
  const parts = date.split("-");
  if (parts.length >= 2) {
    const months = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ];
    const month = parseInt(parts[1], 10) - 1;
    return `${months[month] ?? parts[1]}. ${parts[0]}`;
  }
  return date;
}
