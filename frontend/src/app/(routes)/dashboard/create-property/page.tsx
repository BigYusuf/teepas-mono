"use client";
import { useQueryClient } from "@tanstack/react-query";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import axiosInstance from "@/utils/axiosInstance";
import { FileWarning, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import BottomActionBar from "packages/components/buttom-action";
import ConfirmModal from "@/shared/components/modals/confirmation.modal";
import { properties } from "packages/types/generatedTypes";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import useFormDraft from "@/hooks/useFormDraft";
import BasicInfoStep from "@/shared/components/create-property/basic-info";
import LocationStructure from "@/shared/components/create-property/location-and-structure";
import Pricing from "@/shared/components/create-property/pricing-details";
import DetailsStep from "@/shared/components/create-property/mored-details";
import MediaUploadStep from "@/shared/components/create-property/media-upload";
import PropertySummaryReview from "@/shared/components/create-property/review";

const defaultValues = {
  title: "",
  description: "",
  tags: "",
  type: "",
  category: "",
  purpose: "",
  designType: "",
  customSpecifications: [],
  customFeatures: [],
  amenities: [],
  nearByLocation: [],
  availability: "AVAILABLE_NOW",
  availableFrom: null,
  lease: "ONE_YEAR",
  paymentFrequency: "YEARLY",
  furnishing: "UNFURNISHED",
  address: null,
  showTo: "APPROVED_ONLY",
  country: "NG",
  city: "",
  state: "",
  floorType: "CEMENT",
  wallFinish: "BARE_CEMENT",
  ceilingType: "GYPSUM_BOARD",
  squareFeet: null,
  sizeSqm: null,
  landSizeSqm: null,
  buildingMaterial: "CEMENT_BLOCK",
  cooling: "NO_COOLING",
  heating: "NO_HEATING",
  yearBuilt: "",
  video_url: "",
  parking: "COMPOUND",
  waterSupply: "BOREHOLE",
  electricity: "GRID",
  electricBilling: "NO_METER",
  construction: "COMPLETED",
  currency: "NGN",
  security: [],
  promotions: [],
  status: "ACTIVE",
  images: [],
  floorPlans: [],
  structure: null,
  pricing: null,
  documents: [],
  condition: "GOOD",
};

const Page = () => {
  const formm = useFormDraft<any>("property", defaultValues, {
    getDraft: "/property/get-draft-property",
    deleteDraft: (id) => `/property/permanent-delete-property/${id}`,
  });

  const {
    register,
    control,
    watch,
    clearErrors,
    setValue,
    getValues,
    handleSubmit,
    loadedDraft,
    showDraftModal,
    handleLoadDraft,
    handleDiscardDraft,
    handleCancelDraft,
    formState: { errors },
  } = formm;

  const queryClient = useQueryClient();
  const handleChange = (field: any) => {
    // Whenever user types again, clear that field's error
    clearErrors(field);
  };

  const [images, setImages] = useState<
    (null | { file: File; base64: string })[]
  >([null]); // Start with one empty slot

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [draftMeta, setDraftMeta] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(draftMeta?.currentStep || 1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "loading" | "success" | "error" | "info"
  >("success");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (message || messageType) {
        setMessage("");
        setMessageType("info");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, messageType]);

  // When draft loads, populate images from saved form
  useEffect(() => {
    if (!loadedDraft) return;

    const saved = localStorage.getItem("propertyDraft");
    const savedMeta = localStorage.getItem("propertyDraftMeta");
    if (!saved) return;

    const parsedMeta = JSON.parse(savedMeta);
    setDraftMeta(parsedMeta);

    const parsed = JSON.parse(saved);
    setCurrentStep(parsed?.currentStep || parsed?.progressStep || 1); //adjust step if it existed

    if (parsed.images?.length) {
      const normalized = (parsed.images || [])
        .map((img: any) => {
          if (img?.base64) return { file: null, base64: img.base64 };
          if (typeof img === "string" && img.includes("ik.imagekit.io"))
            return img; // ImageKit URL
          if (img?.url && img.url.includes("ik.imagekit.io")) return img;
          return null;
        })
        .filter(Boolean); // ✅ remove any nulls

      // ✅ Only add ONE null placeholder at the end
      setImages([...normalized, null]);
      setValue("images", [...normalized, null]);
    }
  }, [loadedDraft]);

  const val = getValues();
  const propertyType = watch("type");

  // Automatically update bedroom & living room counts for studio
  useEffect(() => {
    if (propertyType === "SELF_CONTAIN") {
      setValue("bedrooms", 0);
      setValue("livingRooms", 0);
    }
  }, [propertyType, setValue]);

  const submitNext = async () => {
    if (currentStep === 1) {
      if (val?.title?.length < 3) {
        setMessage("Enter a valid Property title!");
        setMessageType("error");
        return toast.error("Enter a valid Property title!");
      }
    }
    if (currentStep !== 5) {
      handleSubmitProperty(val, "NEXT");
    }
    handleNext();
  };
  const handleSaveDraft = async () => {
    if (val?.title?.length < 3) {
      setMessage("Enter a valid Property title!");
      setMessageType("error");
      return toast.error("Enter a valid Property title!");
    }

    await handleSubmitProperty(val, "DRAFT");
  };

  // Safe JSON helper (handles circular structures)
  const safeStringify = (obj: any) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return; // Remove circular reference
        seen.add(value);
      }
      if (
        typeof value === "function" ||
        value instanceof HTMLElement ||
        value instanceof File ||
        value instanceof Blob ||
        (value && value.target && value.currentTarget) // event objects
      ) {
        return undefined;
      }
      return value;
    });
  };
  const cleanPayload = (data: any) => {
    const omit = ["nearbyLocation", "tempImages", "draftOnly"];
    return Object.fromEntries(
      Object.entries(data).filter(([key]) => !omit.includes(key))
    );
  };

  const handlePublish = async () => {
    if (!draftMeta?.id) {
      toast.error("No draft property found.");
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.put(
        `/property/create-property-publish/${draftMeta.id}`
      );

      toast.success("Property published successfully!");
      localStorage.removeItem("propertyDraft");
      localStorage.removeItem("propertyDraftMeta");
      router.push("/dashboard/all-properties");
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish property");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProperty = async (data: any, status: "NEXT" | "DRAFT") => {
    try {
      if (status === "DRAFT") {
        setLoading(true);
      }

      // 🔹 Sanitize images before sending or saving
      const sanitizedImages = (data.images || [])
        .filter(Boolean)
        .map((img: any) => {
          if (img?.base64) return { base64: img.base64 };
          if (img?.url) return { url: img.url, file_id: img.file_id };
          return null;
        })
        .filter(Boolean);

      const payload = {
        ...data,
        status,
        images: sanitizedImages,
      };

      let response;
      let url =
        currentStep === 1
          ? "/property/create-property-basic"
          : currentStep === 2
          ? "/property/create-property-location"
          : currentStep === 3
          ? "/property/create-property-pricing"
          : currentStep === 4
          ? "/property/create-property-features"
          : "/property/create-property";

      // if (status === "DRAFT") {
      if (draftMeta?.id && currentStep === 1) {
        response = await axiosInstance.put(
          `/property/update-property/${draftMeta.id}`,
          payload
        );
      } else if (draftMeta?.id && currentStep > 1) {
        response = await axiosInstance.put(
          `${url + "/" + draftMeta.id}`,
          payload
        );
      } else {
        response = await axiosInstance.post(url, payload);
      }

      const draftId = response?.data?.property?.id || response?.data?.id;
      if (draftId) {
        localStorage.setItem(
          "propertyDraftMeta",
          JSON.stringify({ id: draftId, status: "DRAFT" })
        );
      }

      const addedStepPayload = {
        ...payload,
        currentStep: response?.data?.nextStep,
      };
      // ✅ Use safeStringify to prevent circular structure error
      const safePayload = safeStringify(addedStepPayload);
      localStorage.setItem("propertyDraft", safePayload);
      if (status === "DRAFT") {
        toast.success("Draft saved successfully!");
      }
      setMessage("Your Progess saved successfully!");
      setMessageType("success");
    } catch (error: any) {
      setMessageType("error");
      setMessage("Error occured!");

      toast.error(
        error?.response?.data?.message ||
          error?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
      setLoading(false);
    }
  };

  /// ⛔ Don’t render form until draft check completes
  if (!loadedDraft && !showDraftModal) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin mb-2" />
        Checking for saved draft...
      </div>
    );
  }

  // ✅ Show draft modal if one exists
  if (showDraftModal) {
    return (
      <ConfirmModal
        isOpen={showDraftModal}
        title="Existing draft found"
        description="A saved draft for this property was found. You can load it, discard it, or cancel to stay on this page."
        warning="If you discard the draft, it will be deleted from both your device and the server."
        primaryText="Load Draft"
        secondaryText="Discard Draft"
        tertiaryText="Cancel"
        primaryColor="green"
        secondaryColor="red"
        icon={<FileWarning className="text-yellow-400" />}
        onPrimary={handleLoadDraft}
        onSecondary={handleDiscardDraft}
        onTertiary={handleCancelDraft}
      />
    );
  }

  const steps = [
    { title: "Basic Information", step: 1 },
    { title: "Location & Structure", step: 2 },
    { title: "Pricing", step: 3 },
    { title: "More Details", step: 4 },
    { title: "Media Upload", step: 5 },
  ];

  const handleNext = () => {
    setCurrentStep((prev) => (prev < steps.length + 1 ? prev + 1 : prev));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="w-full mx-auto p-8 shadow-md rounded-lg text-white min-h-[80vh]">
      {/* Heading & Breadcrumbs */}
      {currentStep <= 5 && (
        <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
          Create Property
        </h2>
      )}
      {currentStep <= 5 && <BreadCrumbs title="Create Property" />}
      <div className="w-full flex flex-col gap-3">
        {currentStep <= 5 && (
          <div className="flex items-center justify-between my-6 w-full">
            {steps.map((item) => (
              <React.Fragment key={item.step}>
                {/* Step circle + title */}
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center 
            ${
              item.step === currentStep
                ? "bg-blue-600 text-white"
                : item.step < currentStep
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-400"
            }`}
                  >
                    {item.step}
                  </div>
                  <span
                    className={`mt-2 text-sm ${
                      item.step === currentStep
                        ? "text-blue-400 font-semibold"
                        : "text-gray-400"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>

                {/* Connecting line (only between steps) */}
                {item.step < steps.length && (
                  <div
                    className={`flex-1 h-[2px] mx-2 mb-4 ${
                      item.step < currentStep - 1
                        ? "bg-green-600"
                        : "bg-gray-600"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        {currentStep <= 5 && (
          <div className="relative w-full z-100">
            <FormProvider {...formm}>
              {currentStep === 1 && (
                <form>
                  <BasicInfoStep
                    handleChange={handleChange}
                    setValue={setValue}
                    getValues={getValues}
                    watch={watch}
                    register={register}
                    errors={errors}
                    control={control}
                  />
                </form>
              )}
              {currentStep === 2 && (
                <form>
                  <LocationStructure
                    handleChange={handleChange}
                    setValue={setValue}
                    getValues={getValues}
                    watch={watch}
                    register={register}
                    errors={errors}
                    control={control}
                  />
                </form>
              )}
              {currentStep === 3 && (
                <form>
                  <Pricing
                    handleChange={handleChange}
                    setValue={setValue}
                    getValues={getValues}
                    watch={watch}
                    register={register}
                    errors={errors}
                    control={control}
                  />
                </form>
              )}
              {currentStep === 4 && (
                <form>
                  <DetailsStep
                    handleChange={handleChange}
                    setValue={setValue}
                    getValues={getValues}
                    watch={watch}
                    register={register}
                    errors={errors}
                    control={control}
                  />
                </form>
              )}
              {currentStep === 5 && (
                <form>
                  <MediaUploadStep
                    // handleChange={handleChange}
                    setValue={setValue}
                    getValues={getValues}
                    images={images}
                    setImages={setImages}
                    draftMeta={draftMeta}
                    register={register}
                    errors={errors}
                    control={control}
                  />
                </form>
              )}
            </FormProvider>
            <BottomActionBar
              loadingDraft={loading}
              loading={false} //disable loading for next
              handleSaveDraft={handleSaveDraft}
              handleBack={handlePrevious}
              handleNext={handleSubmit(submitNext)}
              hideSave={currentStep === 5 ? true : false}
              message={loading ? "Processing" : message}
              messageType={loading ? "loading" : messageType}
              btn1Text={currentStep === 5 ? "Review" : "Next"}
              showSavedMessage={true}
            />
          </div>
        )}
        {currentStep > 5 && (
          <PropertySummaryReview
            data={val}
            onBack={() => setCurrentStep(5)}
            onPublish={async () => handlePublish()}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
