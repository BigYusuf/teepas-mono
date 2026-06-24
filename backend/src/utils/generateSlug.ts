import slugify from "slugify";

export const generatePropertySlug = (property: {
  bedrooms: number;
  price: number;
  city: string;
  title?: string;
  type?: string;
}) => {
  let titlePart = "";

  if (property.title) {
    // Take first 6–8 words max or 50 characters
    const words = property.title.split(/\s+/).slice(0, 8).join(" ");
    titlePart = `-${words}`;
  }

  let slug = slugify(
    `property-${property.type}-${property.bedrooms}bd-${property.price}-${property.city}${titlePart}`,
    { lower: true, strict: true }
  );

  // Final safety: truncate to 100 chars
  if (slug.length > 100) slug = slug.substring(0, 100);

  return slug;
};
