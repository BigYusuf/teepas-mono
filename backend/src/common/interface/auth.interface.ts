import { Types } from "mongoose";

export interface RegisterDto {
  appId: Types.ObjectId | string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  userAgent?: string;
  roleKey?: string;
}
export interface RegisterStaffDto {
  organizationId: Types.ObjectId | string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userAgent?: string;
  otp?: string;
}

export interface LoginDto {
  email: string;
  phone?: string;
  password: string;
  userAgent?: string;
  appId: Types.ObjectId | string;
  clientType?: string;
}

export interface resetPasswordDto {
  appId?: Types.ObjectId | string;
  password: string;
  verificationCode: string;
}
