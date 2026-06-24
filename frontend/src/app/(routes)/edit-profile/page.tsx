"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, FieldValues, set } from "react-hook-form";
import {
  Save,
  Trash,
  ArrowLeft,
  Loader,
  X,
  Trash2,
  MapPin,
  Pencil,
} from "lucide-react";
import Input from "packages/components/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import useAgent from "@/hooks/useAgent";
import { countries } from "@/utils/countires";

interface SocialLink {
  type: string;
  url: string;
}

interface AgentProfileForm {
  name: string;
  bio: string;
  openingHours: string;
  address: string;
  website: string;
  socialLinks: SocialLink[];
}

const socialMediaOptions = [
  { label: "Facebook", value: "facebook" },
  { label: "YouTube", value: "youtube" },
  { label: "X (Twitter)", value: "x" },
];

// API call to update profile
const updateAgentProfile = async (data: AgentProfileForm) => {
  const response = await axiosInstance.put("/agent/edit-profile", data);
  return response.data;
};

const EditProfile: React.FC = () => {
  const { agent, isLoading } = useAgent();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  // const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgentProfileForm>({
    defaultValues: {
      name: agent?.agency?.name || "",
      bio: agent?.agency?.bio || "",
      openingHours: agent?.agency?.openingHours || "Mon - Sat: 9 AM - 6 PM",

      website: agent?.agency?.website || "",
      socialLinks: agent?.agency?.socialLinks || [
        { type: "facebook", url: "" },
      ],
    },
  });
  const defaultValues: {
    label: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: string;
  } = {
    label: "HEAD_OFFICE",
    name: "",
    street: "",
    city: "",
    zip: "",
    state: "",
    country: "NG",
    isDefault: "false",
  };

  // Address form setup
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset,
    formState: { errors: addressErrors },
  } = useForm({
    defaultValues,
  });

  const socialLinks = watch("socialLinks");

  // Mutation for updating the agent profile
  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: updateAgentProfile,
    onSuccess: (data) => {
      toast.success(data.message || "Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["agent"] });
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update profile!"
      );
    },
  });

  // Form Submit Handler
  const onSubmit = (data: FieldValues) => {
    updateProfile(data as AgentProfileForm);
  };

  // Add New Social Link
  const addSocialLink = () => {
    setValue("socialLinks", [...socialLinks, { type: "facebook", url: "" }]);
  };

  // Remove Social Link
  const removeSocialLink = (index: number) => {
    const updatedLinks = socialLinks.filter((_, i) => i !== index);
    setValue("socialLinks", updatedLinks);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;

  //address modal
  const [addressError, setAddressError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const { mutate: saveAddress, isPending: isSavingAddress } = useMutation({
    mutationFn: async (payload: any) => {
      if (payload.id) {
        // Update existing address
        const res = await axiosInstance.put(
          `/agent/update-agency-address/${payload.id}`,
          payload
        );
        return res.data.address;
      } else {
        // Create new address
        const res = await axiosInstance.post(
          "/auth/create-agency-address",
          payload
        );
        return res.data.address;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["agent"] });
      reset(defaultValues);
      setSelectedAddress(null);
      setShowModal(false);
      setAddressError(""); // clear error
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Something went wrong while saving address. Please try again.";
      setAddressError(message);
    },
  });

  const handleEditAddress = (address: any) => {
    setShowModal(!showModal);
    setSelectedAddress(address);
    reset(address); // prefill form fields
  };

  const onSubmitAddress = async (data: any) => {
    saveAddress({
      ...data,
      agencyId: agent?.agency?.id,
      isDefault: data?.isDefault === "true" ? true : false,
    });
  };

  const { mutate: deleteAddress } = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/agent/delete-agency-address/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["agent"] });
      setShowDeleteModal(false);
      reset(defaultValues);
      setSelectedAddress(defaultValues);
    },
  });

  // ⏱ Auto-hide error after 4 seconds
  useEffect(() => {
    if (addressError) {
      const timer = setTimeout(() => setAddressError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [addressError]);

  const handleDeleteAddress = (address: any) => {
    setSelectedAddress(address);
    setShowDeleteModal(true);
  };

  const handleAddressModal = () => {
    reset(defaultValues);
    setSelectedAddress(null);
    setShowModal(!showModal);
  };

  return (
    <div className="w-full bg-gray-900 min-h-screen py-10 px-6">
      {/* 🔙 Back Button & Breadcrumbs */}
      <div className="absolute top-10 left-5">
        <div className="text-gray-400 text-sm mb-6 flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back to Profile</span>
          </button>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-white font-medium">Edit Profile</span>
        </div>
      </div>

      <div className="max-w-[90%] lg:max-w-[40%] mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Edit Agency Profile
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Agency Name */}
          <Input
            label="Agency Name"
            {...register("name", { required: "Agency name is required" })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}

          {/* Agency Bio (Limited to 100 Words) */}
          <div className="mt-1">
            <Input
              type="textarea"
              label="Agency Bio (Max 100 words)"
              {...register("bio", {
                validate: (value) =>
                  countWords(value) <= 100 || "Bio can't exceed 100 words",
              })}
            />
          </div>

          {/* Opening Hours */}
          <Input label="Opening Hours" {...register("openingHours")} />

          <div className="my-1 mb-2">
            {/* Address */}
            <label className="block font-semibold text-gray-300 mb-1">
              {"Agency Address"}
            </label>
            {/* Address List */}
            <div>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading Addresses...</p>
              ) : !agent?.agency?.addresses ||
                agent?.agency?.addresses?.length === 0 ? (
                <button
                  type="button"
                  onClick={handleAddressModal}
                  className="mt-3 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  + Add Address
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {agent?.agency?.addresses.map((address: any) => (
                      <div
                        key={address?.id}
                        className="border border-gray-200 rounded-md p-4 flex flex-col justify-between lg:min-h-[120px] relative"
                      >
                        {/* Default badge */}
                        {address?.isDefault && (
                          <span className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}

                        {/* Address info */}
                        <div className="flex items-start gap-2 text-sm text-gray-300">
                          <MapPin className="w-5 h-5 mt-0.5 text-gray-300" />
                          <div>
                            <p className="font-medium text-white">
                              {address?.label} - {address?.name}
                            </p>
                            <p className="text-gray-400">
                              {address?.street}, {address?.city},{" "}
                              {address?.state}, {address?.country}
                            </p>
                          </div>
                        </div>

                        {/* Actions (always at bottom) */}
                        <div className="flex justify-between items-center gap-3 mt-auto pt-4">
                          <button
                            type="button"
                            className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                            onClick={() => handleEditAddress(address)}
                          >
                            <Pencil className="w-4 h-4" /> Edit
                          </button>

                          <button
                            type="button"
                            className="flex items-center gap-1 text-xs text-red-500 hover:underline"
                            onClick={() => handleDeleteAddress(address)}
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddressModal}
                      className="mt-3 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      + Add Address
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* <Input label="Agency Address" {...register("address")} /> */}
          </div>

          {/* Website */}
          <Input
            label="Website"
            {...register("website", {
              pattern: {
                value:
                  /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]{2,256}\.[a-z]{2,6}\b)(\/[^\s]*)?$/,
                message: "Enter a valid URL",
              },
            })}
          />
          {errors.website && (
            <p className="text-red-500 text-xs mt-1">
              {errors.website.message}
            </p>
          )}

          {/* Social Links */}
          <div className="mt-4">
            <label className="block font-semibold text-gray-300">
              Social Links
            </label>
            {socialLinks.map((link, index) => (
              <div key={index} className="flex gap-2 mt-1 items-center">
                {/* Social Media Type Selection */}
                <Controller
                  control={control}
                  name={`socialLinks.${index}.type`}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-32 p-2 rounded-md bg-gray-700 text-white outline-none border border-gray-600"
                    >
                      {socialMediaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                />

                {/* Social Media URL Input */}
                <Controller
                  control={control}
                  name={`socialLinks.${index}.url`}
                  rules={{
                    pattern: {
                      value:
                        /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]{1,256}\.[a-z]{1,6}\b)(\/[^\s]*)?$/,
                      message: `Enter a valid ${socialLinks[index]?.type} URL`,
                    },
                  }}
                  render={({ field }) => (
                    <div className="flex flex-col w-full">
                      {/* ✅ Ensure full width */}
                      <Input
                        {...field}
                        className="w-full"
                        placeholder={`Enter ${socialLinks[index]?.type} URL`}
                      />
                      {/* ✅ Show Validation Error */}
                      {errors.socialLinks?.[index]?.url && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.socialLinks[index]?.url?.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="bg-red-600 p-2 rounded-md text-white hover:bg-red-700 transition"
                >
                  <Trash size={18} />
                </button>
              </div>
            ))}

            {/* Add Social Link Button */}
            <button
              type="button"
              onClick={addSocialLink}
              className="mt-3 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              + Add Social Link
            </button>
          </div>

          {/* Save Button with Loader */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 mt-6 rounded-md font-semibold flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isPending ? "Saving..." : "Save Changes"}
          </button>
          {addressError && (
            <p className="text-red-500 text-xs mt-2 text-center">
              {addressError}
            </p>
          )}
        </form>
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-gray-800 w-full max-w-md p-6 rounded-md shadow-md relative">
              <button
                className="absolute top-3 right-3 text-gray-300 hover:text-gray-200"
                onClick={handleAddressModal}
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold mb-4 text-white">
                {selectedAddress
                  ? `Update Address ${selectedAddress?.name}`
                  : "Add New Address"}
              </h3>
              <form
                onSubmit={handleAddressSubmit(onSubmitAddress)}
                className="space-y-3 text-gray-200"
              >
                {/* Label */}

                <div className="grid grid-cols-3 gap-3">
                  <select
                    {...registerAddress("label")}
                    defaultValue={"HEAD_OFFICE"}
                    className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="HEAD_OFFICE">Head Office</option>
                    <option value="BRANCH">Branch</option>
                    <option value="WAREHOUSE">Warehouse</option>
                  </select>

                  {/* Name */}
                  <div className="col-span-2">
                    <input
                      placeholder="Name"
                      {...registerAddress("name", {
                        required: "Name is required",
                      })}
                      className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder-gray-400"
                    />
                    {addressErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {addressErrors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    placeholder="Street"
                    {...registerAddress("street", {
                      required: "Street is required",
                    })}
                    className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder-gray-400"
                  />
                  {addressErrors.street && (
                    <p className="text-red-500 text-xs mt-1">
                      {addressErrors.street.message}
                    </p>
                  )}
                </div>
                {/* City & State — side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      placeholder="City"
                      {...registerAddress("city", {
                        required: "City is required",
                      })}
                      className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder-gray-400"
                    />
                    {addressErrors.city && (
                      <p className="text-red-500 text-xs mt-1">
                        {addressErrors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      placeholder="State"
                      {...registerAddress("state", {
                        required: "State is required",
                      })}
                      className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder-gray-400"
                    />
                    {addressErrors.state && (
                      <p className="text-red-500 text-xs mt-1">
                        {addressErrors.state.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* ZIP & Country — side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="ZIP Code"
                    {...registerAddress("zip", {
                      required: "ZIP code is required",
                    })}
                    className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none placeholder-gray-400"
                  />

                  <select
                    {...registerAddress("country")}
                    className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {countries.map((country, index) => (
                      <option key={index} value={country?.code}>
                        {country?.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Default Address
                  </label>
                  <select
                    {...registerAddress("isDefault")}
                    className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="true">Set as Default</option>
                    <option value="false">Not Default</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="w-full py-2 rounded-md font-semibold text-sm bg-blue-600 hover:bg-blue-700 transition text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                >
                  {isSavingAddress ? "Saving..." : "Save Address"}
                </button>

                {/* Show server/API error under the button */}
                {addressError && (
                  <p className="text-red-500 text-xs mt-2 text-center">
                    {addressError}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
        {showDeleteModal && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
              {/* Header */}
              <h3 className="text-xl text-white mb-4 flex items-center gap-2">
                <Trash2 size={22} className="text-red-500" />{" "}
                {`Delete ${selectedAddress?.name} Address`}
              </h3>

              {/* Warning Message */}
              <p className="text-gray-300">
                Deleting this agency address is a **permanent action**. Which
                can not be restored.
              </p>

              {/* Recovery Period Warning */}
              <div className="bg-gray-900 text-yellow-400 p-3 mt-4 rounded-md border border-yellow-500">
                <p className="text-sm">
                  You can not **restore** this agency address once deleted, it
                  will be **permanently removed**. But can create new address
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition"
                >
                  Cancel
                </button>
                <button
                  className={`${
                    !agent?.isDeleted
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  } px-4 py-2 rounded-md text-white font-semibold transition`}
                  onClick={() => deleteAddress(selectedAddress?.id!)}
                >
                  {!agent?.isDeleted ? "Confirm Delete" : "Restore"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
