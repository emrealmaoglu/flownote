import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * FlowNote Backend Ana Başlatıcı
 * NestJS application bootstrap
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = new Logger('Bootstrap');

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // CORS - Frontend'e izin ver
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 FlowNote API is running on: http://localhost:${port}/api`);
}

bootstrap();
