
export function toSentenceCase(str: string) {
  if (!str) return "";
  // Lowercase everything first
  str = str.toLowerCase();

  // Capitalize first non-space after start or punctuation (.!?)
  return str.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
}