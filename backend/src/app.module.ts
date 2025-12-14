import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { NotesModule } from "./notes/notes.module";
import { AuthModule } from "./auth/auth.module";
import { TemplatesModule } from "./templates/templates.module";

/**
 * FlowNote Ana Modül
 * Tüm modülleri buradan yönet
 * Sprint 3: TemplatesModule eklendi
 */
@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DATABASE_HOST", "localhost"),
        port: configService.get<number>("DATABASE_PORT", 5432),
        username: configService.get("DATABASE_USER", "flownote"),
        password: configService.get(
          "DATABASE_PASSWORD",
          "flownote_secret_password",
        ),
        database: configService.get("DATABASE_NAME", "flownote_db"),
        autoLoadEntities: true,
        synchronize: configService.get("NODE_ENV") !== "production", // DEV only!
        logging: configService.get("NODE_ENV") === "development",
      }),
    }),

    // Feature modules
    AuthModule,
    NotesModule,
    TemplatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
