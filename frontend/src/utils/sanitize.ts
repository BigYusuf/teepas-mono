// utils/sanitizeDraftData.ts
export function sanitizeDraftData(data: Record<string, any>) {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (
      value === "" ||
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0)
    ) {
      continue; // skip invalid or empty values
    }

    cleaned[key] = value;
  }

  return cleaned;
}
