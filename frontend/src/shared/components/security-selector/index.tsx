import { Controller } from "react-hook-form";

// const security = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
export const securityOptions = [
  { label: "CCTV", value: "CCTV" },
  { label: "Gated Community", value: "GATED_COMMUNITY" },
  { label: "Security Guard", value: "SECURITY_GUARD" },
  { label: "Alarm System", value: "ALARM_SYSTEM" },
  { label: "Intercom", value: "INTERCOM" },
  { label: "Fireplace", value: "FIREPLACE" },
  { label: "No Security", value: "NO_SECURITY" },
];

const Securityelector = ({ control, errors }: any) => {
  return (
    <div className="mt-2">
      <label className="block font-semibold text-gray-300 mb-1">Security</label>
      <Controller
        name="security"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 flex-wrap">
            {securityOptions.map((sec) => {
              const isSelected = (field.value || []).includes(sec?.value);

              return (
                <button
                  type="button"
                  key={sec?.label}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((s: string) => s !== sec.value )
                        : [...(field.value || []), sec?.value]
                    )
                  }
                  className={`px-3 py-1 rounded-lg font-Poppins transition-colors ${
                    isSelected
                      ? "bg-gray-700 text-white border border-[#ffffff6b]"
                      : "bg-gray-800 text-gray-300"
                  }`}
                >
                  {sec?.label}
                </button>
              );
            })}
          </div>
        )}
      />
      {errors.security && (
        <p className="text-red-500 text-xs mt-1">
          {errors.security.message as string}
        </p>
      )}
    </div>
  );
};

export default Securityelector;
