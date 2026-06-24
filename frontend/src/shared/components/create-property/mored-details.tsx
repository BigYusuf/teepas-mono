import React from "react";
import { Controller } from "react-hook-form";
import Input from "packages/components/input";
import SelectorToggle from "packages/components/selector";
import CustomFeatures from "packages/components/custom-features";
import CustomSpecifications from "packages/components/custom-specifications";
import {
  buildingMaterialOptions,
  ceilingTypeOptions,
  coolingTypeOptions,
  electricityOptions,
  heatingTypeOptions,
  meterOptions,
  roofTypeOptions,
  wallFinishOptions,
  waterSupplyOptions,
  yearOptions,
} from "@/data/property";

interface DetailsStepProps {
  handleChange?: (field: string) => void;
  setValue?: (name: string, value: any) => void;
  getValues?: (name?: string) => any;
  watch?: (name: string) => any;
  register?: any;
  control?: any;
  errors?: any;
}

const DetailsStep: React.FC<DetailsStepProps> = ({
  handleChange,
  register,
  setValue,
  getValues,
  watch,
  control,
  errors,
}) => {
  return (
    <div className="md:w-3/4 sm:w-full mx-auto grid grid-cols-2 gap-6 pb-[100px]">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Size (sqm)"
            type="number"
            placeholder="Enter property size"
            {...register("sizeSqm")}
            onChange={() => handleChange?.("sizeSqm")}
            error={errors.sizeSqm?.message}
          />

          <Input
            label="Land Size (sqm)"
            type="number"
            placeholder="Enter land size"
            {...register("landSizeSqm")}
            error={errors.landSizeSqm?.message}
          />
        </div>

        <Input
          label="Year Built"
          type="select"
          placeholder="e.g. 2020"
          options={yearOptions}
          {...register("yearBuilt")}
          onChange={() => handleChange?.("yearBuilt")}
          error={errors.yearBuilt?.message}
        />

        {/* Electricity and Utilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Electricity Type"
            type="select"
            placeholder="Select electricity type"
            options={electricityOptions}
            {...register("electricity")}
            onChange={() => handleChange?.("electricity")}
            error={errors.electricity?.message}
          />

          <Input
            label="Electric Billing"
            type="select"
            placeholder="Select meter type"
            options={meterOptions}
            {...register("electricBilling")}
            onChange={() => handleChange?.("electricBilling")}
            error={errors.electricBilling?.message}
          />
        </div>

        <Input
          label="Water Supply"
          type="select"
          placeholder="Select water supply type"
          options={waterSupplyOptions}
          {...register("waterSupply")}
          onChange={() => handleChange?.("waterSupply")}
          error={errors.waterSupply?.message}
        />

        <CustomSpecifications control={control} errors={errors} />
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-4">
        {/* Cooling / Heating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Cooling Type"
            type="select"
            placeholder="Select cooling type"
            options={coolingTypeOptions}
            {...register("cooling")}
            onChange={() => handleChange?.("cooling")}
            error={errors.cooling?.message}
          />

          <Input
            label="Heating Type"
            type="select"
            placeholder="Select heating type"
            options={heatingTypeOptions}
            {...register("heating")}
            onChange={() => handleChange?.("heating")}
            error={errors.heating?.message}
          />
        </div>

        {/* Building Materials" Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Building Materials"
            type="select"
            options={buildingMaterialOptions}
            {...register("buildingMaterial")}
            onChange={() => handleChange?.("buildingMaterial")}
            error={errors.buildingMaterial?.message}
          />

          <Input
            label="Wall Finish"
            type="select"
            options={wallFinishOptions}
            {...register("wallFinish")}
            onChange={() => handleChange?.("wallFinish")}
            error={errors.wallFinish?.message}
          />
        </div>

        {/* Building Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Floor Type"
            type="select"
            options={[
              { label: "Tiles", value: "TILES" },
              { label: "Marble", value: "MARBLE" },
              { label: "Cement", value: "CEMENT" },
              { label: "Vinyl", value: "VINYL" },
            ]}
            {...register("floorType")}
            onChange={() => handleChange?.("floorType")}
            error={errors.floorType?.message}
          />

          <Input
            label="Roof Type"
            type="select"
            options={roofTypeOptions}
            {...register("roofType")}
            onChange={() => handleChange?.("roofType")}
            error={errors.roofType?.message}
          />
        </div>

        <Input
          label="Ceiling Type"
          type="select"
          options={ceilingTypeOptions}
          {...register("ceilingType")}
          onChange={() => handleChange?.("ceilingType")}
          error={errors.ceilingType?.message}
        />
        <CustomFeatures control={control} errors={errors} />
      </div>

      {/* CUSTOM FIELDS */}
      {/* <div className="col-span-2 flex flex-col gap-4 mt-6">
        <CustomFeatures control={control} errors={errors} />

        <CustomSpecifications control={control} errors={errors} />
      </div> */}
    </div>
  );
};

export default DetailsStep;
