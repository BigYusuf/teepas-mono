import React from "react";
import PropertyImagesUpload from "./property-image-upload";
import FloorPlanUpload from "./floor-plan-upload";
import DocumentUpload from "./document-upload";

interface MediaUploadStepProps {
  control: any;
  errors?: any;
  register?: any;
  setValue?: (name: string, value: any) => void;
  getValues?: (name?: string) => any;
  images: any;
  setImages: any;
  floorPlans: any;
  setFloorPlans: any;
  documents: any;
  setDocuments: any;
  draftMeta: any;
}

const MediaUploadStep: React.FC<MediaUploadStepProps> = ({
  control,
  errors,
  register,
  setValue,
  getValues,
  images,
  setImages,
  floorPlans,
  setFloorPlans,
  documents,
  setDocuments,
  draftMeta,
}) => {
  return (
    <div className="py-4 w-full flex flex-col md:flex-row gap-6 pb-[100px]">
      {/* Left side - Property Images */}
      <div className="w-full md:w-[40%]">
        <h2 className="text-lg font-semibold text-gray-200 mb-3">
          Property Images
        </h2>

        <div className="flex flex-col gap-4 w-full">
          <PropertyImagesUpload
            images={images}
            setValue={setValue}
            setImages={setImages}
            draftMeta={draftMeta}
            getValues={getValues}
          />
        </div>
      </div>

      {/* Right side - Floor Plans + Documents */}
      <div className="w-full md:w-[60%]">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Floor Plans */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-lg font-semibold text-gray-200 mb-3">
              Floor Plans
            </h2>
            <FloorPlanUpload
              register={register}
              getValues={getValues}
              control={control}
              propertyId={draftMeta?.id}
              floorPlans={floorPlans}
              setFloorPlans={setFloorPlans}
            />
          </div>

          {/* Right Column - Property Documents */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-lg font-semibold text-gray-200 mb-3">
              Property Documents
            </h2>
            <DocumentUpload
              register={register}
              getValues={getValues}
              control={control}
              propertyId={draftMeta?.id}
              documents={documents}
              setDocuments={setDocuments}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUploadStep;
