import React from "react";
import {
  Eye,
  ShoppingCart,
  Heart,
  CheckCircle,
  X,
  FileText,
  Home,
  User2,
  Mail,
  Clock,
  ChartBar,
  Star,
} from "lucide-react";

interface StatItemProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass?: string;
}

const StatItem = ({
  label,
  value,
  icon,
  colorClass = "text-gray-400",
}: StatItemProps) => (
  <div className="flex justify-between items-center text-gray-300">
    <span className="flex items-center gap-2">
      <span className={colorClass}>{icon}</span>
      {label}
    </span>
    <span className="text-white font-semibold">{value}</span>
  </div>
);

const StaffDetailsModal = ({ data, onClose }: any) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-[400px]">
        {/* Title */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl text-white"> Staff Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {/* Staff Details */}
        <div className="mt-4 space-y-3">
          <StatItem
            label={"Name"}
            value={data?.name}
            icon={<User2 size={18} />}
          />
          <StatItem
            label={"Email"}
            value={data?.email}
            icon={<Mail size={18} />}
            colorClass="text-blue-500"
          />
          <StatItem
            label={"Role"}
            value={data?.role.name}
            icon={<ChartBar size={18} />}
            colorClass="text-green-500"
          />
          <StatItem
            label={"Status"}
            value={data?.status}
            icon={<Star size={18} />}
            colorClass="text-red-800"
          />
          <StatItem
            label={"Joined Teepas"}
            value={data?.createdAt?.toLocaleDateString()}
            icon={<Clock size={18} />}
            colorClass="text-yellow-500"
          />
        </div>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full bg-red-500 hover:bg-red-600 py-2 rounded-md text-white font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default StaffDetailsModal;
