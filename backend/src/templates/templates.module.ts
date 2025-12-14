import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TemplatesController } from "./templates.controller";
import { TemplatesService } from "./templates.service";
import { Template } from "./entities/template.entity";
import { Note } from "../notes/entities/note.entity";

/**
 * Templates Module
 * Sprint 3 - Templates System
 *
 * Provides reusable note templates
 * Seeds builtin templates on app startup
 */
@Module({
  imports: [TypeOrmModule.forFeature([Template, Note])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule implements OnModuleInit {
  constructor(private readonly templatesService: TemplatesService) {}

  /**
   * Seed builtin templates when app starts
   */
  async onModuleInit(): Promise<void> {
    await this.templatesService.seedBuiltinTemplates();
  }
}
