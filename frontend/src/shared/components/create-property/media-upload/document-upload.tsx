import React, { useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import Input from "packages/components/input";
import { Trash, Upload, Loader2 } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { uploadDocument } from "@/utils/upload";
import { toast } from "sonner";

const documentTypeOptions = [
  { label: "Certificate of Occupancy", value: "COFO" },
  { label: "Survey Plan", value: "SURVEY_PLAN" },
  { label: "Deed", value: "DEED" },
  { label: "Allocation Letter", value: "ALLOCATION_LETTER" },
  { label: "Building Plan", value: "BUILDING_PLAN" },
  { label: "Tax Receipt", value: "TAX_RECEIPT" },
  { label: "Other", value: "OTHER" },
];

const DocumentUpload = ({ register, control, getValues, propertyId }: any) => {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "documents",
  });

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addDocument = () =>
    append({ name: "", type: "OTHER", url: "", fileId: null });

  const handleCreateDocument = async (index: number) => {
    const docData = getValues(`documents.${index}`);
    const { name, type, url } = docData;

    if (!propertyId) {
      toast.error("Missing property ID");
      return;
    }

    if (!url) {
      toast.info("Please upload a document file first.");
      return;
    }

    try {
      setUploadingIndex(index);

      let uploadedUrl = url;
      let fileId: string | null = null;

      // 🧩 Upload file to ImageKit if new
      if (url instanceof File) {
        const base64 = await toBase64(url);
        const uploadedFile = await uploadDocument(base64);
        uploadedUrl = uploadedFile.url;
        fileId = uploadedFile.fileId;
      }

      // 🧩 Save document to backend
      const { data } = await axiosInstance.post(
        "/property/add-property-document",
        {
          propertyId,
          name,
          type,
          url: uploadedUrl,
          fileId,
        }
      );

      // Update field with returned data
      update(index, {
        ...docData,
        url: data.document.url,
        fileId: data.document.fileId,
      });

      toast.success("Document uploaded successfully!");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleDeleteDocument = async (index: number) => {
    const doc = getValues(`documents.${index}`);
    try {
      if (doc.fileId) {
        await axiosInstance.delete(
          `/property/delete-property-document/${doc.fileId}`
        );
      }
      remove(index);
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  // Helper: Convert file → base64
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
              label="Document Name"
              placeholder="e.g. Certificate of Occupancy"
              {...register(`documents.${index}.name`)}
            />

            <Controller
              control={control}
              name={`documents.${index}.type`}
              render={({ field }) => (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Document Type
                  </label>
                  <select
                    {...field}
                    className="w-full bg-gray-800 text-white rounded-md p-2 border border-gray-700"
                  >
                    {documentTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />
          </div>

          <Controller
            control={control}
            name={`documents.${index}.url`}
            render={({ field }) => (
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Upload File
                </label>

                {typeof field.value === "string" && field.value ? (
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
                      onClick={() => field.onChange("")}
                      className="text-red-400 hover:text-red-500 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".pdf,image/*"
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
              onClick={() => handleDeleteDocument(index)}
              className="flex items-center gap-2 text-red-400 hover:text-red-500 text-sm font-medium"
            >
              <Trash size={16} /> Delete
            </button>

            <button
              type="button"
              onClick={() => handleCreateDocument(index)}
              disabled={uploadingIndex === index}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-500 text-sm font-medium"
            >
              {uploadingIndex === index ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} /> Upload
                </>
              )}
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-400 text-sm">
          Add another document section
        </span>
        <button
          type="button"
          onClick={addDocument}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Upload size={16} /> Add Document
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;
