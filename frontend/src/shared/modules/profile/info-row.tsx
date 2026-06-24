import { LucideIcon } from "lucide-react";

interface InfoRowProps {
  icon: LucideIcon;              // e.g. Coins, Calendar, Eye
  label: string;                 // e.g. "Points", "Joined At"
  value?: string | number;       // e.g. 120, "12 Jan 2025"
  iconColor?: string;            // e.g. "text-blue-400"
  buttonText?: string;           // optional button text
  onButtonClick?: () => void;    // optional button handler
  className?: string;            // extra styles
}

export default function InfoRow({
  icon: Icon,
  label,
  value,
  iconColor = "text-gray-400",
  buttonText,
  onButtonClick,
  className = "",
}: InfoRowProps) {
  return (
    <div
      className={`flex items-center justify-between mt-3 bg-gray-800/40 transition-colors ${className}`}
    >
      <div className="flex items-center gap-2 text-gray-400">
        <Icon className={`${iconColor}`} size={18} />
        <span className="font-medium">
          {label}:{" "}
          <span className="text-gray-300 font-semibold">
            {value ?? "—"}
          </span>
        </span>
      </div>

      {buttonText && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="px-3 py-1.5 bg-blue-500/10 border border-blue-400/40 text-blue-400 text-sm rounded-lg hover:bg-blue-500/20 hover:border-blue-400 transition-all"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
