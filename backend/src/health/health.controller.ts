import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { PrismaService } from "../common/prisma.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: "Health check",
    description: "Returns application health status",
  })
  @ApiResponse({
    status: 200,
    description: "Application is healthy",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        timestamp: { type: "string", format: "date-time" },
        uptime: { type: "number" },
        database: { type: "string", example: "connected" },
      },
    },
  })
  async check() {
    const dbHealthy = await this.prisma.healthCheck();

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? "connected" : "disconnected",
    };
  }
}
