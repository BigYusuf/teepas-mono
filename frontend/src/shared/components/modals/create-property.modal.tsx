import React from "react";
import { Controller, FieldValues, Control, FieldErrors } from "react-hook-form";
import { X } from "lucide-react";
import Input from "packages/components/input";

interface FieldOption {
  label: string;
  value: string;
}

interface FieldConfig {
  name: string;
  label?: string;
  placeholder?: string;
  type: "text" | "select";
  options?: FieldOption[];
  required?: boolean;
  showLabel?: boolean;
}

interface CustomPropertiesModalProps<T extends FieldValues> {
  showModal: boolean;
  setShowModal: (state: boolean) => void;
  title?: string;
  isSaving?: boolean;
  control: Control<T>;
  errors: FieldErrors<T>;
  fields: FieldConfig[];
  onSubmit?: () => void;
}

const CustomPropertiesModal = <T extends FieldValues>({
  showModal,
  setShowModal,
  title = "Add Data",
  isSaving = false,
  control,
  errors,
  fields,
  onSubmit,
}: CustomPropertiesModalProps<T>) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-gray-800 w-full max-w-md p-6 rounded-md shadow-md relative">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-gray-300 hover:text-gray-200"
          onClick={() => setShowModal(false)}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>

        {/* Dynamic Fields */}
        <div className="grid grid-cols-2 gap-3">
          {fields.map((field) => (
            <div key={field.name} className="col-span-1">
              {/* Conditionally render label */}
              {field.showLabel !== false && field.label && (
                <label
                  htmlFor={field.name}
                  className="block text-gray-300 font-medium mb-1"
                >
                  {field.label}
                </label>
              )}

              {field.type === "text" ? (
                <Controller
                  name={field.name as any}
                  control={control}
                  rules={{
                    required: field.required
                      ? `${field.label || "Field"} is required`
                      : false,
                  }}
                  render={({ field: rhfField }) => (
                    <Input
                      {...rhfField}
                      id={field.name}
                      placeholder={field.placeholder || field.label}
                    />
                  )}
                />
              ) : field.type === "select" ? (
                <Controller
                  name={field.name as any}
                  control={control}
                  rules={{
                    required: field.required
                      ? `${field.label || "Field"} is required`
                      : false,
                  }}
                  render={({ field: rhfField }) => (
                    <select
                      {...rhfField}
                      id={field.name}
                      className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              ) : null}

              {/* Validation error */}
              {errors?.[field.name] && (
                <p className="text-red-500 text-xs mt-1">
                  {String(errors[field.name]?.message)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={() => {
            onSubmit && onSubmit();
            setShowModal(false);
          }}
          disabled={isSaving}
          className="w-full mt-4 py-2 rounded-md font-semibold text-sm bg-blue-600 hover:bg-blue-700 transition text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default CustomPropertiesModal;
