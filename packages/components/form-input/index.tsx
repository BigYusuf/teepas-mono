import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import Input from "../input";

interface Option {
  label: string;
  value: string;
}

interface FormFieldProps {
  name: string;
  label: string;
  type?: "text" | "number" | "password" | "email" | "textarea" | "select";
  placeholder?: string;
  options?: Option[];
  register: UseFormRegister<any>;
  errors: FieldErrors;
  required?: boolean | string;
  defaultValue?: string;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  options = [],
  register,
  errors,
  required = false,
  defaultValue,
  className,
}) => {
  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <div className="mt-2">
      {type === "select" ? (
        <>
          <label className="block font-semibold text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>

          <select
            {...register(name, {
              required:
                required &&
                (typeof required === "string"
                  ? required
                  : `${label} is required`),
            })}
            defaultValue={defaultValue || ""}
            className={`w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white ${className}`}
          >
            <option value="" disabled hidden className="bg-black">
              {placeholder || `Select ${label}`}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-black">
                {opt.label}
              </option>
            ))}
          </select>
        </>
      ) : (
        <Input
          label={`${label}${required ? " *" : ""}`}
          placeholder={placeholder}
          type={type as any}
          {...register(name, {
            required:
              required &&
              (typeof required === "string"
                ? required
                : `${label} is required`),
          })}
          className={className}
        />
      )}

      {errorMessage && (
        <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
};

export default FormField;
