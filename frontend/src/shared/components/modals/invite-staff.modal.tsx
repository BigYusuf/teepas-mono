import React from "react";
import {
  Eye,
  ShoppingCart,
  Heart,
  CheckCircle,
  X,
  FileText,
  Home,
  Loader2,
} from "lucide-react";
import Input from "packages/components/input";
import { filteredRoleOptions } from "@/data/agent";

type InviteStaffModalProps = {
  register: any;
  onClose: () => void;
  onInvite: () => void;
  loading?: boolean;
  errors?: any;
  selectedStaff?: any;
};
const InviteStaffModal = ({
  register,
  onClose,
  onInvite,
  loading,
  selectedStaff,
  errors,
}: InviteStaffModalProps) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-[400px]">
        {/* Title */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl text-white">
            {selectedStaff ? "Change Staff Role" : "Invite Staff"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>
        {/* Content */}
        <form className="mt-4">
          {!selectedStaff && (
            <Input
              label="Staff Email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              error={errors?.email?.message}
            />
          )}
          <Input
            type="select"
            label="Role"
            options={filteredRoleOptions}
            error={errors?.role?.message}
            defaultValue={selectedStaff ? selectedStaff.role : "AGENT"}
            {...register("role", { required: "Role is required" })}
            required
          />

          <div className="mt-4 flex flex-col md:flex-row md:space-x-4 w-full">
            <button
              type="button"
              onClick={onInvite}
              disabled={loading}
              className={`w-[48%] ${
                loading ? "bg-gray-700" : "bg-blue-500 hover:bg-blue-600"
              } py-2 rounded-md text-white font-semibold`}
            >
              {selectedStaff ? "Change" : "Send Invite"}
            </button>
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-[48%] bg-red-500 hover:bg-red-600 py-2 rounded-md text-white font-semibold"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteStaffModal;
