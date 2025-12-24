import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import * as cookieParser from "cookie-parser";
import { AppModule } from "../../src/app.module";
import { createTestUser } from "../fixtures/test-data";

describe("NotesController (e2e)", () => {
  let app: INestApplication;
  let authCookie: string[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Register and Login to get token
    const user = createTestUser("notes");
    await request(app.getHttpServer()).post("/auth/register").send(user);

    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        identifier: user.email,
        password: user.password,
      });

    authCookie = loginResponse.get("Set-Cookie") as string[];
    if (!authCookie) throw new Error("Login failed, no cookie set");
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Notes CRUD Flow", () => {
    let noteId: string;

    it("should create a new note", () => {
      return request(app.getHttpServer())
        .post("/notes")
        .set("Cookie", authCookie)
        .send({
          title: "Test Note",
          content: {
            blocks: [
              {
                id: "550e8400-e29b-41d4-a716-446655440000",
                type: "text",
                order: 0,
                data: { text: "This is a test note content" },
              },
            ],
          },
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body.title).toBe("Test Note");
          noteId = res.body.id;
        });
    });

    it("should get all notes", () => {
      return request(app.getHttpServer())
        .get("/notes")
        .set("Cookie", authCookie)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.notes)).toBe(true);
          // Check if at least one note exists (created above)
          expect(res.body.notes.length).toBeGreaterThan(0);
        });
    });

    it("should get note by id", () => {
      return request(app.getHttpServer())
        .get(`/notes/${noteId}`)
        .set("Cookie", authCookie)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(noteId);
        });
    });

    it("should update note", () => {
      return request(app.getHttpServer())
        .put(`/notes/${noteId}`)
        .set("Cookie", authCookie)
        .send({
          title: "Updated Test Note",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe("Updated Test Note");
        });
    });

    it("should delete note", () => {
      return request(app.getHttpServer())
        .delete(`/notes/${noteId}`)
        .set("Cookie", authCookie)
        .expect(204);
    });
  });

  describe("Authorization", () => {
    it("should reject request without token", () => {
      return request(app.getHttpServer()).get("/notes").expect(401);
    });

    it("should reject request with invalid token", () => {
      return request(app.getHttpServer())
        .get("/notes")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });
  });
});
