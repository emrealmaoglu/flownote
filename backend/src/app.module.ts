import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { NotesModule } from "./notes/notes.module";
import { AuthModule } from "./auth/auth.module";
import { TemplatesModule } from "./templates/templates.module";
import { AdminModule } from "./admin/admin.module";
import { SeedModule } from "./seed/seed.module";
import { UsersModule } from "./users/users.module";

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

    // Database connection - supports SQLite (local dev) or PostgreSQL (prod)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbType = configService.get<string>("DB_TYPE", "postgres");

        // SQLite configuration for local development
        if (dbType === "sqlite") {
          return {
            type: "better-sqlite3",
            database: configService.get<string>(
              "SQLITE_DATABASE",
              "flownote.sqlite",
            ),
            autoLoadEntities: true,
            synchronize: true, // Safe for dev
            logging: configService.get("NODE_ENV") === "development",
          };
        }

        // PostgreSQL configuration for production
        return {
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
        };
      },
    }),

    // Feature modules
    AuthModule,
    NotesModule,
    TemplatesModule,
    AdminModule,
    SeedModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
