import axiosInstance from "@/utils/axiosInstance";
import { uploadImage } from "@/utils/upload";
import { Loader2, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";

const ImagePlaceHolder = ({
  small,
  size,
  defaultImage = null,
  index = 0,
  setValue,
  images,
  setImages,
  selectedItemId, //propertyId or userId
}: {
  size: string;
  small?: boolean;
  defaultImage?: string | null;
  index?: number;
  setValue: any;
  images: any[];
  setImages: any;
  selectedItemId?: string;
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sync with parent when images change or when loading draft
  useEffect(() => {
    const current = images[index];
    if (!current) return;

    let preview =
      current?.base64 ||
      current?.url ||
      (typeof current === "string" ? current : null);

    if (preview && preview !== imagePreview) {
      setImagePreview(preview);
    } else if (!preview && defaultImage && defaultImage !== imagePreview) {
      setImagePreview(defaultImage);
    }
  }, [images, index, defaultImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;

      const updated = [...images];
      updated[index] = { base64, file };

      // Add a new empty slot if this is the last one
      if (index === images.length - 1) updated.push(null);

      setImagePreview(base64);
      setImages(updated);
      setValue("images", updated);
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const current = images[index];
    if (!current?.file || current?.url || !selectedItemId || current.__uploaded)
      return;

    const uploadAndReplace = async () => {
      try {
        setUploading(true);
        const uploadedFile = await uploadImage(current.base64);
        const updated = [...images];
        updated[index] = {
          url: uploadedFile.url,
          fileId: uploadedFile.fileId,
          isCover: false,
          __uploaded: true, // mark as done
        };
        if (uploadedFile?.url && selectedItemId) {
          await axiosInstance.post("/property/add-property-image", {
            propertyId: selectedItemId,
            url: uploadedFile?.url,
            fileId: uploadedFile?.fileId,
          });
        }
        // Ensure there’s always an empty slot
        if (updated[updated.length - 1] !== null) updated.push(null);

        setImages(updated);
        setValue("images", updated);
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    };
    uploadAndReplace();
  }, [images, index, selectedItemId]);

  // set image as cover
  const handleSetAsCover = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("cover button pressed", images[index]);

    const current = images[index];
    if (!current?.url || !selectedItemId || !current?.fileId) return;

    try {
      // Step 1: Optimistic UI update — mark selected image as cover
      const updated = images.map((img) =>
        img && typeof img === "object"
          ? { ...img, isCover: img.fileId === current.fileId }
          : img
      );

      // Step 2: Reorder — cover image comes first (non-mutating)
      const reordered = [...updated].sort((a, b) => {
        if (a?.isCover) return -1;
        if (b?.isCover) return 1;
        return 0;
      });

      setImages(reordered);
      setValue("images", reordered);
      console.log("Updated cover image:", reordered);

      // Step 3: Sync with backend
      await axiosInstance.post("/property/mark-property-image-cover", {
        propertyId: selectedItemId,
        fileId: current.fileId,
      });
    } catch (error) {
      console.error("Error marking image as cover:", error);
    }
  };

  // Handle delete (local + server If imageKit URL)
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleting) return;
    const current: any = images[index];
    const currentUrl: any = current?.url;
    const currentFileId: any = current?.fileId || current?.fileId;
    const updated = [...images];
    if (!current) return;
    console.log(current);
    //If its an imageKit URL, delete from server or else just remove locally
    if (currentUrl && currentUrl.includes("ik.imagekit.io")) {
      try {
        setDeleting(true);

        await axiosInstance.delete("/property/delete-property-image", {
          data: { fileId: currentFileId },
        });
      } catch (error) {
        console.error("Error deleting image:", error);
      } finally {
        setDeleting(false);
      }
    }
    // Remove locally
    updated[index] = null;

    const cleaned = updated.filter((img) => img !== null);

    // Ensure at least one empty slot
    if (cleaned.length === 0 || cleaned[cleaned?.length - 1]) {
      cleaned.push(null);
    }
    setImages(cleaned);
    setValue("images", cleaned);
    setImagePreview(null);
  };

  return (
    <div
      className={`relative ${
        small ? "h-[180px]" : "h-[450px]"
      } w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-md flex flex-col justify-center items-center`}
    >
      {imagePreview && (
        <button
          type="button"
          onClick={handleDelete}
          className={`absolute top-2 right-2 rounded-lg p-1 z-10 ${
            deleting || uploading
              ? "bg-gray-300 text-black"
              : "bg-red-400 hover:bg-red-700 text-white"
          }`}
          title="Delete Image"
          disabled={deleting || uploading}
        >
          {deleting || uploading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <Trash2
              className={
                small ? "w-4 h-4 md:w-5 md:h-5" : "w-5 h-5 md:w-6 md:h-6"
              }
            />
          )}
        </button>
      )}

      {imagePreview && (
        <button
          type="button"
          onClick={handleSetAsCover}
          className={`absolute top-2 left-2 rounded-lg px-2 py-1 text-xs font-semibold z-10 ${
            images[index]?.isCover
              ? "bg-yellow-400 text-black"
              : "bg-gray-700 text-white hover:bg-yellow-500"
          }`}
          title="Set as Cover"
        >
          {images[index]?.isCover ? "Cover" : "Set Cover"}
        </button>
      )}
      {/* Overlay to show size and instructions when no image */}
      <label
        htmlFor={`image-upload-${index}`}
        className="w-full h-full flex flex-col justify-center items-center cursor-pointer"
      >
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="preview"
            className="w-full h-full object-cover rounded-lg"
            onError={() => setImagePreview(null)} // fallback if URL fails
          />
        ) : (
          <>
            <p
              className={`text-gray-400 ${
                small ? "text-xl" : "text-4xl"
              } font-semibold`}
            >
              {size}
            </p>
            <p
              className={`text-gray-500 ${
                small ? "text-sm" : "text-lg"
              } pt-2 text-center`}
            >
              Please choose an image <br />
              according to the expected ratio
            </p>
          </>
        )}
      </label>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleImageChange}
      />
    </div>
  );
};

export default ImagePlaceHolder;
