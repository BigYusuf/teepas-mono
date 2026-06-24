import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";

import { useOnboardingStore } from "@/store/onboarding";
import { countries } from "@/utils/countires";

const CreateAddress = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { agencyId, setStep } = useOnboardingStore();
  const createAddressMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/create-agency-address`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // go to next step
      setStep(4);
    },
  });

  const onSubmit = async (data: any) => {
    // console.log("data", data);
    // Append agencyId to the form data before sending  the request

    const payload = { ...data, agencyId };
    createAddressMutation.mutate(payload);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Add Agency Address
        </h3>

        {/* Label */}
        <label className="block text-gray-700 mb-1">Address Label *</label>
        <select
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("label", { required: "Address label is required" })}
        >
          <option value="">Select a label</option>
          <option value="HEAD_OFFICE">Head Office</option>
          <option value="BRANCH">Branch</option>
          <option value="WAREHOUSE">Warehouse</option>
        </select>
        {errors.label && (
          <p className="text-red-500 text-sm">{String(errors.label.message)}</p>
        )}

        {/* Name */}
        <label className="block text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          placeholder="e.g., Teepas HQ"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
        )}
        <div className="flex w-full justify-between items-center flex-col md:flex-row ">
          <div className="md:w-[48%]">
            {/* Country */}
            <label className="block text-gray-700 mb-1">Country *</label>
            <select
              className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1 bg-white"
              {...register("country", { required: "Country is required" })}
            >
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-sm">
                {String(errors.country.message)}
              </p>
            )}
          </div>
          <div className="md:w-[48%]">
            {/* State */}
            <label className="block text-gray-700 mb-1">State *</label>
            <input
              type="text"
              placeholder="e.g., Lagos"
              className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
              {...register("state", { required: "State is required" })}
            />
            {errors.state && (
              <p className="text-red-500 text-sm">
                {String(errors.state.message)}
              </p>
            )}
          </div>
        </div>

        {/* Street */}
        <label className="block text-gray-700 mb-1">Street *</label>
        <input
          type="text"
          placeholder="e.g., 123 Allen Avenue"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("street", { required: "Street is required" })}
        />
        {errors.street && (
          <p className="text-red-500 text-sm">
            {String(errors.street.message)}
          </p>
        )}
        <div className="flex w-full justify-between items-center flex-col md:flex-row ">
          <div className="md:w-[48%]">
            {/* City */}
            <label className="block text-gray-700 mb-1">City *</label>
            <input
              type="text"
              placeholder="e.g., Lagos"
              className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
              {...register("city", { required: "City is required" })}
            />
            {errors.city && (
              <p className="text-red-500 text-sm">
                {String(errors.city.message)}
              </p>
            )}
          </div>
          <div className="md:w-[48%]">
            {/* ZIP Code */}
            <label className="block text-gray-700 mb-1">ZIP Code *</label>
            <input
              type="text"
              placeholder="e.g., 100001"
              className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
              {...register("zip", {
                required: "ZIP code is required",
                pattern: {
                  value: /^[0-9]{4,10}$/,
                  message: "Enter a valid ZIP code",
                },
              })}
            />
            {errors.zip && (
              <p className="text-red-500 text-sm">
                {String(errors.zip.message)}
              </p>
            )}
          </div>
        </div>
        {/* Default Address */}
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="isDefault"
            {...register("isDefault")}
            className="mr-2"
            defaultChecked
          />
          <label htmlFor="isDefault" className="text-gray-700">
            Set as default address
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full text-lg text-white py-2 rounded-lg mt-4 ${
            createAddressMutation.isPending
              ? "opacity-50 cursor-not-allowed bg-slate-600"
              : "bg-blue-600"
          }`}
          disabled={createAddressMutation.isPending}
        >
          {createAddressMutation.isPending ? "Saving..." : "Save Address"}
        </button>
      </form>
    </div>
  );
};

export default CreateAddress;
