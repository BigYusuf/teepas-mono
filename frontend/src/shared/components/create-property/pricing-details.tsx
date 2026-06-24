import React, { useEffect, useState } from "react";
import Input from "packages/components/input";
import {
  currencyOptions,
  leaseTermOptions,
  paymentFrequencyOptions,
  propertyCategoryOptions,
} from "@/data/property";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

interface PricingProps {
  handleChange?: (field: string) => void;
  setValue?: (name: string, value: any) => void;
  getValues?: (name?: string) => any;
  watch?: (name: string) => any;
  register?: any;
  control?: any;
  errors?: any;
}

const Pricing: React.FC<PricingProps> = ({
  handleChange,
  register,
  setValue,
  getValues,
  watch,
  control,
  errors,
}) => {
  const currency = watch("currency");
  const [sign, setSign] = useState("₦");

  useEffect(() => {
    const matched = currencyOptions.find((x) => x.value === currency);
    setSign(matched?.sign || "₦");
  }, [currency]);

  const { data: promotions = [], isLoading: promoLoading } = useQuery({
    queryKey: ["agency-promotions"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/property/get-promotions",
        isProtected
      );
      return res?.data?.promotions || [];
    },
  });
  return (
    <div className="md:w-3/4 sm:w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-[100px]">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-4">
        <Input
          label={`Currency (${sign || "₦"})`}
          type="select"
          options={currencyOptions}
          placeholder="Select currency"
          {...register("currency", { required: "Currency is required" })}
          error={errors.currency?.message}
        />
        <Input
          label={`Base Price (${sign || "₦"})`}
          type="number"
          placeholder="Enter base price"
          {...register("basePrice", { required: "Base price is required" })}
          onChange={() => handleChange?.("basePrice")}
          error={errors.basePrice?.message}
        />

        <Input
          label={`Caution Fee (${sign || "₦"})`}
          type="number"
          placeholder="Optional"
          {...register("cautionFee")}
          onChange={() => handleChange?.("cautionFee")}
        />

        <Input
          label={`Agent Fee (${sign || "₦"})`}
          type="number"
          placeholder="Optional"
          {...register("agentFee")}
          onChange={() => handleChange?.("agentFee")}
        />

        <Input
          label={`Legal Fee (${sign || "₦"})`}
          type="number"
          placeholder="Optional"
          {...register("legalFee")}
          onChange={() => handleChange?.("legalFee")}
        />
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="negotiable"
            {...register("negotiable")}
            className="w-5 h-5 accent-blue-600 cursor-pointer"
          />
          <label htmlFor="negotiable" className="text-gray-300">
            Price Negotiable
          </label>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-4">
        <Input
          label={`Service Charge (${sign || "₦"})`}
          type="number"
          placeholder="Optional"
          {...register("serviceCharge")}
          onChange={() => handleChange?.("serviceCharge")}
        />

        <Input
          label="Payment Type"
          type="select"
          placeholder="Select payment type"
          options={propertyCategoryOptions}
          {...register("paymentType", { required: "Payment type is required" })}
          onChange={() => handleChange?.("paymentType")}
          error={errors.paymentType?.message}
        />

        <Input
          label="Payment Frequency"
          type="select"
          placeholder="Select frequency"
          options={paymentFrequencyOptions}
          {...register("paymentFrequency")}
          onChange={() => handleChange?.("paymentFrequency")}
        />

        <Input
          label="Lease Term"
          type="select"
          placeholder="Select lease term"
          options={leaseTermOptions}
          {...register("leaseTerm")}
          onChange={() => handleChange?.("leaseTerm")}
        />
        <div className="mt-3">
          <label className="block font-semibold text-gray-300 mb-1">
            Select Promotions (optional)
          </label>

          {promoLoading ? (
            <p className="text-gray-400">Loading promotions...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {promotions?.map((code: any) => (
                <button
                  type="button"
                  key={code.id}
                  className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                    watch("promotions")?.includes(code.id)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    const currentSelection = watch("promotions") || [];
                    const updatedSelection = currentSelection?.includes(code.id)
                      ? currentSelection.filter((id: string) => id !== code.id)
                      : [...currentSelection, code.id];
                    setValue("promotions", updatedSelection);
                  }}
                >
                  {code?.public_name} ({code.discountValue}
                  {code.discountType === "percentage" ? "%" : "$"})
                </button>
              ))}
            </div>
          )}
          {promotions?.length === 0 && !promoLoading && (
            <p className="text-gray-400">No Promotions available to add!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
