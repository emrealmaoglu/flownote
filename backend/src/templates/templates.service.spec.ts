import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { TemplatesService } from "./templates.service";
import { Template } from "./entities/template.entity";
import { Note } from "../notes/entities/note.entity";
import { CreateTemplateDto, UpdateTemplateDto } from "./dto/template.schemas";

/**
 * Templates Service Unit Tests
 * Tests template CRUD, builtin templates, and template application
 * Sprint 10: Quality Gates - Test Coverage
 */
describe("TemplatesService", () => {
  let service: TemplatesService;

  const mockTemplateRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  const mockNoteRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  // Mock builtin templates
  const mockBuiltinTemplate: Partial<Template> = {
    id: "builtin-meeting",
    name: "Meeting Notes",
    description: "Template for meeting notes",
    category: "Work",
    isBuiltin: true,
    userId: null,
    content: {
      blocks: [
        {
          id: "block-1",
          type: "heading" as const,
          order: 0,
          data: { text: "Meeting Notes", level: 1 },
        },
        {
          id: "block-2",
          type: "text" as const,
          order: 1,
          data: { text: "Date: " },
        },
      ],
    },
  };

  const mockUserTemplate: Partial<Template> = {
    id: "user-custom",
    name: "My Custom Template",
    description: "My custom template",
    category: "Personal",
    isBuiltin: false,
    userId: "user-123",
    content: {
      blocks: [
        {
          id: "block-3",
          type: "text" as const,
          order: 0,
          data: { text: "Custom content" },
        },
      ],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        {
          provide: getRepositoryToken(Template),
          useValue: mockTemplateRepository,
        },
        {
          provide: getRepositoryToken(Note),
          useValue: mockNoteRepository,
        },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // CREATE Tests
  // ============================================
  describe("create", () => {
    const createDto: CreateTemplateDto = {
      name: "New Template",
      description: "A new template",
      content: {
        blocks: [
          {
            id: "new-block",
            type: "text" as const,
            order: 0,
            data: { text: "Hello" },
          },
        ],
      },
      category: "Work",
    };

    it("should create a new template", async () => {
      const createdTemplate = {
        id: "new-template-id",
        ...createDto,
        isBuiltin: false,
        userId: null,
      };

      mockTemplateRepository.create.mockReturnValue(createdTemplate);
      mockTemplateRepository.save.mockResolvedValue(createdTemplate);

      const result = await service.create(createDto);

      expect(mockTemplateRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        description: createDto.description,
        content: createDto.content,
        category: createDto.category,
        isBuiltin: false,
        userId: null,
      });
      expect(mockTemplateRepository.save).toHaveBeenCalled();
      expect(result).toEqual(createdTemplate);
    });

    it("should create template with userId when provided", async () => {
      const userId = "user-456";
      const createdTemplate = {
        ...createDto,
        isBuiltin: false,
        userId,
      };

      mockTemplateRepository.create.mockReturnValue(createdTemplate);
      mockTemplateRepository.save.mockResolvedValue(createdTemplate);

      await service.create(createDto, userId);

      expect(mockTemplateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          isBuiltin: false,
        }),
      );
    });

    it("should set isBuiltin to false for user templates", async () => {
      mockTemplateRepository.create.mockReturnValue({});
      mockTemplateRepository.save.mockResolvedValue({});

      await service.create(createDto);

      expect(mockTemplateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isBuiltin: false,
        }),
      );
    });

    it("should handle null description", async () => {
      const dtoWithoutDesc = { ...createDto, description: undefined };

      mockTemplateRepository.create.mockReturnValue({});
      mockTemplateRepository.save.mockResolvedValue({});

      await service.create(dtoWithoutDesc);

      expect(mockTemplateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: null,
        }),
      );
    });

    it("should handle null category", async () => {
      const dtoWithoutCategory = { ...createDto, category: undefined };

      mockTemplateRepository.create.mockReturnValue({});
      mockTemplateRepository.save.mockResolvedValue({});

      await service.create(dtoWithoutCategory);

      expect(mockTemplateRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: null,
        }),
      );
    });
  });

  // ============================================
  // FIND ALL Tests
  // ============================================
  describe("findAll", () => {
    it("should return all builtin templates and user templates", async () => {
      const templates = [mockBuiltinTemplate, mockUserTemplate];
      mockTemplateRepository.find.mockResolvedValue(templates);

      const result = await service.findAll("user-123");

      expect(mockTemplateRepository.find).toHaveBeenCalledWith({
        where: [{ isBuiltin: true }, { userId: "user-123" }],
        order: { isBuiltin: "DESC", name: "ASC" },
      });
      expect(result).toEqual(templates);
    });

    it("should return only builtin templates when no userId provided", async () => {
      mockTemplateRepository.find.mockResolvedValue([mockBuiltinTemplate]);

      const result = await service.findAll();

      expect(mockTemplateRepository.find).toHaveBeenCalledWith({
        where: [{ isBuiltin: true }, { userId: undefined }],
        order: { isBuiltin: "DESC", name: "ASC" },
      });
      expect(result).toEqual([mockBuiltinTemplate]);
    });

    it("should return empty array when no templates exist", async () => {
      mockTemplateRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it("should order by isBuiltin DESC then name ASC", async () => {
      mockTemplateRepository.find.mockResolvedValue([]);

      await service.findAll("user-123");

      expect(mockTemplateRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { isBuiltin: "DESC", name: "ASC" },
        }),
      );
    });
  });

  // ============================================
  // FIND ONE Tests
  // ============================================
  describe("findOne", () => {
    it("should return a template by id", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(mockBuiltinTemplate);

      const result = await service.findOne("builtin-meeting");

      expect(mockTemplateRepository.findOne).toHaveBeenCalledWith({
        where: { id: "builtin-meeting" },
      });
      expect(result).toEqual(mockBuiltinTemplate);
    });

    it("should throw NotFoundException if template not found", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne("nonexistent")).rejects.toThrow(
        'Template with ID "nonexistent" not found',
      );
    });
  });

  // ============================================
  // UPDATE Tests
  // ============================================
  describe("update", () => {
    const updateDto: UpdateTemplateDto = {
      name: "Updated Name",
      description: "Updated description",
    };

    it("should update a user template", async () => {
      const updatedTemplate = { ...mockUserTemplate, ...updateDto };

      mockTemplateRepository.findOne.mockResolvedValue(mockUserTemplate);
      mockTemplateRepository.save.mockResolvedValue(updatedTemplate);

      const result = await service.update(
        "user-custom",
        updateDto,
        "user-123",
      );

      expect(result.name).toBe(updateDto.name);
      expect(result.description).toBe(updateDto.description);
    });

    it("should throw ForbiddenException when updating builtin template", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(mockBuiltinTemplate);

      await expect(
        service.update("builtin-meeting", updateDto),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update("builtin-meeting", updateDto),
      ).rejects.toThrow("Cannot modify builtin templates");
    });

    it("should throw ForbiddenException when updating another user's template", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(mockUserTemplate);

      await expect(
        service.update("user-custom", updateDto, "different-user"),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update("user-custom", updateDto, "different-user"),
      ).rejects.toThrow("Cannot modify another user's template");
    });

    it("should allow updating template without userId (public templates)", async () => {
      const publicTemplate = { ...mockUserTemplate, userId: null };

      mockTemplateRepository.findOne.mockResolvedValue(publicTemplate);
      mockTemplateRepository.save.mockResolvedValue({
        ...publicTemplate,
        ...updateDto,
      });

      const result = await service.update("user-custom", updateDto);

      expect(result.name).toBe(updateDto.name);
    });

    it("should update individual fields", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(mockUserTemplate);
      mockTemplateRepository.save.mockResolvedValue(mockUserTemplate);

      await service.update("user-custom", { name: "New Name" }, "user-123");

      expect(mockUserTemplate.name).toBe("New Name");
    });

    it("should update content field", async () => {
      const newContent = {
        blocks: [
          {
            id: "new-block",
            type: "heading" as const,
            order: 0,
            data: { text: "New Heading", level: 1 },
          },
        ],
      };

      mockTemplateRepository.findOne.mockResolvedValue(mockUserTemplate);
      mockTemplateRepository.save.mockResolvedValue({
        ...mockUserTemplate,
        content: newContent,
      });

      const result = await service.update(
        "user-custom",
        { content: newContent },
        "user-123",
      );

      expect(result.content).toEqual(newContent);
    });

    it("should throw NotFoundException if template not found", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update("nonexistent", updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================
  // REMOVE Tests
  // ============================================
  describe("remove", () => {
    it("should delete a user template", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(mockUserTemplate);
      mockTemplateRepository.remove.mockResolvedValue(mockUserTemplate);

      await service.remove("user-custom", "user-123");

      expect(mockTemplateRepository.remove).toHaveBeenCalledWith(
        mockUserTemplate,
      );
    });

    it("should throw ForbiddenException when deleting builtin template", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(mockBuiltinTemplate);

      await expect(service.remove("builtin-meeting")).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.remove("builtin-meeting")).rejects.toThrow(
        "Cannot delete builtin templates",
      );
    });

    it("should throw ForbiddenException when deleting another user's template", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(mockUserTemplate);

      await expect(
        service.remove("user-custom", "different-user"),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.remove("user-custom", "different-user"),
      ).rejects.toThrow("Cannot delete another user's template");
    });

    it("should throw NotFoundException if template not found", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(null);

      await expect(service.remove("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============================================
  // APPLY TEMPLATE Tests
  // ============================================
  describe("applyTemplate", () => {
    it("should create a note from template", async () => {
      const expectedNote = {
        id: "new-note-id",
        title: "My Meeting",
        content: {
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: "heading",
              data: { text: "Meeting Notes", level: 1 },
            }),
          ]),
        },
        userId: "user-123",
      };

      mockTemplateRepository.findOne.mockResolvedValue(mockBuiltinTemplate);
      mockNoteRepository.create.mockReturnValue(expectedNote);
      mockNoteRepository.save.mockResolvedValue(expectedNote);

      const result = await service.applyTemplate(
        "builtin-meeting",
        "My Meeting",
        "user-123",
      );

      expect(mockTemplateRepository.findOne).toHaveBeenCalledWith({
        where: { id: "builtin-meeting" },
      });
      expect(mockNoteRepository.create).toHaveBeenCalled();
      expect(mockNoteRepository.save).toHaveBeenCalled();
      expect(result.title).toBe("My Meeting");
    });

    it("should clone template content with new block IDs", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(mockBuiltinTemplate);
      mockNoteRepository.create.mockReturnValue({});
      mockNoteRepository.save.mockResolvedValue({});

      await service.applyTemplate("builtin-meeting", "Test", "user-123");

      const createCall = mockNoteRepository.create.mock.calls[0][0];
      const newBlocks = createCall.content.blocks;

      // Verify block IDs are different from original
      expect(newBlocks[0].id).not.toBe("block-1");
      expect(newBlocks[1].id).not.toBe("block-2");

      // Verify content data is preserved
      expect(newBlocks[0].type).toBe("heading");
      expect(newBlocks[0].data.text).toBe("Meeting Notes");
    });

    it("should preserve block order", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(mockBuiltinTemplate);
      mockNoteRepository.create.mockReturnValue({});
      mockNoteRepository.save.mockResolvedValue({});

      await service.applyTemplate("builtin-meeting", "Test");

      const createCall = mockNoteRepository.create.mock.calls[0][0];
      const blocks = createCall.content.blocks;

      expect(blocks[0].order).toBe(0);
      expect(blocks[1].order).toBe(1);
    });

    it("should throw NotFoundException if template not found", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(null);

      await expect(
        service.applyTemplate("nonexistent", "Test"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should handle template without userId", async () => {
      mockTemplateRepository.findOne.mockResolvedValue(mockBuiltinTemplate);
      mockNoteRepository.create.mockReturnValue({});
      mockNoteRepository.save.mockResolvedValue({ title: "Test" });

      const result = await service.applyTemplate("builtin-meeting", "Test");

      expect(result.title).toBe("Test");
    });
  });

  // ============================================
  // SEED BUILTIN TEMPLATES Tests
  // ============================================
  describe("seedBuiltinTemplates", () => {
    it("should seed builtin templates when none exist", async () => {
      mockTemplateRepository.count.mockResolvedValue(0);
      mockTemplateRepository.create.mockImplementation((data) => data);
      mockTemplateRepository.save.mockImplementation((template) =>
        Promise.resolve(template),
      );

      await service.seedBuiltinTemplates();

      expect(mockTemplateRepository.count).toHaveBeenCalledWith({
        where: { isBuiltin: true },
      });
      expect(mockTemplateRepository.save).toHaveBeenCalledTimes(4); // 4 builtin templates
    });

    it("should not seed if builtin templates already exist", async () => {
      mockTemplateRepository.count.mockResolvedValue(4);

      await service.seedBuiltinTemplates();

      expect(mockTemplateRepository.count).toHaveBeenCalled();
      expect(mockTemplateRepository.save).not.toHaveBeenCalled();
    });

    it("should create templates with isBuiltin true", async () => {
      mockTemplateRepository.count.mockResolvedValue(0);
      mockTemplateRepository.create.mockImplementation((data) => data);
      mockTemplateRepository.save.mockImplementation((template) =>
        Promise.resolve(template),
      );

      await service.seedBuiltinTemplates();

      const createdTemplates = mockTemplateRepository.create.mock.calls.map(
        (call) => call[0],
      );

      expect(createdTemplates.every((t) => t.isBuiltin === true)).toBe(true);
      expect(createdTemplates.every((t) => t.userId === null)).toBe(true);
    });

    it("should create all 4 default templates", async () => {
      mockTemplateRepository.count.mockResolvedValue(0);
      mockTemplateRepository.create.mockImplementation((data) => data);
      mockTemplateRepository.save.mockImplementation((template) =>
        Promise.resolve(template),
      );

      await service.seedBuiltinTemplates();

      const templateNames = mockTemplateRepository.create.mock.calls.map(
        (call) => call[0].name,
      );

      expect(templateNames).toContain("Meeting Notes");
      expect(templateNames).toContain("Daily Journal");
      expect(templateNames).toContain("Project Plan");
      expect(templateNames).toContain("Todo List");
    });
  });
});
