"use client";
import { currencyOptions } from "@/data/property";
import { formatMoney } from "@/utils/format";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const PropertyCard = ({ property }: { property: any }) => {
  // Calculate Discount
  const regularPrice = property?.regular_price || 0;
  const salePrice = property?.sale_price || 0;
  const discount =
    regularPrice > 0
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;

  // Format the starting and ending dates
  // const startingDate = property?.starting_date
  //   ? new Date(property.starting_date).toLocaleDateString()
  //   : null;
  // const endingDate = property?.ending_date
  //   ? new Date(property.ending_date).toLocaleDateString()
  //   : null;

  // Format sign
  const sign = currencyOptions?.filter(
    (item) => item.value === property?.currency
  )[0]?.sign;

  return (
    <div className="w-full relative min-h-[350px] p-3 bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition duration-300">
      {/* Show draft property    */}
      {property?.isDeleted ? (
        <div className="absolute z-[100] font-semibold top-4 text-sm right-4 rounded-lg px-2 py-1 bg-red-600 text-white">
          TRASH
        </div>
      ) : property?.status === "ARCHIVE" ? (
        <div className="absolute z-[100] top-4 font-semibold text-sm  right-4 rounded-lg px-2 py-1 bg-yellow-600 text-white">
          ARCHIVE
        </div>
      ) : property?.status === "DRAFT" ? (
        <div className="absolute z-[100] top-4 text-sm right-4 font-semibold rounded-lg px-2 py-1 bg-green-600 text-white">
          DRAFT
        </div>
      ) : null}
      {/* Property Image */}
      <Link
        href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/property/${property?.slug}`}
        className="block"
      >
        <div className="relative z-[10] w-full h-[200px] rounded-md overflow-hidden">
          <Image
            src={
              property?.images[0]?.url ||
              "https://ik.imagekit.io/fz0xzwtey/products/product-1741207782553-0_-RWfpGzfHt.jpg"
            }
            width={450}
            height={420}
            layout="intrinsic"
            alt={property?.title}
            className="hover:scale-105 transition duration-300 bg-black"
          />
        </div>
      </Link>

      {/* Property Details */}
      <div className="mt-3">
        {/* Property Title */}
        <Link
          href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/property/${property?.slug}`}
          className="block mt-1"
        >
          <h3 className="text-md font-semibold text-white truncate">
            {property?.title}
          </h3>
        </Link>

        {/* Rating Section */}
        <div className="flex items-center gap-1 text-yellow-400 mt-2">
          <Star fill="#facc15" size={18} />
          <span className="text-sm">
            {property?.ratings
              ? property?.ratings.toFixed(1)
              : "No Ratings Yet"}
          </span>
        </div>

        {/* Pricing Section */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">
              {formatMoney(property?.pricing?.basePrice || 0, {
                short: false,
                currency: sign,
              })}
            </span>

            {/* Discount Badge (only if discount > 0) */}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Event Dates */}
        {/* {startingDate && endingDate && (
          <div className="text-sm text-gray-300 mt-2">
            <p>
              Offer Running: {startingDate} - {endingDate}
            </p>
          </div>
        )} */}

        {/* Sold Count */}
        <div className="text-sm text-green-400 mt-1">
          {property?.sold > 0 ? `${property?.sold} Sold` : "Not Sold Yet"}
        </div>

        {/* View Details Button */}
        {property?.isDeleted ? (
          <Link
            href={`/dashboard/all-properties?slug=${property?.slug}`}
            className="mt-3 block bg-blue-600 text-center text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Remove From Trash
          </Link>
        ) : property?.status === "DRAFT" ? (
          <Link
            href={`/dashboard/create-property`}
            className="mt-3 block bg-blue-600 text-center text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Publish now
          </Link>
        ) : (
          <Link
            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/property/${property?.slug}`}
            className="mt-3 block bg-blue-600 text-center text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
