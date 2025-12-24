import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Brackets, WhereExpressionBuilder } from "typeorm";
import { Note } from "./entities/note.entity";
import { NoteLink } from "./entities/note-link.entity";
import { CreateNoteDto } from "./dto/create-note.dto";
import { UpdateNoteDto } from "./dto/update-note.dto";
import { SearchResultDto } from "./dto/search-result.dto";
import { extractLinksFromBlocks } from "./utils/link-parser";

/**
 * Notes Service
 * Business logic katmanı - @Dev tarafından implemente edildi
 * Sprint 1: Search functionality eklendi
 * Sprint 2: Bi-directional Linking eklendi
 */
@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private readonly notesRepository: Repository<Note>,
    @InjectRepository(NoteLink)
    private readonly noteLinkRepository: Repository<NoteLink>,
  ) { }

  private readonly logger = new Logger(NotesService.name);

  /**
   * Sprint 8: Pragmatic Schema Patch (Migration Strategy A)
   * App launch sırasında tabloyu control et, eksik kolon varsa ekle.
   */
  async onModuleInit() {
    try {
      if (process.env.NODE_ENV === 'test') return;
      this.logger.log("Checking Note schema for Identity fields...");
      const runner =
        this.notesRepository.manager.connection.createQueryRunner();

      // Check icon_emoji
      const hasIcon = await runner.hasColumn("note", "icon_emoji");
      if (!hasIcon) {
        this.logger.log("Migrating: Adding icon_emoji column");
        await runner.query(`ALTER TABLE note ADD COLUMN icon_emoji TEXT`);
      }

      // Check cover_type
      const hasCoverType = await runner.hasColumn("note", "cover_type");
      if (!hasCoverType) {
        this.logger.log("Migrating: Adding cover_type column");
        await runner.query(
          `ALTER TABLE note ADD COLUMN cover_type TEXT DEFAULT 'none'`,
        );
      }

      // Check cover_value
      const hasCoverValue = await runner.hasColumn("note", "cover_value");
      if (!hasCoverValue) {
        this.logger.log("Migrating: Adding cover_value column");
        await runner.query(`ALTER TABLE note ADD COLUMN cover_value TEXT`);
      }

      // Check is_favorite (Sprint 12)
      const hasFavorite = await runner.hasColumn("note", "is_favorite");
      if (!hasFavorite) {
        this.logger.log("Migrating: Adding is_favorite column");
        await runner.query(
          `ALTER TABLE note ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE`,
        );
      }

      this.logger.log("Schema check complete.");
    } catch (err) {
      this.logger.error("Schema Migration Error:", err);
    }
  }

  /**
   * Yeni not oluştur
   * @param createNoteDto - Zod ile validate edilmiş DTO
   * @param userId - Authenticated user ID from JWT
   * @returns Oluşturulan not
   */
  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    const note = this.notesRepository.create({
      title: createNoteDto.title,
      content: createNoteDto.content,
      userId: userId,
    });
    return this.notesRepository.save(note);
  }

  /**
   * Tüm notları listele
   * @returns Not listesi (özet bilgilerle)
   */
  async findAll(userId: string): Promise<Note[]> {
    return this.notesRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  /**
   * ID ile not getir
   * @param id - Not UUID'si
   * @returns Tam not içeriği (JSONB dahil)
   */
  async findOne(id: string, userId?: string): Promise<Note> {
    const whereCondition: any = { id };
    if (userId) {
      whereCondition.userId = userId;
    }
    const note = await this.notesRepository.findOne({ where: whereCondition });
    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found`);
    }
    return note;
  }

  /**
   * Not güncelle
   * @param id - Not UUID'si
   * @param updateNoteDto - Güncellenecek alanlar
   * @returns Güncellenmiş not
   */
  async update(id: string, updateNoteDto: UpdateNoteDto, userId?: string): Promise<Note> {
    const note = await this.findOne(id, userId);

    if (updateNoteDto.title !== undefined) {
      note.title = updateNoteDto.title;
    }
    if (updateNoteDto.content !== undefined) {
      note.content = updateNoteDto.content;
    }
    if (updateNoteDto.iconEmoji !== undefined) {
      note.iconEmoji = updateNoteDto.iconEmoji;
    }
    if (updateNoteDto.coverType !== undefined) {
      note.coverType = updateNoteDto.coverType;
    }
    if (updateNoteDto.coverValue !== undefined) {
      note.coverValue = updateNoteDto.coverValue;
    }

    return this.notesRepository.save(note);
  }

  /**
   * Not sil
   * @param id - Not UUID'si
   */
  async remove(id: string, userId?: string): Promise<void> {
    const note = await this.findOne(id, userId);
    await this.notesRepository.remove(note);
  }

  /**
   * Full-text search with fuzzy matching
   * Sprint 1 - Command Palette için optimize edildi
   * @param query - Arama sorgusu (min 2 karakter)
   * @param limit - Sonuç limiti (default: 10)
   * @returns Skorlanmış arama sonuçları
   */
  async search(query: string, userId: string, limit = 10): Promise<SearchResultDto[]> {
    const sanitizedQuery = query.trim().toLowerCase();

    if (sanitizedQuery.length < 2) {
      return [];
    }

    // Find notes matching title or content
    const notes = await this.notesRepository
      .createQueryBuilder("note")
      .where("note.userId = :userId", { userId })
      .andWhere(new Brackets((qb: WhereExpressionBuilder) => {
        qb.where("LOWER(note.title) LIKE :query", { query: `%${sanitizedQuery}%` })
          .orWhere("note.content::text ILIKE :query", {
            query: `%${sanitizedQuery}%`,
          });
      }))
      .orderBy("note.updatedAt", "DESC")
      .limit(limit)
      .getMany();

    return notes.map((note) => {
      const titleMatch = note.title.toLowerCase().includes(sanitizedQuery);
      const contentText = this.extractTextFromBlocks(note.content);
      const contentMatch = contentText.toLowerCase().includes(sanitizedQuery);

      // Title matches get 2x score weight
      const titleScore = titleMatch ? 0.8 : 0;
      const contentScore = contentMatch ? 0.4 : 0;
      const score = Math.min(1, titleScore + contentScore);

      return {
        id: note.id,
        title: note.title,
        snippet: this.extractSnippet(contentText, sanitizedQuery),
        matchType: titleMatch ? ("title" as const) : ("content" as const),
        score,
        updatedAt: note.updatedAt.toISOString(),
      };
    });
  }

  /**
   * Extract all text from block content
   */
  private extractTextFromBlocks(content: Note["content"]): string {
    if (!content?.blocks) return "";

    return content.blocks
      .map((block) => {
        const data = block.data as Record<string, unknown>;
        if (block.type === "code") {
          return (data.code as string) || "";
        }
        return (data.text as string) || "";
      })
      .filter(Boolean)
      .join(" ");
  }

  /**
   * Extract snippet around matched text (±50 chars)
   */
  private extractSnippet(fullText: string, query: string): string {
    if (!fullText) return "";

    const index = fullText.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) {
      return fullText.substring(0, 100) + (fullText.length > 100 ? "..." : "");
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(fullText.length, index + query.length + 50);

    return (
      (start > 0 ? "..." : "") +
      fullText.substring(start, end) +
      (end < fullText.length ? "..." : "")
    );
  }

  /**
   * Reorder a block within a note
   * Sprint 2 - Drag & Drop Block Management
   * @param noteId - Note UUID
   * @param blockId - Block UUID
   * @param newOrder - New order value (fractional indexing)
   */
  async reorderBlock(
    noteId: string,
    blockId: string,
    newOrder: number,
    userId?: string
  ): Promise<Note> {
    const note = await this.findOne(noteId, userId);

    if (!note.content?.blocks) {
      throw new NotFoundException("Note has no blocks");
    }

    const blockIndex = note.content.blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) {
      throw new NotFoundException(
        `Block with ID "${blockId}" not found in note`,
      );
    }

    // Update the block's order
    note.content.blocks[blockIndex].order = newOrder;

    // Sort blocks by order
    note.content.blocks.sort((a, b) => a.order - b.order);

    return this.notesRepository.save(note);
  }

  // ============================================
  // Bi-directional Linking Methods (Sprint 2)
  // ============================================

  /**
   * Get notes that link TO this note (backlinks)
   * @param noteId - Target note UUID
   */
  async getBacklinks(noteId: string, userId?: string): Promise<Note[]> {
    const note = await this.findOne(noteId, userId); // Ensure user has access
    const links = await this.noteLinkRepository.find({
      where: { targetNoteId: note.id }, // Use verified ID
      relations: ["sourceNote"],
    });

    return links.map((link) => link.sourceNote);
  }

  /**
   * Get notes that this note links TO (outlinks)
   * @param noteId - Source note UUID
   */
  async getOutlinks(noteId: string, userId?: string): Promise<Note[]> {
    const note = await this.findOne(noteId, userId); // Ensure user has access
    const links = await this.noteLinkRepository.find({
      where: { sourceNoteId: note.id },
      relations: ["targetNote"],
    });

    return links.map((link) => link.targetNote);
  }

  /**
   * Sync links for a note based on its content
   * Called after note update to maintain link consistency
   */
  async syncLinks(noteId: string): Promise<void> {
    const note = await this.findOne(noteId);

    if (!note.content?.blocks) {
      await this.noteLinkRepository.delete({ sourceNoteId: noteId });
      return;
    }

    const linkedTitles = extractLinksFromBlocks(note.content.blocks);
    await this.noteLinkRepository.delete({ sourceNoteId: noteId });

    for (const title of linkedTitles) {
      const targetNote = await this.notesRepository.findOne({
        where: { title },
      });

      if (targetNote && targetNote.id !== noteId) {
        const link = this.noteLinkRepository.create({
          sourceNoteId: noteId,
          targetNoteId: targetNote.id,
          linkText: title,
        });
        await this.noteLinkRepository.save(link);
      }
    }
  }

  /**
   * Find note by title (for link resolution)
   */
  async findByTitle(title: string): Promise<Note | null> {
    return this.notesRepository.findOne({ where: { title } });
  }

  // ============================================
  // Favorites & Recent Methods (Sprint 12)
  // ============================================

  /**
   * Toggle favorite status for a note
   * @param id - Note UUID
   * @returns Updated note
   */
  async toggleFavorite(id: string, userId?: string): Promise<Note> {
    const note = await this.findOne(id, userId);
    note.isFavorite = !note.isFavorite;
    return this.notesRepository.save(note);
  }

  /**
   * Get all favorite notes
   * @returns Favorite notes ordered by updatedAt
   */
  async getFavorites(userId?: string): Promise<Note[]> {
    const whereCondition: any = { isFavorite: true };
    if (userId) {
      whereCondition.userId = userId;
    }
    return this.notesRepository.find({
      where: whereCondition,
      order: { updatedAt: "DESC" },
      take: 10,
    });
  }

  /**
   * Get recent notes
   * @param limit - Number of recent notes to fetch (default: 5)
   * @returns Recent notes ordered by updatedAt
   */
  async getRecent(userId?: string, limit = 5): Promise<Note[]> { // Fix arg order to match usage
    const whereCondition: any = {};
    if (userId) {
      whereCondition.userId = userId;
    }
    return this.notesRepository.find({
      where: whereCondition,
      order: { updatedAt: "DESC" },
      take: limit,
    });
  }
}
