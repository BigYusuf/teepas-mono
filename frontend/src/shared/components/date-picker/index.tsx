import React from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  errors?: FieldErrors;
  required?: boolean;
  placeholder?: string;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  name,
  label,
  control,
  errors,
  required,
  placeholder = "Select date",
}) => {
  return (
    <div className="flex flex-col gap-1 mt-2">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `${label || name} is required` : false,
        }}
        render={({ field }) => (
          <DatePicker
            selected={field.value ? new Date(field.value) : null}
            onChange={(date: Date | null) => field.onChange(date)}
            // dateFormat="yyyy-MM-dd"
            placeholderText={placeholder}
            className="w-full p-2 rounded-md bg-gray-800 border border-gray-700 text-sm text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        )}
      />

      {errors?.[name] && (
        <p className="text-red-500 text-xs mt-1">
          {String(errors[name]?.message)}
        </p>
      )}
    </div>
  );
};

export default DatePickerField;
