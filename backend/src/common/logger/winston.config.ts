import { WinstonModule, utilities as nestWinstonUtilities } from "nest-winston";
import * as winston from "winston";

/**
 * Winston Logger Configuration
 * @DevOps - Structured logging for observability
 */
export const winstonLoggerConfig = WinstonModule.forRoot({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        process.env.NODE_ENV === "production"
          ? // Production: JSON format for log aggregation
            winston.format.combine(
              winston.format.json(),
              winston.format.errors({ stack: true }),
            )
          : // Development: Colorful, readable format
            nestWinstonUtilities.format.nestLike("FlowNote", {
              prettyPrint: true,
              colors: true,
            }),
      ),
    }),
  ],
});
