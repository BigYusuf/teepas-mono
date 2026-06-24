import slugify from "slugify";

export const generateOrganizationSlug = (organization: {
  id?: string;
  city?: string;
  country?: string;
  name: string;
  category?: string;
}) => {
  let namePart = "";

  if (organization.name) {
    // Take first 6–8 words max or 50 characters
    const words = organization.name.split(/\s+/).slice(0, 8).join(" ");
    namePart = `-${words}`;
  }
  //create random 6 random characters(numbers/ alphabets)
  const randomSuffix = `-${Math.random().toString(36).substr(2, 8)}`;
  let slug = slugify(`org-${namePart}${randomSuffix}`, {
    lower: true,
    strict: true,
  });

  // Final safety: truncate to 100 chars
  if (slug.length > 100) slug = slug.substring(0, 100);

  return slug;
};

export const generateAppSlug = (app: {
  id?: string;
  name: string;
  category?: string;
}) => {
  let namePart = "";

  if (app.name) {
    // Take first 6–8 words max or 50 characters
    const words = app.name.split(/\s+/).slice(0, 8).join(" ");
    namePart = `-${words}`;
  }
  const randomSuffix = app.id
    ? `-${app.id}`
    : `-${Math.random().toString(36).substr(2, 8)}`;

  let slug = slugify(`app-${namePart}-${randomSuffix}`, {
    lower: true,
    strict: true,
  });

  // Final safety: truncate to 100 chars
  if (slug.length > 100) slug = slug.substring(0, 100);

  return slug;
};
