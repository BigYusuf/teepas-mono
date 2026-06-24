import React, { useState } from "react";
import {
  MapPin,
  Home,
  Image,
  FileText,
  Info,
  Building2,
  DollarSign,
  ArrowLeft,
  UploadCloud,
} from "lucide-react";
import { formatMoney } from "@/utils/format";
import { currencyOptions } from "@/data/property";

interface PropertySummaryReviewProps {
  data: any;
  onBack?: () => void;
  onPublish?: () => Promise<void>;
}

const PropertySummaryReview: React.FC<PropertySummaryReviewProps> = ({
  data,
  onBack,
  onPublish,
}) => {
  const [publishing, setPublishing] = useState(false);

  if (!data) return null;
  let total =
    parseFloat(data.cautionFee) +
    parseFloat(data.agentFee) +
    parseFloat(data.basePrice) +
    parseFloat(data.legalFee);

  const sign = currencyOptions?.filter(
    (item) => item.value === data?.currency
  )[0]?.sign;

  // Images
  const sanitizedImages = (data.images || [])
    .filter(Boolean)
    .map((img: any) => {
      if (img?.base64) return { base64: img.base64 };
      if (img?.url) return { url: img.url, file_id: img.file_id };
      return null;
    })
    .filter(Boolean);

  const sections = [
    {
      icon: <Info className="text-blue-400" size={20} />,
      title: "Basic Information",
      fields: [
        { label: "Title", value: data.title },
        { label: "Description", value: data.description },
        { label: "Category", value: data.category },
        { label: "Type", value: data.type },
        { label: "Purpose", value: data.purpose },
        { label: "Design Type", value: data.designType },
        { label: "Amenities", value: data.amenities },
        { label: "Electricity", value: data.electricity },
        { label: "Electric Billing Type", value: data.electricBilling },
      ],
    },
    {
      icon: <MapPin className="text-green-400" size={20} />,
      title: "Location",
      fields: [
        { label: "Address", value: data.address },
        { label: "City", value: data.city },
        { label: "State", value: data.state },
        { label: "Country", value: data.country },
        {
          label: "Coordinates",
          value:
            data.coordinates &&
            `${data.coordinates.lat ?? ""}, ${data.coordinates.lng ?? ""}`,
        },
      ],
    },
    {
      icon: <Building2 className="text-yellow-400" size={20} />,
      title: "Structure & Details",
      fields: [
        { label: "Year Built", value: data?.yearBuilt },
        { label: "Condition", value: data.condition },
        { label: "Furnishing", value: data.furnishing },
        { label: "Construction", value: data.construction },
        { label: "Availability", value: data.availability },
        { label: "Size (sqm)", value: data.sizeSqm },
        { label: "Land Size (sqm)", value: data.landSizeSqm },
        { label: "Floor Type", value: data.floorType },
        { label: "Wall Finish", value: data.wallFinish },
        { label: "Ceiling Type", value: data.ceilingType },
        { label: "Roof Type", value: data.roofType },
        { label: "Building Material", value: data.buildingMaterial },
      ],
    },
    {
      icon: <DollarSign className="text-orange-400" size={20} />,
      title: "Pricing",
      fields: [
        { label: "Currency", value: data.currency },
        {
          label: "Base Price",
          value: data.basePrice
            ? formatMoney(parseFloat(data.basePrice) || 0, {
                short: false,
                currency: sign,
              })
            : "",
        },
        {
          label: "Agent Fee",
          value: data.agentFee
            ? formatMoney(parseFloat(data.agentFee) || 0, {
                short: false,
                currency: sign,
              })
            : "",
        },
        {
          label: "Caution Fee",
          value: data.cautionFee
            ? formatMoney(parseFloat(data.cautionFee) || 0, {
                short: false,
                currency: sign,
              })
            : "",
        },
        {
          label: "Legal Fee",
          value: data.legalFee
            ? formatMoney(parseFloat(data.legalFee) || 0, {
                short: false,
                currency: sign,
              })
            : "",
        },
        {
          label: "Total Payable",
          value: formatMoney(total || 0, {
            short: false,
            currency: sign,
          }),
        },
        { label: "Payment Frequency", value: data.paymentFrequency },
        { label: "Negotiable", value: data?.negotiable || "false" },
        { label: "Lease Duration", value: data.lease },
      ],
    },
    {
      icon: <Image className="text-pink-400" size={20} />,
      title: "Media",
      custom: (
        <div className="flex flex-wrap gap-3">
          {data.images && data.images.length > 0 ? (
            sanitizedImages.map((img: any, i: number) => (
              <img
                key={i}
                src={img?.url || img?.base64}
                alt="property"
                className="w-24 h-24 rounded-lg object-cover border border-gray-700"
              />
            ))
          ) : (
            <p className="text-gray-500 italic">No images uploaded</p>
          )}
        </div>
      ),
    },
    {
      icon: <FileText className="text-purple-400" size={20} />,
      title: "Documents",
      custom: (
        <div className="flex flex-col gap-2">
          {data.documents && data.documents.length > 0 ? (
            data.documents.map((doc: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-800 p-2 rounded-md"
              >
                <div>
                  <p className="text-gray-300 font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.type}</p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm underline"
                >
                  View
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No documents uploaded</p>
          )}
        </div>
      ),
    },
  ];

  const handlePublish = async () => {
    if (!onPublish) return;
    try {
      setPublishing(true);
      await onPublish();
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6 text-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-white">
        Property Summary & Review
      </h2>

      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-5 shadow-inner">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2">
              {section.icon}
              <h3 className="text-lg font-semibold">{section.title}</h3>
            </div>

            {section.fields ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                {section.fields.map((field, i) => (
                  <div key={i}>
                    <p className="text-sm text-gray-400">{field.label}</p>
                    <p className="font-medium text-gray-200">
                      {field.value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              section.custom
            )}
          </div>
        ))}
      </div>

      {/* ✅ Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-10 border-t border-gray-700 pt-6 gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} /> Go Back
        </button>

        <button
          onClick={handlePublish}
          disabled={publishing}
          className={`flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition-all ${
            publishing
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          }`}
        >
          {publishing ? (
            <>
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
              Publishing...
            </>
          ) : (
            <>
              <UploadCloud size={18} /> Publish Property
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PropertySummaryReview;
