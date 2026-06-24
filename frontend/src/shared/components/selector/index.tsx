import React, { useState } from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Plus } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface SelectorToggleProps {
  name: string;
  label?: string;
  control: Control<any>;
  errors?: FieldErrors;
  options: Option[];
  allowCustom?: boolean; // allow user to add new options
  className?: string;
}

const SelectorToggle = ({
  name,
  label,
  control,
  errors,
  options,
  allowCustom = false,
  className = "",
}: SelectorToggleProps) => {
  const [customOptions, setCustomOptions] = useState<Option[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [newOption, setNewOption] = useState({ label: "", value: "" });

  const allOptions = [...options, ...customOptions];

  return (
    <div className={`mt-2 ${className}`}>
      {label && (
        <label htmlFor={name} className="block font-semibold text-gray-300 mb-1">
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 flex-wrap items-center">
            {allOptions.map((opt) => {
              const isSelected = Array.isArray(field.value)
                ? field.value.includes(opt.value)
                : false;

              const handleToggle = () => {
                if (!Array.isArray(field.value)) {
                  field.onChange([opt.value]);
                  return;
                }

                field.onChange(
                  isSelected
                    ? field.value.filter((v: string) => v !== opt.value)
                    : [...field.value, opt.value]
                );
              };

              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={handleToggle}
                  className={`px-3 py-1 rounded-lg font-Poppins transition-colors border ${
                    isSelected
                      ? "bg-gray-700 text-white border-gray-500"
                      : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700/60"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}

            {allowCustom && (
              <>
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg font-Poppins border border-gray-500 bg-gray-800 hover:bg-gray-700 flex items-center gap-1"
                  onClick={() => setShowInput(!showInput)}
                >
                  <Plus size={16} color="white" /> Add
                </button>

                {showInput && (
                  <div className="flex gap-2 items-center mt-2">
                    <input
                      type="text"
                      placeholder="Label"
                      value={newOption.label}
                      onChange={(e) =>
                        setNewOption({ ...newOption, label: e.target.value })
                      }
                      className="px-2 py-1 rounded-md bg-gray-800 border border-gray-700 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={newOption.value}
                      onChange={(e) =>
                        setNewOption({ ...newOption, value: e.target.value })
                      }
                      className="px-2 py-1 rounded-md bg-gray-800 border border-gray-700 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newOption.label || !newOption.value) return;
                        setCustomOptions([...customOptions, newOption]);
                        setShowInput(false);
                        setNewOption({ label: "", value: "" });
                      }}
                      className="px-3 py-1 bg-gray-700 text-white rounded-md"
                    >
                      Add
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
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

export default SelectorToggle;
