import React, { useState, useEffect } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import Input from "packages/components/input";
import { Trash, Upload, Loader2 } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { uploadFloorPlan } from "@/utils/upload";
import { toast } from "sonner";

interface FloorPlanUploadProps {
  register: any;
  control: any;
  getValues: any;
  propertyId: string;
  floorPlans?: any[];
  setFloorPlans?: (plans: any[]) => void;
}

const FloorPlanUpload: React.FC<FloorPlanUploadProps> = ({
  register,
  control,
  getValues,
  propertyId,
  floorPlans = [],
  setFloorPlans,
}) => {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "floorPlans",
  });

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Initialize fieldArray with existing floorPlans if editing
  useEffect(() => {
    if (floorPlans.length && fields.length === 0) {
      floorPlans.forEach((plan) => append(plan));
    } else if (fields.length === 0) {
      append({ name: "", description: "", imageUrl: null });
    }
  }, [floorPlans, fields.length]);

  const addFloor = () => {
    append({ name: "", description: "", imageUrl: null });
    if (setFloorPlans) setFloorPlans([...getValues("floorPlans")]);
  };

  const handleCreateFloorPlan = async (index: number) => {
    const fieldData = getValues(`floorPlans.${index}`);
    const { name, description, imageUrl } = fieldData;

    if (!propertyId) {
      toast.error("Missing property ID");
      return;
    }

    if (!imageUrl) {
      toast.info("Please upload a floor plan file first.");
      return;
    }

    try {
      setUploadingIndex(index);

      let uploadedUrl = imageUrl;
      let fileId: string | null = null;

      // Upload to ImageKit if it's a File
      if (imageUrl instanceof File) {
        const base64 = await toBase64(imageUrl);
        const uploadedFile = await uploadFloorPlan(base64);
        uploadedUrl = uploadedFile.url;
        fileId = uploadedFile.fileId;
      }

      // Save floor plan info to backend
      const { data } = await axiosInstance.post("/property/add-floor-plan", {
        propertyId,
        name,
        description,
        imageUrl: uploadedUrl,
        fileId,
      });

      const updatedField = { ...fieldData, imageUrl: data.floorPlan.imageUrl, fileId: data.floorPlan.fileId };
      update(index, updatedField);

      // Update parent state if needed
      if (setFloorPlans) {
        const allPlans = getValues("floorPlans");
        setFloorPlans(allPlans);
      }

      toast.success("✅ Floor plan saved successfully!");
    } catch (error) {
      console.error("Error saving floor plan:", error);
      toast.error("❌ Failed to save floor plan");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleDeleteFloorPlan = async (index: number) => {
    const floor = getValues(`floorPlans.${index}`);
    try {
      if (floor.fileId) {
        await axiosInstance.delete(`/property/delete-floor-plan/${floor.fileId}`);
      }
      remove(index);

      if (setFloorPlans) {
        const allPlans = getValues("floorPlans");
        setFloorPlans(allPlans);
      }
    } catch (err) {
      console.error("Error deleting floor plan:", err);
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  return (
    <div className="space-y-6 bg-gray-800 p-5 rounded-xl border border-gray-700">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="bg-gray-900 p-4 rounded-xl border border-gray-700 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Floor Name"
              placeholder="e.g. Ground Floor"
              {...register(`floorPlans.${index}.name`)}
            />
            <Input
              label="Description"
              placeholder="Optional description"
              {...register(`floorPlans.${index}.description`)}
            />
          </div>

          <Controller
            control={control}
            name={`floorPlans.${index}.imageUrl`}
            render={({ field }) => (
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Floor Plan File
                </label>

                {field.value && typeof field.value === "string" ? (
                  <div className="flex items-center justify-between bg-gray-800 p-2 rounded-md border border-gray-700">
                    <a
                      href={field.value}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline text-sm"
                    >
                      {field.value.endsWith(".pdf") ? "View PDF" : "View Image"}
                    </a>
                    <button
                      type="button"
                      onClick={() => field.onChange(null)}
                      className="text-red-400 hover:text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                    className="w-full text-gray-300 bg-gray-800 border border-gray-700 rounded-md p-2"
                  />
                )}
              </div>
            )}
          />

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => handleDeleteFloorPlan(index)}
              className="flex items-center gap-2 text-red-400 hover:text-red-500 text-sm font-medium"
            >
              <Trash size={16} /> Delete
            </button>

            <button
              type="button"
              onClick={() => handleCreateFloorPlan(index)}
              disabled={uploadingIndex === index}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-500 text-sm font-medium"
            >
              {uploadingIndex === index ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} /> Save
                </>
              )}
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-400 text-sm">Add another floor plan section</span>
        <button
          type="button"
          onClick={addFloor}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Upload size={16} /> Add
        </button>
      </div>
    </div>
  );
};

export default FloorPlanUpload;
