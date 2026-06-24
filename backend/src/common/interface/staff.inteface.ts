import { Types } from "mongoose";
import { StaffRolesEnum } from "../enums/roles.enum";

export interface StaffRegisterDto {
  name: string;
  email: string;
}

export interface VerifyStaffDto {
  name: string;
  email: string;
  password: string;
  otp: string;
  userAgent?: string;
}
export interface StaffLoginDto {
  email: string;
  password: string;
  userAgent?: string;
  clientType?: string; // e.g., "web", "mobile"
}
export interface InviteStaffDto {
  organizationId?: Types.ObjectId | string;
  email: string;
  roleId: string;
  invitedBy: string;
}
export interface ReInviteStaffDto {
  organizationId: Types.ObjectId | string;
  id: Types.ObjectId | string;
  roleId: string;
  invitedBy: string;
}

export interface resetPasswordStaffDto {
  password: string;
  email: string;
  confirmPassword?: string;
}
export interface verifyResetPasswordStaffDto {
  password: string;
  email: string;
  otp: string;
  confirmPassword?: string;
}

export interface VerifyForgotOtpDto {
  email: string;
  otp: string;
}

export interface CreateOrganizationMembershipDto {
  organizationId: string | Types.ObjectId;
  staffId: string | Types.ObjectId;
  roleId: string | Types.ObjectId;
}

export interface UpdateOrganizationMembershipDto {
  roleId: string;
  isActive?: boolean;
}

export interface AcceptInviteDto {
  token: string;
  name?: string;
  password?: string;
  userAgent?: string;
}
