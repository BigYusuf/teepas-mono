import React from "react";
import {
  Eye,
  ShoppingCart,
  Heart,
  CheckCircle,
  X,
  FileText,
  Home,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { AnalyticsStats } from "../analytics/property.analystics";

const fetchAnalytics = async (propertyId: string) => {
  const res = await axiosInstance.get(
    `/property/get-property-analytics/${propertyId}`,
    isProtected
  );
  return res?.data?.analytics;
};

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

const AnalyticsModal = ({ property, onClose }: any) => {
  const { data: analytics = [] } = useQuery({
    queryKey: ["property-analytics", property.id],
    queryFn: () => fetchAnalytics(property.id),
    staleTime: 1000 * 60 * 5,
    enabled: !!property.id,
  });

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-[400px]">
        {/* Title */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl text-white">{property.title} Analytics</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {/* Analytics Metrics */}
        <AnalyticsStats analytics={analytics} />

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

export default AnalyticsModal;
