export function findNestedValue(obj: any, targetKey: string): any {
  if (!obj || typeof obj !== 'object') return null;

  if (targetKey in obj) {
    return obj[targetKey];
  }

  for (const key in obj) {
    const result = findNestedValue(obj[key], targetKey);
    if (result !== null) {
      return result;
    }
  }

  return null;
}
export const normalizeFirebaseServiceAccount = (config: any) => {
  if (!config) return config;

  return {
    ...config,
    private_key: config.private_key?.replace(/\\n/g, "\n"),
  };
};