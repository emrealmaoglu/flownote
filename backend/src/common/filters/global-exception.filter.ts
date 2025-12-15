import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

/**
 * Global Exception Filter
 * Tüm exception'ları yakalar ve yapılandırılmış log yazar
 * @SecOps - Clean error responses without stack traces in prod
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // HTTP status ve mesajı belirle
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";

    // Correlation ID
    const correlationId = (request as { correlationId?: string }).correlationId;

    // Structured log
    this.logger.error({
      message,
      correlationId,
      status,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      stack:
        exception instanceof Error && process.env.NODE_ENV !== "production"
          ? exception.stack
          : undefined,
    });

    // Clean response
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
    });
  }
}
