import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  // 🍪 Cookie Parser
  app.use(cookieParser());

  // 🛡️ Security Headers
  app.use(helmet());

  // 🚦 Rate Limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 1000,
      message: {
        statusCode: 429,
        message: "Too many requests, please try again later.",
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Accept, Authorization",
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix("api");

  // 📚 Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle("FlowNote API")
    .setDescription("FlowNote - Notion-like note taking application API")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .addTag("Auth", "Authentication endpoints")
    .addTag("Notes", "Note management endpoints")
    .addTag("Users", "User management endpoints")
    .addTag("Health", "Health check endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 FlowNote API is running on: http://localhost:${port}/api`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
  logger.log(`🛡️ Security: Helmet enabled, Rate limiting active`);
}

bootstrap();
