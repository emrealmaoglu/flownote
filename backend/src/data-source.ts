import { DataSource } from "typeorm";
import { config } from "dotenv";

config();

const dbType = process.env.DB_TYPE || "postgres";

export const AppDataSource = new DataSource(
  dbType === "sqlite"
    ? {
        type: "better-sqlite3",
        database: process.env.SQLITE_DATABASE || "flownote.sqlite",
        entities: ["src/**/*.entity.ts"],
        migrations: ["src/migrations/*.ts"],
        synchronize: false,
        logging: process.env.NODE_ENV === "development",
      }
    : {
        type: "postgres",
        host: process.env.DATABASE_HOST || "localhost",
        port: parseInt(process.env.DATABASE_PORT || "5432"),
        username: process.env.DATABASE_USER || "flownote",
        password: process.env.DATABASE_PASSWORD || "flownote_secret_password",
        database: process.env.DATABASE_NAME || "flownote_db",
        entities: ["src/**/*.entity.ts"],
        migrations: ["src/migrations/*.ts"],
        synchronize: false,
        logging: process.env.NODE_ENV === "development",
      }
);
