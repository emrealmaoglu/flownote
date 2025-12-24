import { config } from 'dotenv';

// Load test environment
config({ path: '.env.test' });

// Increase timeout for E2E tests
jest.setTimeout(30000);

beforeAll(async () => {
    // Test DB Isolation Placeholder
    // Ideally, connect to DB and clean tables here
    // const prisma = new PrismaClient();
    // await prisma.$connect();
    // await prisma.cleanDb(); // Custom function needed
});

afterAll(async () => {
    // Cleanup
});
