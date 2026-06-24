import axiosInstance from "./axiosInstance";

/**
 * Upload a base64 image string to the property image endpoint.
 * @param base64 - The base64 string of the image
 * @returns The uploaded image's URL
 */
export const uploadImage = async (base64: string) => {
  console.log("base64", base64);
  try {
    const res = await axiosInstance.post(
      "/property/upload-property-image",
      {
        fileName: base64, // your backend expects `fileName` key
      }
    );

    // response: { file_url, url, fileId }
    return res.data;
  } catch (err) {
    console.error("Image upload failed:", err);
    throw err;
  }
};

/**
 * Upload a base64 image string to the property image endpoint.
 * @param base64 - The base64 string of the image
 * @returns The uploaded image's URL
 */

export const uploadFloorPlan = async (base64: string) => {

  try {
    const res = await axiosInstance.post(
      "/property/upload-floor-plan",
      {
        file: base64, // your backend expects `fileName` key
      }
    );

    // response: { file_url, url, fileId }
    return res.data;
  } catch (err) {
    console.error("Floor-plan upload failed:", err);
    throw err;
  }
};
/**
 * Upload a base64 image string to the property image endpoint.
 * @param base64 - The base64 string of the image
 * @returns The uploaded image's URL
 */

export const uploadDocument = async (base64: string) => {

  try {
    const res = await axiosInstance.post(
      "/property/upload-document",
      {
        file: base64, // your backend expects `fileName` key
      }
    );

    // response: { file_url, url, fileId }
    return res.data;
  } catch (err) {
    console.error("Doc upload failed:", err);
    throw err;
  }
};
