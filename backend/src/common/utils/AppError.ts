import { HttpStatusCode } from "../../shared/configs/http.config";
import { ErrorCode } from "../enums/error-code.enum";

export class AppError extends Error {
  public readonly statusCode: number | HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public errorCode?: ErrorCode;

  constructor(
    message: string,
    statusCode: number | HttpStatusCode,
    isOperational = true,
    details?: any,
    errorCode?: ErrorCode,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    this.errorCode = errorCode;
    Error.captureStackTrace(this);
  }
}
