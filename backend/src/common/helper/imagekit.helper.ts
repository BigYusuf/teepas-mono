import { imagekit } from "../../libs/imagekit";

// Helper function to upload base64 file to ImageKit
export const uploadFile = async (
  file: string,
  name: string,
  agencyId: string,
  dir?: string,
) => {
  if (!file) return null;
  const uploadResponse = await imagekit.upload({
    file,
    fileName: `${agencyId}_${name}_${Date.now()}`,
    folder: dir || `/agency-documents/${agencyId}`,
  });
  return uploadResponse.url;
};
