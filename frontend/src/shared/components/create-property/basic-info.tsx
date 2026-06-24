import React from "react";
import { Controller } from "react-hook-form";
import Input from "packages/components/input";
import RichTextEditor from "packages/components/rich-text-editor";
import {
  amenitiesOptions,
  availabilityOptions,
  conditionOptions,
  constructionStatusOptions,
  designTypeOptions,
  furnishingStatusOptions,
  propertyCategoryOptions,
  propertyPurposeOptions,
  propertyTypeOptions,
} from "@/data/property";
import SelectorToggle from "packages/components/selector";
import DatePickerField from "../date-picker";

interface BasicInfoStepProps {
  handleChange?: (field: string) => void;
  setValue?: (name: string, value: any) => void;
  getValues?: (name?: string) => any;
  watch?: (name: string) => any;
  register?: any;
  control?: any;
  errors?: any;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  handleChange,
  setValue,
  getValues,
  watch,
  control,
  register,
  errors,
}) => {
  const watchAvailability = watch("availability") || "";
  return (
    <div className="md:w-3/4 sm:w-full mx-auto grid grid-cols-2 gap-6 pb-[100px]">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-4">
        {/* Property Title */}
        <Input
          label="Property Title *"
          placeholder="Enter property title"
          {...register("title", { required: "Title is required" })}
          onChange={() => handleChange?.("title")}
          error={errors.title?.message as string | undefined}
        />

        {/* Description */}
        <div>
          <label className="block font-semibold text-gray-300 mb-1">
            Description *
          </label>
          <Controller
            name="description"
            control={control}
            rules={{
              required: "Description is required",
              minLength: {
                value: 20,
                message: "Minimum 20 characters required",
              },
            }}
            render={({ field }) => (
              <RichTextEditor value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message as string}
            </p>
          )}
        </div>

        {/* Tags */}
        <Input
          label="Tags *"
          placeholder="e.g. sea-view,gated-community,fenced"
          {...register("tags", {
            required: "Please add property tags (comma separated)",
          })}
          onChange={() => handleChange?.("tags")}
          error={errors.tags?.message as string | undefined}
        />
        {/* Property Availability */}
        <Input
          label="Property Availability *"
          type="select"
          placeholder="Select property availability"
          options={availabilityOptions}
          {...register("availability", {
            required: "Property purpose is required",
          })}
          onChange={() => handleChange?.("availability")}
          error={errors.availability?.message as string | undefined}
        />
        {watchAvailability === "AVAILABLE_FROM_DATE" && (
          <DatePickerField
            name="availableFrom"
            label="Available From"
            control={control}
            errors={errors}
            required
          />
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-4">
        {/* Property Use / Purpose */}
        <Input
          label="Property use/ purpose *"
          placeholder="Type of Property Use"
          type="select"
          options={propertyPurposeOptions}
          {...register("purpose", {
            required: "Property use is required!",
          })}
          onChange={() => handleChange("purpose")}
          error={errors.purpose?.message as string | undefined}
        />

        <Input
          label="Property Action *"
          placeholder="Type of Property Action"
          type="select"
          options={propertyCategoryOptions}
          {...register("category", {
            required: "Property Action is required!",
          })}
          onChange={() => handleChange("category")}
          error={errors.type?.message as string | undefined}
        />

        {/* Property Type */}
        <Input
          label="Property Type *"
          placeholder="Type of Property"
          type="select"
          options={propertyTypeOptions}
          {...register("type", {
            required: "Type is required!",
          })}
          onChange={() => handleChange("type")}
          error={errors.type?.message as string | undefined}
        />
        {/* Design Type */}
        <Input
          label="Design Type *"
          placeholder="Type of Property Design"
          type="select"
          options={designTypeOptions}
          {...register("designType", {
            required: "Design Type is required!",
          })}
          onChange={() => handleChange?.("designType")}
          error={errors.designType?.message as string | undefined}
        />
        <Input
          label="Furniture Present"
          placeholder="Are furniture available"
          type="select"
          options={furnishingStatusOptions}
          {...register("furnishing")}
          onChange={() => handleChange("furnishing")}
          error={errors.furnishing?.message as string | undefined}
        />
        <Input
          label="Property Condition"
          placeholder="What is the condition of property"
          type="select"
          options={conditionOptions}
          {...register("condition", {
            required: "Condition Status is required!",
          })}
          onchange={() => handleChange("condition")}
          error={errors.condition?.message as string | undefined}
        />
        <Input
          label="Construction *"
          placeholder="Construction Status"
          type="select"
          options={constructionStatusOptions}
          {...register("construction", {
            required: "Construction Status is required!",
          })}
          onchange={() => handleChange("construction")}
          error={errors.construction?.message as string | undefined}
        />
        <SelectorToggle
          name="amenities"
          label="Amenities"
          control={control}
          errors={errors}
          options={amenitiesOptions}
        />
      </div>
    </div>
  );
};

export default BasicInfoStep;
