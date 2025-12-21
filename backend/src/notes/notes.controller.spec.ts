import { Test, TestingModule } from "@nestjs/testing";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";
import { CreateNoteDto } from "./dto/create-note.dto";
import { UpdateNoteDto } from "./dto/update-note.dto";
import { ReorderBlockDto } from "./dto/reorder-block.dto";

/**
 * Notes Controller Unit Tests
 * Tests all CRUD endpoints and response formatting
 * Sprint 10: Quality Gates - Test Coverage
 */
describe("NotesController", () => {
  let controller: NotesController;
  let service: NotesService;

  // Mock note data
  const mockNote = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Test Note",
    content: {
      blocks: [
        {
          id: "block-1",
          type: "text" as const,
          order: 0,
          data: { text: "Hello World" },
        },
      ],
    },
    iconEmoji: "📝",
    coverType: "gradient" as const,
    coverValue: "blue",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  // Mock NotesService
  const mockNotesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
    reorderBlock: jest.fn(),
    getBacklinks: jest.fn(),
    getOutlinks: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
    service = module.get<NotesService>(NotesService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  // ============================================
  // CREATE Tests
  // ============================================
  describe("create", () => {
    it("should create a new note and return formatted response", async () => {
      const createDto: CreateNoteDto = {
        title: "New Note",
        content: { blocks: [] },
      };
      const mockReq = { user: { id: "user-123" } };

      mockNotesService.create.mockResolvedValue(mockNote);

      const result = await controller.create(mockReq, createDto);

      expect(service.create).toHaveBeenCalledWith(createDto, "user-123");
      expect(result).toEqual({
        id: mockNote.id,
        title: mockNote.title,
        content: mockNote.content,
        iconEmoji: mockNote.iconEmoji,
        coverType: mockNote.coverType,
        coverValue: mockNote.coverValue,
        createdAt: mockNote.createdAt.toISOString(),
        updatedAt: mockNote.updatedAt.toISOString(),
      });
    });

    it("should handle note with icon and cover", async () => {
      const createDto: CreateNoteDto = {
        title: "Note with Identity",
        content: { blocks: [] },
        iconEmoji: "🎨",
        coverType: "color",
        coverValue: "#FF5733",
      };
      const mockReq = { user: { id: "user-123" } };

      const noteWithIdentity = {
        ...mockNote,
        ...createDto,
      };

      mockNotesService.create.mockResolvedValue(noteWithIdentity);

      const result = await controller.create(mockReq, createDto);

      expect(result.iconEmoji).toBe("🎨");
      expect(result.coverType).toBe("color");
      expect(result.coverValue).toBe("#FF5733");
    });

    it("should format dates to ISO strings", async () => {
      const mockReq = { user: { id: "user-123" } };
      mockNotesService.create.mockResolvedValue(mockNote);

      const result = await controller.create(mockReq, {
        title: "Test",
        content: { blocks: [] },
      });

      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
      expect(result.createdAt).toBe("2024-01-01T00:00:00.000Z");
    });
  });

  // ============================================
  // FIND ALL Tests
  // ============================================
  describe("findAll", () => {
    it("should return array of notes with formatted response", async () => {
      const notes = [
        mockNote,
        { ...mockNote, id: "another-id", title: "Another Note" },
      ];

      mockNotesService.findAll.mockResolvedValue(notes);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result.notes).toHaveLength(2);
      expect(result.notes[0]).toEqual({
        id: mockNote.id,
        title: mockNote.title,
        blockCount: 1,
        iconEmoji: mockNote.iconEmoji,
        createdAt: mockNote.createdAt.toISOString(),
        updatedAt: mockNote.updatedAt.toISOString(),
      });
    });

    it("should calculate blockCount correctly", async () => {
      const noteWithManyBlocks = {
        ...mockNote,
        content: {
          blocks: [
            { id: "1", type: "text" as const, order: 0, data: {} },
            { id: "2", type: "heading" as const, order: 1, data: {} },
            { id: "3", type: "text" as const, order: 2, data: {} },
          ],
        },
      };

      mockNotesService.findAll.mockResolvedValue([noteWithManyBlocks]);

      const result = await controller.findAll();

      expect(result.notes[0].blockCount).toBe(3);
    });

    it("should handle notes with no blocks", async () => {
      const noteWithoutBlocks = {
        ...mockNote,
        content: { blocks: [] },
      };

      mockNotesService.findAll.mockResolvedValue([noteWithoutBlocks]);

      const result = await controller.findAll();

      expect(result.notes[0].blockCount).toBe(0);
    });

    it("should return empty array when no notes exist", async () => {
      mockNotesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result.notes).toEqual([]);
      expect(result.notes).toHaveLength(0);
    });
  });

  // ============================================
  // SEARCH Tests
  // ============================================
  describe("search", () => {
    it("should search notes with query", async () => {
      const searchResults = [mockNote];
      mockNotesService.search.mockResolvedValue(searchResults);

      const result = await controller.search("test", undefined);

      expect(service.search).toHaveBeenCalledWith("test", 10);
      expect(result).toEqual({
        query: "test",
        results: searchResults,
        totalCount: 1,
      });
    });

    it("should respect custom limit parameter", async () => {
      mockNotesService.search.mockResolvedValue([]);

      await controller.search("query", "25");

      expect(service.search).toHaveBeenCalledWith("query", 25);
    });

    it("should enforce maximum limit of 50", async () => {
      mockNotesService.search.mockResolvedValue([]);

      await controller.search("query", "100");

      expect(service.search).toHaveBeenCalledWith("query", 50);
    });

    it("should default to limit 10 when not specified", async () => {
      mockNotesService.search.mockResolvedValue([]);

      await controller.search("query", undefined);

      expect(service.search).toHaveBeenCalledWith("query", 10);
    });

    it("should handle empty query string", async () => {
      mockNotesService.search.mockResolvedValue([]);

      const result = await controller.search("", undefined);

      expect(service.search).toHaveBeenCalledWith("", 10);
      expect(result.query).toBe("");
    });

    it("should return empty results for no matches", async () => {
      mockNotesService.search.mockResolvedValue([]);

      const result = await controller.search("nonexistent", undefined);

      expect(result.results).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });

  // ============================================
  // FIND ONE Tests
  // ============================================
  describe("findOne", () => {
    it("should return a single note by id", async () => {
      mockNotesService.findOne.mockResolvedValue(mockNote);

      const result = await controller.findOne(mockNote.id);

      expect(service.findOne).toHaveBeenCalledWith(mockNote.id);
      expect(result).toEqual({
        id: mockNote.id,
        title: mockNote.title,
        content: mockNote.content,
        iconEmoji: mockNote.iconEmoji,
        coverType: mockNote.coverType,
        coverValue: mockNote.coverValue,
        createdAt: mockNote.createdAt.toISOString(),
        updatedAt: mockNote.updatedAt.toISOString(),
      });
    });

    it("should include full content in response", async () => {
      mockNotesService.findOne.mockResolvedValue(mockNote);

      const result = await controller.findOne(mockNote.id);

      expect(result.content).toEqual(mockNote.content);
      expect(result.content.blocks).toBeDefined();
    });
  });

  // ============================================
  // UPDATE Tests
  // ============================================
  describe("update", () => {
    it("should update a note", async () => {
      const updateDto: UpdateNoteDto = {
        title: "Updated Title",
      };
      const updatedNote = { ...mockNote, title: "Updated Title" };

      mockNotesService.update.mockResolvedValue(updatedNote);

      const result = await controller.update(mockNote.id, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockNote.id, updateDto);
      expect(result.title).toBe("Updated Title");
    });

    it("should update note content", async () => {
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
      const updateDto: UpdateNoteDto = {
        content: newContent,
      };
      const updatedNote = { ...mockNote, content: newContent };

      mockNotesService.update.mockResolvedValue(updatedNote);

      const result = await controller.update(mockNote.id, updateDto);

      expect(result.content).toEqual(newContent);
    });

    it("should update icon and cover", async () => {
      const updateDto: UpdateNoteDto = {
        iconEmoji: "🎯",
        coverType: "image",
        coverValue: "https://example.com/cover.jpg",
      };
      const updatedNote = { ...mockNote, ...updateDto };

      mockNotesService.update.mockResolvedValue(updatedNote);

      const result = await controller.update(mockNote.id, updateDto);

      expect(result.iconEmoji).toBe("🎯");
      expect(result.coverType).toBe("image");
      expect(result.coverValue).toBe("https://example.com/cover.jpg");
    });

    it("should return formatted response with ISO dates", async () => {
      mockNotesService.update.mockResolvedValue(mockNote);

      const result = await controller.update(mockNote.id, { title: "Test" });

      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
    });
  });

  // ============================================
  // REORDER BLOCK Tests
  // ============================================
  describe("reorderBlock", () => {
    it("should reorder a block within note", async () => {
      const reorderDto: ReorderBlockDto = {
        blockId: "block-1",
        newOrder: 2,
      };

      mockNotesService.reorderBlock.mockResolvedValue(mockNote);

      const result = await controller.reorderBlock(mockNote.id, reorderDto);

      expect(service.reorderBlock).toHaveBeenCalledWith(
        mockNote.id,
        "block-1",
        2,
      );
      expect(result.id).toBe(mockNote.id);
      expect(result.content).toEqual(mockNote.content);
    });

    it("should return updated note content after reorder", async () => {
      const reorderDto: ReorderBlockDto = {
        blockId: "block-1",
        newOrder: 0,
      };

      mockNotesService.reorderBlock.mockResolvedValue(mockNote);

      const result = await controller.reorderBlock(mockNote.id, reorderDto);

      expect(result.content).toBeDefined();
      expect(result.title).toBe(mockNote.title);
    });
  });

  // ============================================
  // BACKLINKS Tests
  // ============================================
  describe("getBacklinks", () => {
    it("should return notes that link to this note", async () => {
      const backlinkNotes = [
        {
          id: "linking-note-1",
          title: "Note that links here",
          updatedAt: new Date("2024-01-02T00:00:00.000Z"),
        },
        {
          id: "linking-note-2",
          title: "Another linking note",
          updatedAt: new Date("2024-01-03T00:00:00.000Z"),
        },
      ];

      mockNotesService.getBacklinks.mockResolvedValue(backlinkNotes);

      const result = await controller.getBacklinks(mockNote.id);

      expect(service.getBacklinks).toHaveBeenCalledWith(mockNote.id);
      expect(result.noteId).toBe(mockNote.id);
      expect(result.backlinks).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.backlinks[0]).toEqual({
        id: "linking-note-1",
        title: "Note that links here",
        updatedAt: "2024-01-02T00:00:00.000Z",
      });
    });

    it("should return empty array when no backlinks exist", async () => {
      mockNotesService.getBacklinks.mockResolvedValue([]);

      const result = await controller.getBacklinks(mockNote.id);

      expect(result.backlinks).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  // ============================================
  // OUTLINKS Tests
  // ============================================
  describe("getOutlinks", () => {
    it("should return notes that this note links to", async () => {
      const outlinkNotes = [
        {
          id: "linked-note-1",
          title: "Linked Note 1",
          updatedAt: new Date("2024-01-02T00:00:00.000Z"),
        },
      ];

      mockNotesService.getOutlinks.mockResolvedValue(outlinkNotes);

      const result = await controller.getOutlinks(mockNote.id);

      expect(service.getOutlinks).toHaveBeenCalledWith(mockNote.id);
      expect(result.noteId).toBe(mockNote.id);
      expect(result.outlinks).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(result.outlinks[0].id).toBe("linked-note-1");
    });

    it("should format dates to ISO strings", async () => {
      const outlinkNotes = [
        {
          id: "linked-note",
          title: "Linked Note",
          updatedAt: new Date("2024-01-02T00:00:00.000Z"),
        },
      ];

      mockNotesService.getOutlinks.mockResolvedValue(outlinkNotes);

      const result = await controller.getOutlinks(mockNote.id);

      expect(result.outlinks[0].updatedAt).toBe("2024-01-02T00:00:00.000Z");
    });

    it("should return empty array when no outlinks exist", async () => {
      mockNotesService.getOutlinks.mockResolvedValue([]);

      const result = await controller.getOutlinks(mockNote.id);

      expect(result.outlinks).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  // ============================================
  // REMOVE Tests
  // ============================================
  describe("remove", () => {
    it("should delete a note", async () => {
      mockNotesService.remove.mockResolvedValue(undefined);

      await controller.remove(mockNote.id);

      expect(service.remove).toHaveBeenCalledWith(mockNote.id);
    });

    it("should not return any value (204 No Content)", async () => {
      mockNotesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockNote.id);

      expect(result).toBeUndefined();
    });
  });
});
