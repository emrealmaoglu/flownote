import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

/**
 * Auth E2E Tests
 * @QA - Authentication flow tests
 */
describe("Auth (e2e)", () => {
  let app: INestApplication;
  const testUser = {
    username: "testuser",
    email: "test@example.com",
    password: "test123",
    name: "Test User",
  };
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty("access_token");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.email).toBe(testUser.email);
    });

    it("should return 400 for invalid data", async () => {
      await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({ email: "invalid" })
        .expect(400);
    });

    it("should return 400 for duplicate username", async () => {
      await request(app.getHttpServer())
        .post("/api/auth/register")
        .send(testUser)
        .expect(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with username", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          identifier: testUser.username,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
      authToken = response.body.access_token;
    });

    it("should login with email", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          identifier: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
    });

    it("should return 401 for wrong password", async () => {
      await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          identifier: testUser.username,
          password: "wrongpassword",
        })
        .expect(401);
    });

    it("should return 401 for non-existent user", async () => {
      await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          identifier: "nonexistent",
          password: "password",
        })
        .expect(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user info", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body.username).toBe(testUser.username);
    });

    it("should return 401 without token", async () => {
      await request(app.getHttpServer()).get("/api/auth/me").expect(401);
    });

    it("should return 401 with invalid token", async () => {
      await request(app.getHttpServer())
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });
  });
});
