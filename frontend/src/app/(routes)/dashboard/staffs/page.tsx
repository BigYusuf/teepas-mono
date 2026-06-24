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
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trash,
  Mail,
  Ban,
  Pencil,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";

import BreadCrumbs from "@/shared/components/breadcrumbs";
import ConfirmModal from "@/shared/components/modals/confirmation.modal";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import InviteStaffModal from "@/shared/components/modals/invite-staff.modal";
import StaffDetailsModal from "@/shared/components/modals/staff.details.modal";
import { roleOptions } from "@/data/agent";

const fetchStaffs = async () => {
  const res = await axiosInstance.get("/agent/get-agency-staffs");
  return res.data.agents || res.data.data || res.data.staff || [];
};
// const fetchInvites = async () => {
//   const res = await axiosInstance.get("/agent/get-agency-invites");
//   return res.data.invites || res.data.data || res.data.invites || [];
// };

const Staffs = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      email: "",
      role: "AGENT",
    },
  });

  const { data: staffs = [], isLoading } = useQuery({
    queryKey: ["agency-staffs"],
    queryFn: fetchStaffs,
    staleTime: 1000 * 60 * 5,
  });
  const openStaffModal = (staff: any) => {
    setSelectedStaff(staff);
    setShowStaffModal(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Staff ID",
        cell: ({ row }: any) => (
          <span className="text-white text-sm">
            #{row?.original.id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }: any) => (
          <span className="text-white">
            {row?.original?.name || "Unknown Staff"}
          </span>
        ),
      },

      {
        accessorKey: "role.name",
        header: "Role",
        cell: ({ row }: any) => {
          const role = roleOptions.find(
            (r) => r.value === row?.original.role?.name
          );
          if (role) {
            return (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-white`}
              >
                {role.label}
              </span>
            );
          }
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-white`}
            >
              {row?.original.role?.name || "N/A"}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row?.original.status === "ACTIVE"
                ? "bg-green-600 text-white"
                : row?.original.status === "SUSPENDED"
                ? "bg-red-600 text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {row?.original.status}
          </span>
        ),
      },

      // {
      //   accessorKey: "joinedAt",
      //   header: "Join At",
      //   cell: ({ row }: any) => {
      //     const date = new Date(row?.original.joinedAt).toLocaleDateString();
      //     return <span className="text-white text-sm">{date}</span>;
      //   },
      // },
      {
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowInviteModal(true);
                setSelectedStaff(row?.original);
              }}
              className="text-green-400 hover:text-green-300 transition"
              title="Change Role"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => openStaffModal(row?.original)}
              className="text-blue-400 hover:text-blue-300 transition"
              title="View Details"
            >
              <Eye size={18} />
            </button>

            <button
              className={`${
                row.original.status === "ACTIVE"
                  ? "text-yellow-400 hover:text-yellow-200"
                  : "text-red-400 hover:text-red-300"
              } transition`}
              title="Ban/Unban Staff"
              onClick={() => openModal(row.original)}
            >
              {row?.original.status === "ACTIVE" ? (
                <Ban size={18} />
              ) : (
                <RotateCcw size={18} />
              )}
            </button>
            <button
              className={`text-red-400 hover:text-red-300 transition`}
              title="Remove Staff"
              onClick={() => {
                setShowDeleteModal(true);
                setSelectedStaff(row.original);
              }}
            >
              <Trash size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );
  const openModal = (staff: any) => {
    setSelectedStaff(staff);
    setShowModal(true);
  };

  const handleStatusChange = async () => {
    try {
      setLoading(true);
      await axiosInstance.patch(`/agent/${selectedStaff.id}/status`, {
        action: selectedStaff.status === "ACTIVE" ? "ban" : "unban",
      });
      toast.success(
        `Agent has been ${
          selectedStaff.status === "ACTIVE" ? "banned" : "unbanned"
        } successfully`
      );

      queryClient.invalidateQueries({ queryKey: ["agency-staffs"] });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update agent status"
      );
    } finally {
      setLoading(false);
      setShowModal(false);
      setSelectedStaff(null);
    }
  };

  const table = useReactTable({
    data: staffs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  // invite modal handler
  const handleShowInviteModal = () => {
    setSelectedStaff(null);
    setShowInviteModal(true);
  };

  const handleCloseInviteModal = () => {
    setSelectedStaff(null);
    setShowInviteModal(false);
  };
  //change /toggle role
  const handleRoleChange = async () => {
    try {
      setLoading(true);
      await axiosInstance.patch(`/agent/change-role/${selectedStaff.id}`, {
        roleName: watch("role"),
      });
      toast.success(`Staff role has been updated successfully`);

      queryClient.invalidateQueries({ queryKey: ["agency-staffs"] });
      handleCloseInviteModal();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update staff role"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    const { email, role } = watch();
    try {
      setLoading(true);
      await axiosInstance.post(`/agent/invite-staff`, {
        email,
        role,
      });
      toast.success(`Invitation sent to ${email} successfully`);

      queryClient.invalidateQueries({ queryKey: ["agency-staffs"] });
      handleCloseInviteModal();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to send invitation"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteStaff = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/agent/remove-agent/${selectedStaff.id}`);
      toast.success(`Staff has been removed successfully`);

      queryClient.invalidateQueries({ queryKey: ["agency-staffs"] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove staff");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedStaff(null);
    }
  };
  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold mb-2">
          Agency Staffs & Partners
        </h2>
        <button
          onClick={handleShowInviteModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Mail size={18} /> Invite New Staff
        </button>
      </div>
      <BreadCrumbs title="Staffs" />

      <div className="my-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search staffs..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading staffs...</p>
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
              {table?.getRowModel()?.rows?.map((row) => (
                <tr
                  key={row?.id}
                  className="border-b border-gray-800 hover:bg-gray-900 transition"
                >
                  {row?.getVisibleCells().map((cell) => (
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
        {showModal && (
          <ConfirmModal
            isOpen={showModal}
            warning="This action will ban/ suspend the staff from accessing their account and managing agency properties."
            title="Ban/ Suspend Staff"
            description={`Are you sure you want to ${
              selectedStaff?.status === "ACTIVE" ? "ban" : "unban"
            }? This action can be undone.`}
            primaryText={selectedStaff?.status === "ACTIVE" ? "Ban" : "Unban"}
            secondaryText="Cancel"
            primaryColor={selectedStaff?.status === "ACTIVE" ? "red" : "green"}
            loading={loading}
            onPrimary={handleStatusChange}
            onSecondary={() => {
              setShowModal(false);
              setSelectedStaff(null);
            }}
          />
        )}
        {showDeleteModal && (
          <ConfirmModal
            isOpen={showDeleteModal}
            warning="This action will permanently remove the staff from your agency and they can't access or manage your agency properties."
            title="Remove Staff"
            description={`Are you sure you want to remove *** ${selectedStaff?.name} ***. This action can NOT be undone.`}
            primaryText={"Remove"}
            secondaryText="Cancel"
            primaryColor="red"
            loading={loading}
            onPrimary={handleDeleteStaff}
            onSecondary={() => {
              setSelectedStaff(null);
              setShowDeleteModal(false);
            }}
          />
        )}
        {showInviteModal && (
          <InviteStaffModal
            selectedStaff={selectedStaff}
            register={register}
            errors={errors}
            onClose={handleCloseInviteModal}
            onInvite={
              selectedStaff
                ? handleSubmit(handleRoleChange)
                : handleSubmit(handleInvite)
            }
            loading={loading}
          />
        )}
        {showStaffModal && (
          <StaffDetailsModal
            data={selectedStaff}
            onClose={() => {
              setSelectedStaff(null);
              setShowStaffModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Staffs;
