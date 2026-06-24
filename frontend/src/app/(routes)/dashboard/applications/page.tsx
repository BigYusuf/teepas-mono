"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import BreadCrumbs from "@/shared/components/breadcrumbs";

const fetchApplications = async () => {
  const res = await axiosInstance.get("/agent/get-property-applications");
  return res.data.applications;
};

const Applications = () => {
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["agency-property-applications"],
    queryFn: fetchApplications,
    staleTime: 1000 * 60 * 5,
  });

  const columns = useMemo(
    () => [
      // {
      //   accessorKey: "id",
      //   header: "Application ID",
      //   cell: ({ row }: any) => (
      //     <span className="text-white text-sm">
      //       #{row.original.id.slice(-6).toUpperCase()}
      //     </span>
      //   ),
      // },
      {
        accessorKey: "user.name",
        header: "User",
        cell: ({ row }: any) => (
          <span className="text-white">
            {row.original.user?.name || "Unknown User"}
          </span>
        ),
      },
      {
        accessorKey: "property.title",
        header: "Property",
        cell: ({ row }: any) => (
          <Link
            href={`/agency/properties/${row.original.property?.id}`}
            className="text-blue-400 hover:text-blue-300"
          >
            {row.original.property?.title || "Untitled Property"}
          </Link>
        ),
      },
      {
        accessorKey: "userStatus",
        header: "User Status",
        cell: ({ row }: any) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.original.userStatus === "APPROVED"
                ? "bg-green-600 text-white"
                : row.original.userStatus === "REJECTED"
                ? "bg-red-600 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {row.original.userStatus}
          </span>
        ),
      },
      {
        accessorKey: "agencyStatus",
        header: "Agency Status",
        cell: ({ row }: any) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.original.agencyStatus === "APPROVED"
                ? "bg-green-600 text-white"
                : row.original.agencyStatus === "REJECTED"
                ? "bg-red-600 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {row.original.agencyStatus}
          </span>
        ),
      },
      {
        accessorKey: "overallStatus",
        header: "Overall Status",
        cell: ({ row }: any) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.original.overallStatus === "APPROVED"
                ? "bg-green-600 text-white"
                : row.original.overallStatus === "REJECTED"
                ? "bg-red-600 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {row.original.overallStatus}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Applied On",
        cell: ({ row }: any) => {
          const date = new Date(row.original.createdAt).toLocaleDateString();
          return <span className="text-white text-sm">{date}</span>;
        },
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-3">
            <Link
              href={`/agency/applications/${row.original.id}`}
              className="text-blue-400 hover:text-blue-300 transition"
              title="View Details"
            >
              <Eye size={18} />
            </Link>
            {row.original.agencyStatus === "PENDING" && (
              <>
                <button
                  className="text-green-500 hover:text-green-400"
                  title="Approve Application"
                  onClick={() => handleApprove(row.original.id)}
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  className="text-red-500 hover:text-red-400"
                  title="Reject Application"
                  onClick={() => handleReject(row.original.id)}
                >
                  <XCircle size={18} />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const handleApprove = async (id: string) => {
    try {
      await axiosInstance.patch(`/agent/application/${id}/approve`);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to approve application");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axiosInstance.patch(`/agent/application/${id}/reject`);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to reject application");
    }
  };

  const table = useReactTable({
    data: applications,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">
        Property Applications
      </h2>
      <BreadCrumbs title="Applications" />

      <div className="my-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search applications..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading applications...</p>
        ) : (
          <table className="w-full text-white text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
                      {flexRender(
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
      </div>
    </div>
  );
};

export default Applications;
