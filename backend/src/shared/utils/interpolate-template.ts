import * as ejs from "ejs";

export function renderSafe(template: string, data: any, useEjs: boolean) {
  if (!useEjs) {
    return simpleInterpolate(template, data);
  }
  const converted = template.replace(
    /{{(.*?)}}/g,
    (_, key) => `<%= ${key.trim()} %>`,
  );

  return ejs.render(converted, data);
}

export function interpolateTemplate(
  value: any,
  variables: Record<string, any>,
): any {
  if (typeof value === "string") {
    let result: any = value;

    for (const [key, rawValue] of Object.entries(variables)) {
      const safeValue =
        typeof rawValue === "object"
          ? JSON.stringify(rawValue)
          : String(rawValue);

      result = result.replaceAll(`{{${key}}}`, safeValue);

      //   result = result.replace(new RegExp(`{{${key}}}`, 'g'), safeValue);
    }

    return result;
  }

  if (Array.isArray(value)) {
    return value.map((item) => interpolateTemplate(item, variables));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        interpolateTemplate(val, variables),
      ]),
    );
  }

  return value;
}

export function shouldUseEjs(channel: string, template?: any) {
  if (!template) return false;

  if (channel === "EMAIL") return true; // HTML templates
  if (channel === "IN_APP") return true; // rich content ok

  // SMS + PUSH usually should stay plain text
  return false;
}
export function simpleInterpolate(template: string, data: any) {
  let result: any = template;

  for (const [key, value] of Object.entries(data || {})) {
    result = result.replaceAll(
      `{{${key}}}`,
      typeof value === "object" ? JSON.stringify(value) : String(value),
    );
  }

  return result;
}
