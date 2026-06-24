import React from "react";
import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  warning?: string;
  icon?: React.ReactNode;

  // Button labels
  primaryText?: string;
  secondaryText?: string;
  tertiaryText?: string;

  // Handlers
  onPrimary?: () => void;
  onSecondary?: () => void;
  onTertiary?: () => void;

  // Colors for buttons
  primaryColor?: "red" | "green" | "yellow" | "blue";
  secondaryColor?: "gray" | "red" | "green" | "blue";
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  warning,
  icon,
  primaryText = "Confirm",
  secondaryText = "Cancel",
  tertiaryText,
  onPrimary,
  onSecondary,
  onTertiary,
  primaryColor = "red",
  secondaryColor = "gray",
  loading = false,
}) => {
  if (!isOpen) return null;

  const colorMap: Record<string, string> = {
    red: "bg-red-600 hover:bg-red-700",
    green: "bg-green-600 hover:bg-green-700",
    yellow: "bg-yellow-600 hover:bg-yellow-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    gray: "bg-gray-600 hover:bg-gray-700",
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[460px] shadow-lg relative border border-gray-700">
        {/* Close Icon */}
        <button
          type="button"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
          onClick={onSecondary}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h3 className="text-xl text-white mb-3 flex items-center gap-2">
          {icon}
          {title}
        </h3>

        {/* Description */}
        {description && <p className="text-gray-300 mb-3">{description}</p>}

        {/* Warning Box */}
        {warning && (
          <div className="bg-gray-900 text-yellow-400 p-3 rounded-md border border-yellow-600 text-sm">
            {warning}
          </div>
        )}

        {/* Buttons */}
        <div
          className={`flex justify-end gap-3 mt-6 ${
            tertiaryText ? "flex-wrap" : ""
          }`}
        >
          {tertiaryText && (
            <button
              type="button"
              onClick={onTertiary}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white font-medium transition disabled:opacity-60"
            >
              {tertiaryText}
            </button>
          )}
          <button
            type="button"
            onClick={onSecondary}
            disabled={loading}
            className={`${colorMap[secondaryColor]} px-4 py-2 rounded-md text-white font-medium transition disabled:opacity-60`}
          >
            {secondaryText}
          </button>
          <button
            type="button"
            onClick={onPrimary}
            disabled={loading}
            className={`${colorMap[primaryColor]} px-4 py-2 rounded-md text-white font-semibold transition disabled:opacity-60`}
          >
            {loading ? "Please wait..." : primaryText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

//USeage - 3 button
// import ConfirmModal from "@/components/modals/ConfirmModal";
// import { FileWarning } from "lucide-react";

// <ConfirmModal
//   isOpen={showDraftModal}
//   title="Existing draft found"
//   description="A saved draft for this property was found. You can load it, discard it, or cancel to stay on this page."
//   warning="If you discard the draft, it will be deleted from both your device and the server."
//   primaryText="Load Draft"
//   secondaryText="Discard Draft"
//   tertiaryText="Cancel"
//   primaryColor="green"
//   secondaryColor="red"
//   icon={<FileWarning className="text-yellow-400" />}
//   onPrimary={handleLoadDraft}
//   onSecondary={handleDiscardDraft}
//   onTertiary={() => setShowDraftModal(false)}
// />

// Usage 2 buttons

{
  /* <ConfirmModal
  isOpen={showDeleteModal}
  title="Delete Property"
  description="Are you sure you want to delete this property? This action cannot be undone."
  primaryText="Delete"
  secondaryText="Cancel"
  primaryColor="red"
  onPrimary={handleDeleteProperty}
  onSecondary={() => setShowDeleteModal(false)}
/> */
}
