// utils/applicationStatus.ts
import {
  ApplicationUserStatus,
  ApplicationAgencyStatus,
  ApplicationStatus,
} from "@prisma/client";

export function computeOverallStatus(
  userStatus: ApplicationUserStatus,
  agencyStatus: ApplicationAgencyStatus,
): ApplicationStatus {
  if (
    userStatus === "CANCELLED" ||
    agencyStatus === "REJECTED" ||
    userStatus === "REJECTED"
  ) {
    return "REJECTED";
  }
  if (userStatus === "APPROVED" && agencyStatus === "APPROVED") {
    return "COMPLETED";
  }
  if (agencyStatus === "APPROVED") {
    return "APPROVED";
  }
  return "PENDING";
}
