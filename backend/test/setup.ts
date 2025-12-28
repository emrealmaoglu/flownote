import { config } from "dotenv";

// Load test environment
config({ path: ".env.test" });

import { PrismaClient } from "@prisma/client";

// Increase timeout for E2E tests
jest.setTimeout(30000);

const prisma = new PrismaClient();

beforeAll(async () => {
  // Clean DB before each test suite
  try {
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }: { tablename: string }) => tablename)
      .filter((name: string) => name !== "_prisma_migrations")
      .map((name: string) => `"public"."${name}"`)
      .join(", ");

    console.log(`Cleaning tables: ${tables}`);

    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
      console.log("Database cleaned successfully");
    } else {
      console.log("No tables to clean");
    }
  } catch (error) {
    console.error("Failed to clean database:", error);
  }
});

afterAll(async () => {
  // Cleanup
});
