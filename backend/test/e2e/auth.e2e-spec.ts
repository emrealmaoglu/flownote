import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../src/app.module"; // Adjust path if needed
import { createTestUser } from "../fixtures/test-data";

describe("AuthController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/auth/register (POST)", () => {
    it("should register a new user", () => {
      const user = createTestUser("reg");
      return request(app.getHttpServer())
        .post("/auth/register")
        .send(user)
        .expect(201)
        .expect((res) => {
          expect(res.headers["set-cookie"]).toBeDefined();
          expect(res.body).toHaveProperty("user");
          expect(res.body.user.email).toBe(user.email);
        });
    });

    it("should reject invalid email", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "invalid-email",
          username: "testuser",
          password: "Test123!@#",
          name: "Test User",
        })
        .expect(400);
    });
  });

  describe("/auth/login (POST)", () => {
    const user = createTestUser("login");

    beforeAll(async () => {
      // Register user first
      await request(app.getHttpServer()).post("/auth/register").send(user);
    });

    it("should login existing user", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          identifier: user.email,
          password: user.password,
        })
        .expect(200) // Changed to 201 if create, but login is usually 200/201
        .expect((res) => {
          expect(res.headers["set-cookie"]).toBeDefined();
        });
    });

    it("should reject wrong password", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          identifier: user.email,
          password: "wrongpassword",
        })
        .expect(401);
    });
  });
});
