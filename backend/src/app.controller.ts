import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

/**
 * Ana Controller - Health check ve API info
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   * @returns API durumu
   */
  @Get()
  getStatus(): { status: string; message: string; version: string } {
    return this.appService.getStatus();
  }

  /**
   * Health endpoint for Docker/K8s
   */
  @Get("health")
  healthCheck(): { status: "ok" | "error"; timestamp: string } {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
