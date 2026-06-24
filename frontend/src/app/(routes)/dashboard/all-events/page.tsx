"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Search,
  Pencil,
  Trash,
  Eye,
  Plus,
  BarChart,
  Star,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import DeleteConfirmationModal from "@/shared/components/modals/delete.confirmation.modal";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import AnalyticsModal from "@/shared/components/modals/analytics.modal";

const fetchEvents = async () => {
  const res = await axiosInstance.get("/property/get-agency-properties");
  const properties = res.data.properties?.filter((i: any) => i.starting_date);
  return properties;
};

const deleteProperty = async (propertyId: string) => {
  await axiosInstance.delete(`/property/delete-property/${propertyId}`);
};

const restoreProperty = async (propertyId: string) => {
  await axiosInstance.put(`/property/restore-property/${propertyId}`);
};

const EventList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>();
  const queryClient = useQueryClient();
  // Handle Opening Analytics Modal
  const openAnalytics = (property: any) => {
    setAnalyticsData(property);
    setShowAnalytics(true);
  };

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["agency-events"],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
  });

  // Delete Property Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-properties"] });
      setShowDeleteModal(false);
    },
  });

  // Restore Property Mutation
  const restoreMutation = useMutation({
    mutationFn: restoreProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-properties"] });
      setShowDeleteModal(false);
    },
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }: any) => {
          console.log(row.original);
          return (
            <Image
              src={row.original.images[0]?.url}
              alt={row.original.images[0]?.url}
              width={200}
              height={200}
              className="w-12 h-12 rounded-md object-cover"
            />
          );
        },
      },
      {
        accessorKey: "name",
        header: "Property Name",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/property/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => <span>${row.original.sale_price}</span>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={row.original.stock < 10 ? "text-red-500" : "text-white"}
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: "ending_date",
        header: "Ending Date",
        cell: ({ row }) => (
          <div>
            <span>{row.original.ending_date.slice(0, 10)}</span>
          </div>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={18} />{" "}
            <span className="text-white">{row.original.ratings || 5}</span>
          </div>
        ),
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex gap-3">
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/property/${row.original.slug}`}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              <Eye size={18} />
            </Link>
            <button
              className="text-green-400 hover:text-green-300 transition"
              onClick={() => openAnalytics(row.original)}
            >
              <BarChart size={18} />
            </button>
            <button
              className="text-red-400 hover:text-red-300 transition"
              onClick={() => openDeleteModal(row.original)}
            >
              <Trash size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: properties,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const openDeleteModal = (property: any) => {
    setSelectedProperty(property);
    setShowDeleteModal(true);
  };

  return (
    <div className="w-full min-h-screen p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">All Events</h2>
        <Link
          href="/dashboard/create-event"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Event
        </Link>
      </div>

      {/* Breadcrumbs */}
      <div className="mb-2">
        <BreadCrumbs title="All Events" />
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search properties..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading properties...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-900 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Analytics Modal */}
        {showAnalytics && (
          <AnalyticsModal
            property={analyticsData}
            onClose={() => setShowAnalytics(false)}
          />
        )}

        {showDeleteModal && (
          <DeleteConfirmationModal
            property={selectedProperty}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => deleteMutation.mutate(selectedProperty?.id)}
            onRestore={() => restoreMutation.mutate(selectedProperty?.id)}
          />
        )}
      </div>
    </div>
  );
};

export default EventList;
