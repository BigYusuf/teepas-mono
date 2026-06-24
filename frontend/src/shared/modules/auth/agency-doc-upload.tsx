import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import ImagePlaceHolder from "../../components/image-placeholder";

const UploadAgencyDocuments = ({
  agencyId,
  setActiveStep,
}: {
  agencyId: string;
  setActiveStep: (step: number) => void;
}) => {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [images, setImages] = useState<any[]>([null]); // for brand assets
  const [certificates, setCertificates] = useState<any[]>([null]);
  const [idDocs, setIdDocs] = useState<any[]>([null]);
  const [taxDocs, setTaxDocs] = useState<any[]>([null]);
  const [businessType, setBusinessType] = useState("personal");

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/upload-agency-documents`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(4);
    },
  });

  const onSubmit = (data: any) => {
    const formData = new FormData();
    formData.append("agencyId", agencyId);
    formData.append("businessType", businessType);

    // Append all images
    const appendFiles = (files: any[], fieldName: string) => {
      files.forEach((item, i) => {
        if (item?.file) formData.append(fieldName, item.file);
      });
    };

    appendFiles(certificates, "businessCertificates");
    appendFiles(idDocs, "idDocuments");
    appendFiles(taxDocs, "taxDocuments");
    appendFiles(images, "brandAssets");

    uploadMutation.mutate(formData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Upload Agency Documents
        </h3>

        {/* Business type */}
        <label className="block text-gray-700 mb-1">Account Type *</label>
        <select
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-3"
        >
          <option value="personal">Personal</option>
          <option value="business">Business</option>
        </select>

        {/* Uploads */}
        {businessType === "business" && (
          <>
            <p className="text-gray-800 font-medium mb-2">
              Upload Business Registration Certificate
            </p>
            <ImagePlaceHolder
              size="800x600"
              images={certificates}
              setImages={setCertificates}
              index={0}
              setValue={setValue}
            />
          </>
        )}

        <div className="mt-4">
          <p className="text-gray-800 font-medium mb-2">Upload ID</p>
          <ImagePlaceHolder
            size="400x400"
            images={idDocs}
            setImages={setIdDocs}
            index={0}
            setValue={setValue}
          />
        </div>

        <div className="mt-4">
          <p className="text-gray-800 font-medium mb-2">
            Upload Tax / CAC Document
          </p>
          <ImagePlaceHolder
            size="800x600"
            images={taxDocs}
            setImages={setTaxDocs}
            index={0}
            setValue={setValue}
          />
        </div>

        <div className="mt-4">
          <p className="text-gray-800 font-medium mb-2">
            Agency Logo / Brand Assets
          </p>
          <ImagePlaceHolder
            size="800x800"
            images={images}
            setImages={setImages}
            index={0}
            setValue={setValue}
          />
        </div>

        <button
          type="submit"
          className="w-full text-lg bg-blue-600 text-white py-2 rounded-lg mt-6"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default UploadAgencyDocuments;
