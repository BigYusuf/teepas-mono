"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Star,
  MapPin,
  Users,
  Heart,
  Pencil,
  Clock,
  Calendar,
  Globe,
  ArrowLeft,
  Gem,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import useAgent from "@/hooks/useAgent";
import YoutubeIcon from "@/assets/icons/youtube-icons";
import PropertyCard from "../shared/components/cards/property.card";
import ImageEditModal from "../shared/components/modals/image-edit-modal";
import XIcon from "../assets/icons/xIcon";
import AddressList from "../shared/modules/profile/address-list";
import InfoRow from "../shared/modules/profile/info-row";

const TABS = ["Properties", "Offers", "Reviews"];

const fetchProperties = async () => {
  const res = await axiosInstance.get("/property/get-agency-properties");
  const properties = res.data.properties?.filter((i: any) => !i.starting_date);
  return properties;
};

const fetchEvents = async () => {
  const res = await axiosInstance.get("/property/get-agency-properties");
  const properties = res.data.properties?.filter((i: any) => i.starting_date);
  return properties;
};

const AgentProfile = () => {
  const { agent, isLoading } = useAgent();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("Properties");
  const [editType, setEditType] = useState<"cover" | "avatar" | null>(null); // Store type of image editing
  const router = useRouter();

  const { data: properties = [] } = useQuery({
    queryKey: ["agency-properties"],
    queryFn: fetchProperties,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!agent && !isLoading) {
      router.push("/login");
    }
  }, [agent, isLoading]);

  const { data: events = [] } = useQuery({
    queryKey: ["agency-events"],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
  });
  console.log("agents", agent);
  return (
    <>
      {isLoading ? (
        <div></div>
      ) : (
        <div className="w-full bg-gray-900 min-h-screen">
          {/* Back to Dashboard Button */}
          <div className="w-full px-3 pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition mb-4"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>

          {/* Cover Photo */}
          <div className="relative w-full flex justify-center bg-gray-800">
            <Image
              src={
                agent?.agency?.coverBanner ||
                "https://ik.imagekit.io/fz0xzwtey/cover/1200%20x%20300.svg?updatedAt=1742072797684"
              }
              alt="agent Cover"
              className="w-full h-[400px] object-cover"
              width={1200}
              height={300}
            />
            {agent?.id && (
              <button
                className="absolute top-3 right-3 bg-gray-700 px-3 py-2 rounded-md flex items-center gap-2 text-white hover:bg-gray-600 transition"
                onClick={() => setEditType("cover")}
              >
                <Pencil size={16} /> Edit Cover
              </button>
            )}
          </div>

          {/* agent Info Section */}
          <div className="w-[85%] lg:w-[70%] mt-[-50px] mx-auto relative z-20 flex flex-col lg:flex-row gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex-1">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="relative w-[100px] h-[100px] rounded-full border-4 border-gray-700 overflow-hidden">
                  <Image
                    src={
                      agent?.agency?.avatar ||
                      "https://ik.imagekit.io/fz0xzwtey/avatar/amazon.jpeg"
                    }
                    alt="agent Avatar"
                    layout="fill"
                    objectFit="cover"
                  />
                  {agent?.id && (
                    <label
                      className="absolute bottom-1 right-1 bg-gray-700 p-2 rounded-full cursor-pointer"
                      onClick={() => setEditType("avatar")}
                    >
                      <Pencil size={16} className="text-white" />
                    </label>
                  )}
                </div>

                <div className="flex-1 w-full">
                  <h1 className="text-2xl font-semibold text-white">
                    {agent?.agency?.name}
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    {agent?.agency?.bio || "No bio available."}
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center text-yellow-400 gap-1">
                      <Star fill="#facc15" size={18} />{" "}
                      <span>{agent?.agency?.ratings || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-gray-300 gap-1">
                      <Users size={18} />{" "}
                      <span>{agent?.followers || 0} Followers</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-gray-400">
                    <Clock size={18} />
                    <span>
                      {agent?.agency?.openingHours || "Mon - Sat: 9 AM - 6 PM"}
                    </span>
                  </div>

                  {/* <div className="flex items-center gap-2 mt-3 text-gray-400">
                    <MapPin size={18} />{" "}
                    <span>
                      {agent?.agency?.addresses || "No address provided"}
                    </span>
                  </div> */}
                  <AddressList addresses={agent?.agency?.addresses || []} />
                </div>

                {agent?.id ? (
                  <button
                    className="px-6 py-2 h-[40px] rounded-lg font-semibold flex items-center gap-2 bg-gray-700 text-white transition"
                    onClick={() => router.push("/edit-profile")}
                  >
                    <Pencil size={18} />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    className={`px-6 py-2 h-[40px] rounded-lg font-semibold flex items-center gap-2 ${
                      isFollowing
                        ? "bg-gray-700 text-white"
                        : "bg-blue-600 text-white"
                    } transition`}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    <Heart size={18} />
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full lg:w-[30%]">
              <h2 className="text-xl font-semibold text-white">
                Agency Details
              </h2>

              <InfoRow
                icon={Calendar}
                label="Joined At"
                value={new Date(agent?.agency?.createdAt).toLocaleDateString()}
                iconColor="text-gray-400"
              />
              <InfoRow
                icon={Coins}
                label="Points"
                value={agent?.agency?.agencyCredits?.balance ?? 0}
                iconColor="text-yellow-400"
                buttonText="Buy Credits"
                onButtonClick={() => router.push("/buy-credits")}
              />

              {agent?.agency?.website && (
                <div className="flex items-center gap-3 mt-3 text-gray-400">
                  <Globe size={18} />
                  <Link
                    href={agent?.agency?.website}
                    className="hover:underline text-blue-400"
                  >
                    {agent?.agency?.website}
                  </Link>
                </div>
              )}

              {agent?.agency?.socialLinks &&
                agent?.agency?.socialLinks.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-white text-lg font-medium">
                      Follow Us:
                    </h3>
                    <div className="flex gap-3 mt-2">
                      {agent?.agency?.socialLinks?.map(
                        (link: any, index: number) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-[.9]"
                          >
                            {link.type === "youtube" && <YoutubeIcon />}
                            {link.type === "x" && <XIcon />}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Tabs Section */}
          <div className="w-[85%] lg:w-[70%] mx-auto mt-8">
            {/* Tabs */}
            <div className="flex border-b border-gray-600">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-6 text-lg font-semibold ${
                    activeTab === tab
                      ? "text-white border-b-2 border-blue-500"
                      : "text-gray-400"
                  } transition`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="bg-gray-800 p-3 rounded-lg my-6 text-white">
              {activeTab === "Properties" && (
                <div className="m-auto grid grid-cols-1 md:grid-cols-3 gap-5">
                  {properties?.map((property: any) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                  {properties?.length === 0 && (
                    <p>No properties available yet!</p>
                  )}
                </div>
              )}
              {activeTab === "Offers" && (
                <div className="m-auto grid grid-cols-1 md:grid-cols-3 gap-5">
                  {events?.map((property: any) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                  {events?.length === 0 && <p>No offers available yet!</p>}
                </div>
              )}
              {activeTab === "Reviews" && <div>No reviews available yet!</div>}
            </div>
          </div>

          {editType && (
            <ImageEditModal
              editType={editType}
              onClose={() => setEditType(null)}
            />
          )}
        </div>
      )}
    </>
  );
};

export default AgentProfile;
