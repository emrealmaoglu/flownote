import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Template } from "./entities/template.entity";
import { CreateTemplateDto, UpdateTemplateDto } from "./dto/template.schemas";
import { Note } from "../notes/entities/note.entity";
import { v4 as uuidv4 } from "uuid";

/**
 * Templates Service
 * Sprint 3 - Templates System
 * Handles CRUD for note templates and applying templates to create notes
 */
@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templatesRepository: Repository<Template>,
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
  ) {}

  /**
   * Create a new template
   */
  async create(
    createTemplateDto: CreateTemplateDto,
    userId?: string,
  ): Promise<Template> {
    const template = this.templatesRepository.create({
      name: createTemplateDto.name,
      description: createTemplateDto.description ?? null,
      content: createTemplateDto.content,
      category: createTemplateDto.category ?? null,
      isBuiltin: false,
      userId: userId ?? null,
    });
    return this.templatesRepository.save(template);
  }

  /**
   * Get all templates (builtin + user's own)
   */
  async findAll(userId?: string): Promise<Template[]> {
    return this.templatesRepository.find({
      where: [{ isBuiltin: true }, { userId: userId ?? undefined }],
      order: { isBuiltin: "DESC", name: "ASC" },
    });
  }

  /**
   * Get template by ID
   */
  async findOne(id: string): Promise<Template> {
    const template = await this.templatesRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }
    return template;
  }

  /**
   * Update a template (only non-builtin)
   */
  async update(
    id: string,
    updateTemplateDto: UpdateTemplateDto,
    userId?: string,
  ): Promise<Template> {
    const template = await this.findOne(id);

    if (template.isBuiltin) {
      throw new ForbiddenException("Cannot modify builtin templates");
    }

    if (template.userId && template.userId !== userId) {
      throw new ForbiddenException("Cannot modify another user's template");
    }

    if (updateTemplateDto.name !== undefined) {
      template.name = updateTemplateDto.name;
    }
    if (updateTemplateDto.description !== undefined) {
      template.description = updateTemplateDto.description;
    }
    if (updateTemplateDto.content !== undefined) {
      template.content = updateTemplateDto.content;
    }
    if (updateTemplateDto.category !== undefined) {
      template.category = updateTemplateDto.category;
    }

    return this.templatesRepository.save(template);
  }

  /**
   * Delete a template (only non-builtin)
   */
  async remove(id: string, userId?: string): Promise<void> {
    const template = await this.findOne(id);

    if (template.isBuiltin) {
      throw new ForbiddenException("Cannot delete builtin templates");
    }

    if (template.userId && template.userId !== userId) {
      throw new ForbiddenException("Cannot delete another user's template");
    }

    await this.templatesRepository.remove(template);
  }

  /**
   * Apply template to create a new note
   * Clones template content with new block IDs
   */
  async applyTemplate(
    templateId: string,
    title: string,
    userId?: string,
  ): Promise<Note> {
    const template = await this.findOne(templateId);

    // Clone content with new block IDs
    const clonedContent = {
      blocks: template.content.blocks.map((block) => ({
        ...block,
        id: uuidv4(),
      })),
    };

    const note = this.notesRepository.create({
      title,
      content: clonedContent,
      userId: userId,
    });

    return this.notesRepository.save(note);
  }

  /**
   * Seed builtin templates (called at app startup)
   */
  async seedBuiltinTemplates(): Promise<void> {
    const existingBuiltins = await this.templatesRepository.count({
      where: { isBuiltin: true },
    });
    if (existingBuiltins > 0) {
      return; // Already seeded
    }

    const builtinTemplates = [
      {
        name: "Meeting Notes",
        description: "Template for meeting notes with agenda and action items",
        category: "Work",
        content: {
          blocks: [
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 0,
              data: { text: "Meeting Notes", level: 1 },
            },
            {
              id: uuidv4(),
              type: "text" as const,
              order: 1,
              data: { text: "**Date:** " },
            },
            {
              id: uuidv4(),
              type: "text" as const,
              order: 2,
              data: { text: "**Attendees:** " },
            },
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 3,
              data: { text: "Agenda", level: 2 },
            },
            {
              id: uuidv4(),
              type: "checkbox" as const,
              order: 4,
              data: { text: "Item 1", checked: false },
            },
            {
              id: uuidv4(),
              type: "checkbox" as const,
              order: 5,
              data: { text: "Item 2", checked: false },
            },
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 6,
              data: { text: "Action Items", level: 2 },
            },
            {
              id: uuidv4(),
              type: "checkbox" as const,
              order: 7,
              data: { text: "Action 1", checked: false },
            },
          ],
        },
      },
      {
        name: "Daily Journal",
        description: "Daily reflection and gratitude journal",
        category: "Personal",
        content: {
          blocks: [
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 0,
              data: { text: "Daily Journal", level: 1 },
            },
            {
              id: uuidv4(),
              type: "text" as const,
              order: 1,
              data: { text: "**Date:** " },
            },
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 2,
              data: { text: "🙏 Gratitude", level: 2 },
            },
            {
              id: uuidv4(),
              type: "text" as const,
              order: 3,
              data: { text: "Today I'm grateful for..." },
            },
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 4,
              data: { text: "✅ Today's Goals", level: 2 },
            },
            {
              id: uuidv4(),
              type: "checkbox" as const,
              order: 5,
              data: { text: "Goal 1", checked: false },
            },
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 6,
              data: { text: "💭 Reflections", level: 2 },
            },
            {
              id: uuidv4(),
              type: "text" as const,
              order: 7,
              data: { text: "What I learned today..." },
            },
          ],
        },
      },
      {
        name: "Project Plan",
        description: "Project planning template with objectives and milestones",
        category: "Work",
        content: {
          blocks: [
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 0,
              data: { text: "Project Plan", level: 1 },
            },
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 1,
              data: { text: "📋 Overview", level: 2 },
            },
            {
              id: uuidv4(),
              type: "text" as const,
              order: 2,
              data: { text: "**Project Name:** " },
            },
            {
              id: uuidv4(),
              type: "text" as const,
              order: 3,
              data: { text: "**Objective:** " },
            },
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 4,
              data: { text: "🎯 Milestones", level: 2 },
            },
            {
              id: uuidv4(),
              type: "checkbox" as const,
              order: 5,
              data: { text: "Milestone 1", checked: false },
            },
            {
              id: uuidv4(),
              type: "checkbox" as const,
              order: 6,
              data: { text: "Milestone 2", checked: false },
            },
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 7,
              data: { text: "📝 Tasks", level: 2 },
            },
            {
              id: uuidv4(),
              type: "checkbox" as const,
              order: 8,
              data: { text: "Task 1", checked: false },
            },
          ],
        },
      },
      {
        name: "Todo List",
        description: "Simple todo list with categories",
        category: "Personal",
        content: {
          blocks: [
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 0,
              data: { text: "Todo List", level: 1 },
            },
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 1,
              data: { text: "🔴 High Priority", level: 2 },
            },
            {
              id: uuidv4(),
              type: "checkbox" as const,
              order: 2,
              data: { text: "Important task", checked: false },
            },
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 3,
              data: { text: "🟡 Medium Priority", level: 2 },
            },
            {
              id: uuidv4(),
              type: "checkbox" as const,
              order: 4,
              data: { text: "Normal task", checked: false },
            },
            {
              id: uuidv4(),
              type: "heading" as const,
              order: 5,
              data: { text: "🟢 Low Priority", level: 2 },
            },
            {
              id: uuidv4(),
              type: "checkbox" as const,
              order: 6,
              data: { text: "Optional task", checked: false },
            },
          ],
        },
      },
    ];

    for (const templateData of builtinTemplates) {
      const template = this.templatesRepository.create({
        ...templateData,
        isBuiltin: true,
        userId: null,
      });
      await this.templatesRepository.save(template);
    }
  }
}
