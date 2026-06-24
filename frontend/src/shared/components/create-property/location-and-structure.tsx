import React from "react";
import { Controller } from "react-hook-form";
import { Trash } from "lucide-react";
import Input from "packages/components/input";
import SelectorToggle from "packages/components/selector";
import { nearbyLocationOptions } from "@/data/property";

interface LocationStructureProps {
  handleChange?: (field: string) => void;
  setValue?: (name: string, value: any) => void;
  getValues?: (name?: string) => any;
  watch?: (name: string) => any;
  register?: any;
  control?: any;
  errors?: any;
}

const LocationStructure: React.FC<LocationStructureProps> = ({
  handleChange,
  setValue,
  getValues,
  watch,
  control,
  register,
  errors,
}) => {
  const petDetails = watch("petDetails") || [];
  const petPolicy = watch("petPolicy") || [];
  const propertyType = watch("type");

  // Add new pet
  const addPet = () => {
    setValue("petDetails", [
      ...petDetails,
      { type: "dog", allowed: false, fee: 0 },
    ]);
  };

  // Remove a pet
  const removePet = (index: number) => {
    const updated = petDetails.filter((_: any, i: number) => i !== index);
    setValue("petDetails", updated);
  };

  const petTypeOptions = [
    { label: "Dog", value: "dog" },
    { label: "Cat", value: "cat" },
    { label: "Bird", value: "bird" },
    { label: "Other", value: "other" },
  ];

  return (
    <div className="md:w-3/4 sm:w-full mx-auto grid grid-cols-2 gap-6 pb-[100px]">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-4">
        <Input
          label="Property Country *"
          type="select"
          options={[{ label: "Nigeria", value: "NG" }]}
          placeholder="Select property country"
          {...register("country", {
            required: "Property country is required",
          })}
          onChange={() => handleChange?.("country")}
          error={errors.country?.message as string | undefined}
        />

        <Input
          label="Property State *"
          placeholder="Which state is property located"
          {...register("state", { required: "State is required" })}
          onChange={() => handleChange?.("state")}
          error={errors.state?.message as string | undefined}
        />

        <Input
          label="Property City *"
          placeholder="Which city is property located"
          {...register("city", { required: "City is required" })}
          onChange={() => handleChange?.("city")}
          error={errors.city?.message as string | undefined}
        />

        <Input
          label="Street *"
          placeholder="Street address"
          {...register("address", {
            required: "Enter valid street address",
          })}
          onChange={() => handleChange?.("address")}
          error={errors.address?.message as string | undefined}
        />
        <Input
          label="Show Address/Street to *"
          placeholder="Allow address to visible"
          type="select"
          options={[
            { label: "All Users", value: "ALL" },
            { label: "Approved Users Only", value: "APPROVED_ONLY" },
          ]}
          {...register("showTo", {
            required: "Enter valid street address",
          })}
          onChange={() => handleChange?.("showTo")}
          error={errors.showTo?.message as string | undefined}
        />

        <SelectorToggle
          name="nearByLocation"
          label="Nearby Locations"
          control={control}
          errors={errors}
          options={nearbyLocationOptions}
          // allowCustom
        />
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-4">
        {/* Numeric fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {propertyType !== "SELF_CONTAIN" && (
            <Input
              label="Bedrooms"
              type="number"
              placeholder="Enter number of bedrooms"
              {...register("bedrooms")}
              onChange={() => handleChange("bedrooms")}
              error={errors.bedrooms?.message as string | undefined}
            />
          )}
          <Input
            label="Bathrooms"
            type="number"
            placeholder="Enter number of bathrooms"
            {...register("bathrooms")}
            onChange={() => handleChange("bathrooms")}
            error={errors.bathrooms?.message as string | undefined}
          />
          <Input
            label="Toilets"
            type="number"
            placeholder="Enter number of toilets"
            {...register("toilets")}
            onChange={() => handleChange("toilets")}
            error={errors.toilets?.message as string | undefined}
          />
          {propertyType !== "SELF_CONTAIN" && (
            <Input
              label="Living Rooms"
              type="number"
              placeholder="Enter number of living rooms"
              {...register("livingRooms")}
              onChange={() => handleChange("livingRooms")}
              error={errors.livingRooms?.message as string | undefined}
            />
          )}
          <Input
            label="Kitchens"
            type="number"
            placeholder="Enter number of kitchens"
            {...register("kitchens")}
            onChange={() => handleChange("kitchens")}
            error={errors.kitchens?.message as string | undefined}
          />
          <Input
            label="Floor Level"
            type="number"
            placeholder="e.g. 1 for ground floor, 2 for first floor"
            {...register("floorLevel")}
            onChange={() => handleChange("floorLevel")}
            error={errors.floorLevel?.message as string | undefined}
          />
        </div>

        {/* Enums & Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Kitchen Type"
            type="select"
            placeholder="Select kitchen type"
            options={[
              { label: "Private", value: "PRIVATE" },
              { label: "Shared", value: "SHARED" },
              { label: "Outdoor", value: "OUTDOOR" },
            ]}
            {...register("kitchenType")}
            onChange={() => handleChange("kitchenType")}
            error={errors.kitchenType?.message as string | undefined}
          />

          <Input
            label="Toilet Location"
            type="select"
            placeholder="Select toilet location"
            options={[
              { label: "Indoor", value: "INDOOR" },
              { label: "Outdoor", value: "OUTDOOR" },
              { label: "Shared", value: "SHARED" },
            ]}
            {...register("toiletLocation")}
            onChange={() => handleChange("toiletLocation")}
            error={errors.toiletLocation?.message as string | undefined}
          />

          <Input
            label="Pet Policy"
            type="select"
            placeholder="Select pet policy"
            options={[
              { label: "Allowed", value: "ALLOWED" },
              { label: "Not Allowed", value: "NOT_ALLOWED" },
              { label: "Negotiable", value: "NEGOTIABLE" },
              { label: "Requires Approval", value: "REQUIRES_APPROVAL" },
            ]}
            {...register("petPolicy")}
            // onChange={() => handleChange("petPolicy")}
            error={errors.petPolicy?.message as string | undefined}
          />
        </div>

        {/* Dynamic Pet Details */}
        {petPolicy === "NOT_ALLOWED" ? null : (
          <div className="mt-4">
            <label className="block font-semibold text-gray-300">
              Pet Details
            </label>
            {petDetails.map((pet: any, index: number) => (
              <div key={index} className="flex gap-2 mt-2 items-center">
                {/* Pet Type */}
                <Controller
                  control={control}
                  name={`petDetails.${index}.type`}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-32 p-2 rounded-md bg-gray-700 text-white outline-none border border-gray-600"
                    >
                      {petTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                />

                {/* Allowed Toggle */}
                <Controller
                  control={control}
                  name={`petDetails.${index}.allowed`}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-28 p-2 rounded-md bg-gray-700 text-white outline-none border border-gray-600"
                    >
                      <option value={"true"}>Allowed</option>
                      <option value={"false"}>Not Allowed</option>
                    </select>
                  )}
                />

                {/* Fee Input */}
                <Controller
                  control={control}
                  name={`petDetails.${index}.fee`}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      placeholder="Fee (₦)"
                      className="w-full"
                    />
                  )}
                />

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removePet(index)}
                  className="bg-red-600 p-2 rounded-md text-white hover:bg-red-700 transition"
                >
                  <Trash size={18} />
                </button>
              </div>
            ))}

            {/* Add Pet Button */}
            <button
              type="button"
              onClick={addPet}
              className="mt-3 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              + Add Pet
            </button>
          </div>
        )}
        {/* Additional Property Toggles */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <Controller
            control={control}
            name="isWholeBuilding"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                Is Whole Building
              </label>
            )}
          />
          <Controller
            control={control}
            name="isServiced"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                Is Serviced
              </label>
            )}
          />
          <Controller
            control={control}
            name="hasBalcony"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  {...field}
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                Has Balcony
              </label>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationStructure;
