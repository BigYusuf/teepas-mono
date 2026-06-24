"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import axiosInstance from "@/utils/axiosInstance";
import { usePathname, useRouter } from "next/navigation";
import BottomActionBar from "packages/components/buttom-action";
// import { properties } from "packages/types/generatedTypes";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import BasicInfoStep from "@/shared/components/create-property/basic-info";
import LocationStructure from "@/shared/components/create-property/location-and-structure";
import Pricing from "@/shared/components/create-property/pricing-details";
import DetailsStep from "@/shared/components/create-property/mored-details";
import MediaUploadStep from "@/shared/components/create-property/media-upload";
import PropertySummaryReview from "@/shared/components/create-property/review";
import { Loader2 } from "lucide-react";

const Page = () => {
  const {
    register,
    control,
    reset,
    watch,
    clearErrors,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({});

  const queryClient = useQueryClient();
  const handleChange = (field: any) => {
    // Whenever user types again, clear that field's error
    clearErrors(field);
  };

  const [images, setImages] = useState<
    (null | { file: File; base64: string })[]
  >([null]); // Start with one empty slot

  const [floorPlans, setFloorPlans] = useState<(null | any)[]>([null]);
  const [documents, setDocuments] = useState<(null | any)[]>([null]);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "loading" | "success" | "error" | "info"
  >("success");
  const pathname = usePathname(); // e.g. /dashboard/all-properties/prop1

  // extract slug after '/all-properties/'
  const propertySlug = useMemo(() => {
    const parts = pathname.split("/"); // ["", "dashboard", "all-properties", "prop1"]
    return parts[parts.length - 1]; // "prop1"
  }, [pathname]);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", propertySlug],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/property/get-property/${propertySlug}`
      );
      return res.data.property;
    },
    enabled: !!propertySlug, // only fetch if slug exists
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (message || messageType) {
        setMessage("");
        setMessageType("info");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, messageType]);

  console.log("property", property);
  // When property loads, populate images from saved form
  useEffect(() => {
    if (!property) return;

    // 🔹 Reset form values
    reset({
      ...property,
      yearBuilt: property.yearBuilt?.toString() || "",

      structure: property?.structure,
      floorPlans: property?.floorPlans || [],
      documents: property?.documents || [],
      images: property?.images || [],
      bedrooms: property?.structure?.bedrooms || 0,
      bathrooms: property?.structure?.bathrooms || 0,
      toilets: property?.structure?.toilets || 0,
      livingRooms: property?.structure?.livingRooms || 0,
      kitchens: property?.structure?.kitchens || 0,
      kitchenType: property?.structure?.kitchenType || "PRIVATE",
      toiletLocation: property?.structure?.toiletLocation || "INDOOR",
      isWholeBuilding: property?.structure?.isWholeBuilding || false,
      isServiced: property?.structure?.isServiced || false,
      hasBalcony: property?.structure?.hasBalcony || false,
      petPolicy: property?.structure?.petPolicy || "NOT_ALLOWED",
      petDetails: property?.structure?.petDetails || [],
      // 🔹 PRICING
      pricing: property?.pricing || {},
      basePrice: property?.pricing?.basePrice || 0,
      cautionFee: property?.pricing?.cautionFee || 0,
      agentFee: property?.pricing?.agentFee || 0,
      legalFee: property?.pricing?.legalFee || 0,
      serviceCharge: property?.pricing?.serviceCharge || 0,
      paymentType: property?.pricing?.paymentType || "RENT",
      paymentFrequency: property?.pricing?.paymentFrequency || "MONTHLY",
      leaseTerm: property?.pricing?.leaseTerm || "SHORT_TERM",
      currency: property?.pricing?.currency || "NGN",
      negotiable: property?.pricing?.negotiable || false,

      customFeatures: property?.customFeatures || [],
    });

    // 🔹 Normalize images
    if (property?.images?.length) {
      const normalizedImages = property.images
        .map((img: any) => {
          if (img?.base64) return { file: null, base64: img.base64 };
          if (typeof img === "string" && img.includes("ik.imagekit.io"))
            return img;
          if (img?.url && img.url.includes("ik.imagekit.io")) return img;
          return null;
        })
        .filter(Boolean);

      setImages([...normalizedImages, null]);
      setValue("images", [...normalizedImages, null]);
    }

    // 🔹 Normalize floorPlans
    if (property?.floorPlans?.length) {
      const normalizedFloorPlans = property.floorPlans.map((plan: any) => ({
        file: null, // new upload placeholder
        name: plan.name,
        description: plan.description,
        imageUrl: plan.imageUrl, // existing file
        layout: plan.layout,
        fileId: plan.fileId,
      }));
      setFloorPlans([...normalizedFloorPlans, null]);
      setValue("floorPlans", [...normalizedFloorPlans, null]); // add placeholder
    }

    // 🔹 Normalize documents
    if (property?.documents?.length) {
      const normalizedDocs = property.documents.map((doc: any) => ({
        file: null, // new upload placeholder
        name: doc.name,
        type: doc.type,
        url: doc.url, // existing file
        fileId: doc.fileId,
        verified: doc.verified,
        verifiedAt: doc.verifiedAt,
        uploadedById: doc.uploadedById,
      }));
      setDocuments([...normalizedDocs, null]);
      setValue("documents", [...normalizedDocs, null]); // add placeholder
    }
  }, [property, reset, setValue]);


  const propertyType = watch("type");

  // Automatically update bedroom & living room counts for studio
  useEffect(() => {
    if (propertyType === "SELF_CONTAIN") {
      // cast key to any because 'bedrooms' / 'livingRooms' are not present on the generated `properties` type
      setValue("bedrooms" as any, 0);
      setValue("livingRooms" as any, 0);
    }
  }, [propertyType, setValue]);

  const submitNext = async () => {
    const val = getValues();
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
    const val = getValues();

    if (val?.title?.length < 3) {
      setMessage("Enter a valid Property title!");
      setMessageType("error");
      return toast.error("Enter a valid Property title!");
    }
    console.log("val.tit", val?.title);
    await handleSubmitProperty(val, "SAVE");
  };

  const handlePublish = async () => {
    if (!property?.id) {
      toast.error("No property found.");
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.put(
        `/property/create-property-publish/${property?.id}`
      );

      toast.success("Property updated successfully!");
      router.push("/dashboard/all-properties");
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish property");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProperty = async (data: any, status: "NEXT" | "SAVE") => {
    try {
      if (status === "SAVE") {
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
          ? `/property/update-property/${property?.id}`
          : currentStep === 2
          ? "/property/create-property-location"
          : currentStep === 3
          ? "/property/create-property-pricing"
          : currentStep === 4
          ? "/property/create-property-features"
          : "/property/create-property";

      if (property?.id && currentStep === 1) {
        response = await axiosInstance.put(
          `/property/update-property/${property?.id}`,
          payload
        );
      } else if (property?.id && currentStep > 1) {
        response = await axiosInstance.put(
          `${url + "/" + property?.id}`,
          payload
        );
      } else {
        response = await axiosInstance.put(url, payload);
      }

      if (status === "SAVE") {
        toast.success("Update saved successfully!");
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
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin mb-2" />
        Fetching all data about property...
      </div>
    );
  }
  return (
    <div className="w-full mx-auto p-8 shadow-md rounded-lg text-white min-h-[80vh]">
      {/* Heading & Breadcrumbs */}
      {currentStep <= 5 && (
        <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
          {"Edit Property " + property?.slug}
        </h2>
      )}
      {currentStep <= 5 && <BreadCrumbs title="Edit Property" />}
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
                  floorPlans={floorPlans}
                  setFloorPlans={setFloorPlans}
                  documents={documents}
                  setDocuments={setDocuments}
                  draftMeta={property}
                  register={register}
                  errors={errors}
                  control={control}
                />
              </form>
            )}

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
            data={getValues()}
            onBack={() => setCurrentStep(5)}
            onPublish={async () => handlePublish()}
          />
        )}
      </div>
    </div>
  );
};

export default Page;
