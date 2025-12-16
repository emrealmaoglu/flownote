import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { AppModule } from "./app.module";

/**
 * FlowNote Backend Ana Başlatıcı
 * NestJS application bootstrap
 * @SecOps - Security headers and rate limiting enabled
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  // 🛡️ Security Headers (helmet)
  app.use(helmet());

  // 🚦 Global Rate Limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Max 100 requests per windowMs
      message: {
        statusCode: 429,
        message: "Too many requests, please try again later.",
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Global validation pipe
  // Note: forbidNonWhitelisted=false because we use Zod for strict validation
  // Zod already rejects unknown properties where needed
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Zod handles this
      transform: true,
    }),
  );

  // CORS - Frontend'e izin ver
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix("api");

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 FlowNote API is running on: http://localhost:${port}/api`);
  logger.log(`🛡️ Security: Helmet enabled, Rate limiting active`);
}

bootstrap();
