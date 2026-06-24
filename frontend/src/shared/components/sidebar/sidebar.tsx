"use client";

import useAgent from "@/hooks/useAgent";
import useSidebar from "@/hooks/useSidebar";
import { redirect, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import Link from "next/link";
import Logo from "@/assets/svgs/logo";
import SidebarItem from "./sidebar.item";
import Home from "@/assets/icons/home";
import SidebarMenu from "./sidebar.menu";
import {
  BellPlus,
  BellRing,
  Briefcase,
  CalendarPlus,
  FileArchive,
  Headset,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  Settings,
  SquarePlus,
  TicketPercent,
  Users,
} from "lucide-react";
import Payment from "@/assets/icons/payment";
import useRequireAuth from "@/hooks/useRequiredAuth";

const SidebarBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { agent } = useRequireAuth();
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (agent) {
      setAddress(
        agent?.agency?.addresses[0]?.city +
          ", " +
          agent?.agency?.addresses[0]?.state +
          ", " +
          agent?.agency?.addresses[0]?.country
      );
    } else {
      setAddress("No Agency Address");
    }
  }, [agent]);

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";

  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: "0",
        overflowY: "scroll",
        scrollbarWidth: "none",
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={"/"} className="flex justify-center text-center gap-2">
            <Logo />
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {agent?.agency?.name}
              </h3>
              <h5 className="font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<Home fill={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />
          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/applications"}
                title="Applications"
                href="/dashboard/applications"
                icon={
                  <FileArchive
                    size={26}
                    color={getIconColor("/dashboard/applications")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/orders"}
                title="Orders"
                href="/dashboard/orders"
                icon={
                  <ListOrdered
                    size={26}
                    color={getIconColor("/dashboard/orders")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/payments"}
                title="Payments"
                href="/dashboard/payments"
                icon={<Payment fill={getIconColor("/dashboard/payments")} />}
              />
            </SidebarMenu>
            <SidebarMenu title="Properties">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/create-property"}
                title="Create Property"
                href="/dashboard/create-property"
                icon={
                  <SquarePlus
                    size={24}
                    color={getIconColor("/dashboard/create-property")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/all-properties"}
                title="All Properties"
                href="/dashboard/all-properties"
                icon={
                  <PackageSearch
                    size={22}
                    color={getIconColor("/dashboard/all-properties")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/create-event"}
                title="Create Event"
                href="/dashboard/create-event"
                icon={
                  <CalendarPlus
                    size={24}
                    color={getIconColor("/dashboard/create-event")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/all-events"}
                title="All Events"
                href="/dashboard/all-events"
                icon={
                  <BellPlus
                    size={24}
                    color={getIconColor("/dashboard/all-events")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/staffs"}
                title="Staffs"
                href="/dashboard/staffs"
                icon={
                  <Users size={20} color={getIconColor("/dashboard/staffs")} />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/inbox"}
                title="Inbox"
                href="/dashboard/inbox"
                icon={
                  <Mail size={20} color={getIconColor("/dashboard/inbox")} />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/settings"}
                title="Settings"
                href="/dashboard/settings"
                icon={
                  <Settings
                    size={22}
                    color={getIconColor("/dashboard/settings")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/notifications"}
                title="Notifications"
                href="/dashboard/notifications"
                icon={
                  <BellRing
                    size={24}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/promotions"}
                title="Promotions"
                href="/dashboard/promotions"
                icon={
                  <TicketPercent
                    size={22}
                    color={getIconColor("/dashboard/promotions")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/logout"}
                title="Logout"
                href="/"
                icon={<LogOut size={20} color={getIconColor("/logout")} />}
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarBarWrapper;
