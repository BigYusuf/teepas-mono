"use client";
import { useQuery } from "@tanstack/react-query";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import ImagePlaceHolder from "@/shared/components/image-placeholder";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { Wand2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ColorSelector from "packages/components/color-selector";
import CustomFeatures from "packages/components/custom-features";
import CustomSpecifications from "packages/components/custom-specifications";
import Input from "packages/components/input";
import RichTextEditor from "packages/components/rich-text-editor";
import SizeSelector from "packages/components/security-selector";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface UploadedImage {
  fileId: string;
  file_url: string;
}
const defaultValues = {
  title: "",
  description: "",
  platform: "",
};

const Page = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const router = useRouter();

  const searchParams = useSearchParams();
  const [activeStep, setActiveStep] = useState(1);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      toast.success("Feature Coming Soon");
      // await axiosInstance.post("/product/create-event", data);
      // router.push("/dashboard/all-products");
    } catch (error: any) {
      toast.error(error?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto p-8 shadow-md rounded-lg text-white">
      {/* Heading & Breadcrumbs */}
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Event
      </h2>
      <BreadCrumbs title="Create Event" />

      {/* Content Layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Stepper */}
        <div className="flex w-full items-center flex-col min-h-[50vh]">
          <div className="relative flex items-center justify-between md:w-[50%] mb-8">
            <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-800 z-10" />
            {[1, 2, 3].map((step) => (
              <div key={step}>
                <div
                  className={`w-10 h-10 relative z-20 flex items-center justify-center rounded-full text-white font-bold ${
                    step <= activeStep ? "bg-blue-600" : "bg-gray-500"
                  }`}
                >
                  {step}
                </div>
                <span className="ml-[-15px]">
                  {step === 1
                    ? "Create Event"
                    : step === 2
                    ? "Select Properties"
                    : "Event Type"}
                </span>
              </div>
            ))}
          </div>

          <div className="md:w-[480px] p-8 bg-gray-800 shadow rounded-lg">
            {activeStep === 1 && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-2xl font-semibold text-center mb-4">
                  Create Event
                </h3>
                <Input
                  label="Event Title *"
                  placeholder="Enter event title"
                  {...register("title", { required: "Title is required" })}
                  error={errors.title?.message as string | undefined}
                />

                <Input
                  title="E"
                  label="Event description "
                  placeholder="Enter event description"
                  type="textarea"
                  {...register("description")}
                  error={errors.description?.message as string | undefined}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-lg cursor-pointer mt-4 bg-blue-500 text-white py-2 rounded-lg"
                >
                  {loading ? " Creating..." : "Create"}
                </button>
              </form>
            )}
            {activeStep === 2 && <>step 2</>}
            {activeStep === 3 && <>step 3</>}
            {activeStep === 4 && <>Step 4</>}
          </div>
        </div>
      </div>

      {/* <div className="mt-6 flex justify-end gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div> */}
    </div>
  );
};

export default Page;
