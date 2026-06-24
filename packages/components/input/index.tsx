import React, { forwardRef, useEffect, useState } from "react";

interface Option {
  label: string;
  value: string;
  sign?: string;
}

interface BaseProps {
  label?: string;
  type?:
    | "text"
    | "number"
    | "date"
    | "password"
    | "email"
    | "textarea"
    | "select";
  className?: string;
  options?: Option[];
  error?: string;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<any>) => void;
}

type Props = BaseProps &
  Omit<
    React.InputHTMLAttributes<HTMLInputElement> &
      React.TextareaHTMLAttributes<HTMLTextAreaElement> &
      React.SelectHTMLAttributes<HTMLSelectElement>,
    "type"
  >;

const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  Props
>(
  (
    {
      label,
      type = "text",
      className = "",
      options = [],
      error,
      onChange,
      placeholder,
      ...rest
    },
    ref
  ) => {
    const [refreshedLabel, setRefreshedLabel] = useState(label);
    const baseStyle =
      "w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white";

    const handleChange = (e: React.ChangeEvent<any>) => {
      (rest as any).onChange?.(e); // React Hook Form's onChange
      onChange?.(e); // custom onChange
    };
    useEffect(() => {
      if (label) {
        setRefreshedLabel(label);
      }
    }, [label]);

    return (
      <div className="w-full mt-2">
        {refreshedLabel && (
          <label className="block font-semibold text-gray-300 mb-1">
            {refreshedLabel}
          </label>
        )}

        {type === "select" ? (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            className={`${baseStyle} ${className}`}
            onChange={handleChange}
            {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
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
        ) : type === "textarea" ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`${baseStyle} ${className}`}
            placeholder={placeholder}
            onChange={handleChange}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            type={type}
            ref={ref as React.Ref<HTMLInputElement>}
            className={`${baseStyle} ${className}`}
            placeholder={placeholder}
            onChange={handleChange}
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
