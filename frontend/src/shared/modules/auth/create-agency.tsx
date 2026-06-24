import { useMutation } from "@tanstack/react-query";
import { useOnboardingStore } from "@/store/onboarding";
import { agencyCategories } from "@/utils/categories";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const CreateAgency = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { agentId, setStep, setAgencyId } = useOnboardingStore();

  const agencyCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      console.log("data", data);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/create-agency`,
        data
      );

      return response.data;
    },
    onSuccess: (data) => {
      setStep(3);
      setAgencyId(data?.agency?.id);
    },
    onError: (err: any) => {
      console.log(err);
      toast.error(
        err?.response?.data?.message || err?.data?.message || "Error occured"
      );
    },
  });

  const onSubmit = async (data: any) => {
    const agencyData = { ...data, agentId };
    agencyCreateMutation.mutate(agencyData);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup new agency
        </h3>

        <label className="block text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          placeholder="agency name"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("name", {
            required: "Name is required",
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
        )}

        <label className="block text-gray-700 mb-1">Category *</label>
        <select
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("category", { required: "Category is required" })}
        >
          <option value="">Select a category</option>
          {agencyCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm">
            {String(errors.category.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">
          Bio (Max 100 words) *
        </label>
        <input
          type="text"
          placeholder="agency bio"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("bio", {
            required: "Bio is required",
            validate: (value) =>
              countWords(value) <= 100 || "Bio can't exceed 100 words",
          })}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
        )}

        <label className="block text-gray-700 mb-1">Opening Hours *</label>
        <input
          type="text"
          placeholder="e.g., Mon-Fri 9AM - 6PM"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("openingHours", {
            required: "Opening hours are required",
          })}
        />
        {errors.openingHours && (
          <p className="text-red-500 text-sm">
            {String(errors.openingHours.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Website</label>
        <input
          type="url"
          placeholder="https://example.com"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("website", {
            pattern: {
              value: /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
              message: "Enter a valid URL",
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm">
            {String(errors.website.message)}
          </p>
        )}

        <button
          type="submit"
          disabled={agencyCreateMutation.isPending}
          className={`w-full text-lg text-white py-2 rounded-lg mt-4 ${
            agencyCreateMutation.isPending
              ? "opacity-50 cursor-not-allowed bg-slate-600"
              : "bg-blue-600"
          }`}
        >
          {agencyCreateMutation.isPending ? "Please wait..." : "Create Agency"}
        </button>
      </form>
    </div>
  );
};

export default CreateAgency;
