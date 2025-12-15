import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Correlation ID Middleware
 * Her request'e unique ID atar, distributed tracing için
 * @DevOps - Essential for log correlation
 */
@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Header'dan al veya yeni oluştur
    const correlationId =
      (req.headers["x-correlation-id"] as string) || uuidv4();

    // Request'e ekle (logging için)
    (req as { correlationId?: string }).correlationId = correlationId;

    // Response header'a ekle
    res.setHeader("x-correlation-id", correlationId);

    next();
  }
}
