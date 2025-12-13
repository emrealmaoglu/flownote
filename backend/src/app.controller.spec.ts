import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

/**
 * AppController Unit Tests
 * @QA - Her controller mutlaka test edilmeli
 */
describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("getStatus", () => {
    it("should return status object with running status", () => {
      const result = appController.getStatus();

      expect(result).toBeDefined();
      expect(result.status).toBe("running");
      expect(result.message).toContain("FlowNote");
      expect(result.version).toBeDefined();
    });
  });

  describe("healthCheck", () => {
    it("should return ok status with timestamp", () => {
      const result = appController.healthCheck();

      expect(result).toBeDefined();
      expect(result.status).toBe("ok");
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });
  });
});
