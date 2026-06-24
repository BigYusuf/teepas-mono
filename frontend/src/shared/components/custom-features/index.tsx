import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import Input from "../input";
import { PlusCircle, Trash2 } from "lucide-react";

const CustomFeatures = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customFeatures",
  });

  return (
    <div>
      <label className="block font-semibold text-gray-300 mb-1">
        Custom Features
      </label>
      <div className="flex flex-col gap-3">
        {fields?.map((item, index) => (
          <div key={item.id} className="flex gap-2 items-center">
            <Controller
              name={`customFeatures.${index}.name`}
              control={control}
              rules={{ required: "Feature name is required" }}
              render={({ field }) => (
                <Input
                  label="Feature Name"
                  placeholder="e.g., Color, Size, Brand"
                  {...field}
                />
              )}
            />
            <Controller
              name={`customFeatures.${index}.value`}
              control={control}
              rules={{ required: "Value is required" }}
              render={({ field }) => (
                <Input
                  label="Value"
                  placeholder="e.g., Red, Large, Apple"
                  {...field}
                />
              )}
            />
            <button
              type="button"
              className="text-red-500 hover:text-red-700"
              onClick={() => remove(index)}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        <button
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
          onClick={() => append({ name: "", value: "" })}
        >
          <PlusCircle size={20} /> Add Feature
        </button>
      </div>
      {errors?.customFeatures && (
        <p className="text-red-500 text-xs mt-1">
          {errors.customFeatures.message as string}
        </p>
      )}
    </div>
  );
};

export default CustomFeatures;