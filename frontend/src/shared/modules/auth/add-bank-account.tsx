import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useOnboardingStore } from "@/store/onboarding";

interface Bank {
  name: string;
  code: string;
}

const CreateAgencyBank = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const agencyId = useOnboardingStore((s) => s.agencyId);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const accountNumber = watch("accountNumber");
  const bankDetailsRaw = watch("bankDetails");
  const selectedBankDetails = bankDetailsRaw
    ? JSON.parse(bankDetailsRaw)
    : null;

  // Fetch bank list from Paystack
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get("https://api.paystack.co/bank", {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET}`,
          },
        });
        setBanks(res.data.data);
      } catch (err) {
        console.error("Failed to load banks", err);
      } finally {
        setLoadingBanks(false);
      }
    };
    fetchBanks();
  }, []);

  // Auto verify account name when both bank and account number are valid
  useEffect(() => {
    const verifyAccount = async () => {
      if (accountNumber?.length === 10 && selectedBankDetails?.code) {
        setVerifying(true);
        setError("");
        try {
          const res = await axios.get(
            `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${selectedBankDetails?.code}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET}`,
              },
            }
          );
          console.log("bank details", res.data);
          setAccountName(res.data.data.account_name);
          setValue("accountName", res.data.data.account_name);
        } catch (err: any) {
          console.error(err);
          setError(
            "Unable to verify account details. Please check and try again."
          );
          setAccountName("");
        } finally {
          setVerifying(false);
        }
      }
    };

    verifyAccount();
  }, [accountNumber, selectedBankDetails?.code, setValue]);

  const agencyBankMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log(data);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/create-agency-bank`,
        {
          agencyId,
          accountNumber: data?.accountNumber,
          accountName,
          bankName: selectedBankDetails?.name,
          isPrimary: data?.isPrimary === "true" ? true : false,
        }
      );
      return res.data;
    },
    onSuccess: () => {
      useOnboardingStore.getState().reset();
      router.push("/");
    },
  });

  const onSubmit = (data: any) => {
    if (!accountName) {
      setError("Please verify your account details first.");
      return;
    }
    agencyBankMutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-2xl font-semibold text-center mb-4">
        Add Agency Bank Account
      </h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block text-gray-700 mb-1">Bank *</label>
        {loadingBanks ? (
          <p>Loading banks...</p>
        ) : (
          <select
            className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
            {...register("bankDetails", { required: "Bank is required" })}
          >
            <option value="">Select bank</option>
            {banks.map((bank: any, index: number) => (
              <option key={index} value={JSON.stringify(bank)}>
                {bank.name}
              </option>
            ))}
          </select>
        )}
        {errors.bankDetails && (
          <p className="text-red-500 text-sm">
            {String(errors.bankDetails.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Account Number *</label>
        <input
          type="text"
          maxLength={10}
          placeholder="Enter 10-digit account number"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register("accountNumber", {
            required: "Account number is required",
            pattern: {
              value: /^[0-9]{10}$/,
              message: "Enter a valid 10-digit number",
            },
          })}
        />
        {errors.accountNumber && (
          <p className="text-red-500 text-sm">
            {String(errors.accountNumber.message)}
          </p>
        )}

        {verifying ? (
          <p className="text-blue-500 text-sm mb-2">Verifying account...</p>
        ) : accountName ? (
          <p className="text-green-600 text-sm mb-2">
            ✅ Verified Account: <strong>{accountName}</strong>
          </p>
        ) : error ? (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        ) : null}

        <label className="block text-gray-700 mb-1">Set as Primary?</label>
        <select
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-3"
          {...register("isPrimary")}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>

        <button
          type="submit"
          className={`w-full text-lg text-white py-2 rounded-lg mt-2 ${
            agencyBankMutation.isPending
              ? "opacity-50 cursor-not-allowed bg-slate-600"
              : "bg-blue-600"
          }`}
          disabled={verifying || agencyBankMutation.isPending}
        >
          {agencyBankMutation.isPending ? "Saving..." : "Save Bank Account"}
        </button>
      </form>
    </div>
  );
};

export default CreateAgencyBank;
