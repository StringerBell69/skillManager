import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import type { ErrorCode, ApiError } from "@skillmanager/shared";

const HTTP_TO_ERROR_CODE: Record<number, ErrorCode> = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  429: "RATE_LIMITED",
  500: "INTERNAL_ERROR",
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let code: ErrorCode;
    let message: string;
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        code = (resp.code as ErrorCode) || HTTP_TO_ERROR_CODE[status] || "INTERNAL_ERROR";
        message = (resp.message as string) || exception.message;
        details = resp.details;
      } else {
        code = HTTP_TO_ERROR_CODE[status] || "INTERNAL_ERROR";
        message = typeof exceptionResponse === "string" ? exceptionResponse : exception.message;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = "INTERNAL_ERROR";
      message = "An unexpected error occurred";

      // Log internal errors
      console.error("Unhandled exception:", exception);
    }

    const errorResponse: ApiError = {
      statusCode: status,
      code,
      message,
      ...(details ? { details } : {}),
    };

    response.status(status).json(errorResponse);
  }
}
