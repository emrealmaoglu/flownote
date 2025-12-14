import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UsePipes,
  UseGuards,
} from "@nestjs/common";
import { TemplatesService } from "./templates.service";
import {
  CreateTemplateSchema,
  CreateTemplateDto,
  UpdateTemplateSchema,
  UpdateTemplateDto,
  ApplyTemplateSchema,
  ApplyTemplateDto,
} from "./dto/template.schemas";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

/**
 * Templates Controller
 * Sprint 3 - Templates System
 *
 * Endpoints:
 * - GET    /templates         - List all templates
 * - POST   /templates         - Create new template
 * - GET    /templates/:id     - Get template by ID
 * - PUT    /templates/:id     - Update template
 * - DELETE /templates/:id     - Delete template
 * - POST   /templates/:id/apply - Create note from template
 */
@Controller("templates")
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  /**
   * GET /templates - List all templates
   * Returns builtin templates + user's own templates
   */
  @Get()
  async findAll() {
    const templates = await this.templatesService.findAll();
    return {
      templates: templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        isBuiltin: template.isBuiltin,
        blockCount: template.content?.blocks?.length || 0,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      })),
    };
  }

  /**
   * POST /templates - Create new template
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateTemplateSchema))
  async create(@Body() createTemplateDto: CreateTemplateDto) {
    const template = await this.templatesService.create(createTemplateDto);
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      content: template.content,
      category: template.category,
      isBuiltin: template.isBuiltin,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  /**
   * GET /templates/:id - Get template by ID
   */
  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    const template = await this.templatesService.findOne(id);
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      content: template.content,
      category: template.category,
      isBuiltin: template.isBuiltin,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  /**
   * PUT /templates/:id - Update template
   * Cannot update builtin templates
   */
  @Put(":id")
  @UsePipes(new ZodValidationPipe(UpdateTemplateSchema))
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    const template = await this.templatesService.update(id, updateTemplateDto);
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      content: template.content,
      category: template.category,
      isBuiltin: template.isBuiltin,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  /**
   * DELETE /templates/:id - Delete template
   * Cannot delete builtin templates
   */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    await this.templatesService.remove(id);
  }

  /**
   * POST /templates/:id/apply - Create note from template
   * Clones template content with new block IDs
   */
  @Post(":id/apply")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(ApplyTemplateSchema))
  async apply(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() applyDto: ApplyTemplateDto,
  ) {
    const note = await this.templatesService.applyTemplate(id, applyDto.title);
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }
}
