import {
  Eye,
  ShoppingCart,
  Heart,
  FileText,
  CheckCircle,
  Home,
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

interface AnalyticsStatsProps {
  analytics?: {
    views?: number;
    inquiries?: number;
    saved?: number;
    applications?: number;
    sales?: number;
    rents?: number;
  };
}

export const AnalyticsStats = ({ analytics }: AnalyticsStatsProps) => {
  const stats = [
    {
      label: "Views",
      value: analytics?.views || 0,
      icon: <Eye size={18} />,
      colorClass: "text-blue-400",
    },
    {
      label: "Inquiries",
      value: analytics?.inquiries || 0,
      icon: <ShoppingCart size={18} />,
      colorClass: "text-yellow-400",
    },
    {
      label: "Saved Properties",
      value: analytics?.saved || 0,
      icon: <Heart size={18} />,
      colorClass: "text-pink-400",
    },
    {
      label: "Applications",
      value: analytics?.applications || 0,
      icon: <FileText size={18} />,
      colorClass: "text-gray-400",
    },
    {
      label: "Sales",
      value: analytics?.sales || 0,
      icon: <CheckCircle size={18} />,
      colorClass: "text-green-400",
    },
    {
      label: "Rents",
      value: analytics?.rents || 0,
      icon: <Home size={18} />,
      colorClass: "text-blue-400",
    },
  ];

  return (
    <div className="mt-4 space-y-3">
      {stats.map((stat) => (
        <StatItem key={stat.label} {...stat} />
      ))}
    </div>
  );
};
