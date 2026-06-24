import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, AlertCircle, Info } from "lucide-react";

interface BottomActionBarProps {
  loadingDraft: boolean;
  loading: boolean;
  handleSaveDraft: () => void;
  handleBack: () => void;
  handleNext: () => void;
  showSavedMessage: boolean;
  message?: string;
  btn1Text?: string;
  messageType?: "success" | "error" | "info" | "loading";
  hideSave?: boolean;
  hideNext?: boolean;
}

export default function BottomActionBar({
  loadingDraft,
  loading,
  handleSaveDraft,
  handleBack,
  handleNext,
  btn1Text,
  showSavedMessage,
  message,
  messageType = "success",
  hideSave = false,
  hideNext = false,
}: BottomActionBarProps) {
  const [notiMessage, setNotiMessage] = useState(message);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setNotiMessage(message);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setNotiMessage(""), 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const renderIcon = () => {
    switch (messageType) {
      case "error":
        return <AlertCircle className="text-red-600" size={20} />;
      case "loading":
        return <Loader2 className="text-yellow-600 animate-spin" size={20} />;
      case "info":
        return <Info className="text-blue-600" size={20} />;
      default:
        return <CheckCircle2 className="text-green-600" size={20} />;
    }
  };

  const getMessageColor = () => {
    if (messageType === "success") return "text-green-700";
    if (messageType === "error") return "text-red-700";
    if (messageType === "loading") return "text-yellow-700";
    if (messageType === "info") return "text-blue-700";
    return "text-gray-700";
  };

  return (
    <div
      className="
        fixed bottom-0 left-[18rem] right-0 
        bg-transparent backdrop-blur-md 
        shadow-md p-4 flex justify-between items-center 
        z-40 transition-all duration-300
      "
    >
      {/* Left section — optional message */}
      <div
        className={`flex items-center gap-2 transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        {(notiMessage || showSavedMessage || loading || loadingDraft) && (
          <>
            {renderIcon()}
            <span
              className={`text-sm font-medium transition-all duration-300 ${getMessageColor()}`}
            >
              {notiMessage ||
                (messageType === "success"
                  ? "Your changes have been saved"
                  : "Processing...")}
            </span>
          </>
        )}
      </div>

      {/* Right section — action buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={loadingDraft || loading}
          className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-50"
          onClick={handleBack}
        >
          Back
        </button>

        {hideSave ? null : (
          <button
            type="button"
            className="px-4 py-2 border border-blue-600 bg-white text-black rounded-md hover:bg-blue-50 disabled:opacity-50"
            disabled={loadingDraft || loading}
            onClick={handleSaveDraft}
          >
            {loadingDraft ? "Saving..." : "Save"}
          </button>
        )}

        {hideNext ? null : (
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || loadingDraft}
            onClick={handleNext}
          >
            {loading ? "Please wait..." : btn1Text ? btn1Text : "Publish"}
          </button>
        )}
      </div>
    </div>
  );
}
