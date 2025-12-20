import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from "@nestjs/common";
import { NotesService } from "./notes.service";
import { CreateNoteDto } from "./dto/create-note.dto";
import { UpdateNoteDto } from "./dto/update-note.dto";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { CreateNoteSchema, UpdateNoteSchema } from "./dto/note.schemas";
import { ReorderBlockSchema, ReorderBlockDto } from "./dto/reorder-block.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

/**
 * Notes Controller
 * API endpoint'leri - @Dev tarafından implemente edildi
 * @SecOps - Tüm endpointler JWT ile korunuyor!
 *
 * Endpoints:
 * - POST   /api/notes         - Yeni not oluştur
 * - GET    /api/notes         - Tüm notları listele
 * - GET    /api/notes/search  - Not ara (Command Palette)
 * - GET    /api/notes/:id     - Tek not getir
 * - PUT    /api/notes/:id     - Not güncelle
 * - DELETE /api/notes/:id     - Not sil
 */
@Controller("notes")
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) { }

  /**
   * POST /notes - Yeni not oluştur
   * @SecOps - Zod validation zorunlu!
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: any,
    @Body(new ZodValidationPipe(CreateNoteSchema)) createNoteDto: CreateNoteDto,
  ) {
    const note = await this.notesService.create(createNoteDto, req.user.id);
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      iconEmoji: note.iconEmoji,
      coverType: note.coverType,
      coverValue: note.coverValue,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  /**
   * GET /notes - Tüm notları listele
   */
  @Get()
  async findAll() {
    const notes = await this.notesService.findAll();
    return {
      notes: notes.map((note) => ({
        id: note.id,
        title: note.title,
        blockCount: note.content?.blocks?.length || 0,
        iconEmoji: note.iconEmoji,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      })),
    };
  }

  /**
   * GET /notes/search - Full-text search
   * Sprint 1 - Command Palette için optimize edildi
   * @param q - Arama sorgusu (min 2 karakter)
   * @param limit - Sonuç limiti (default: 10, max: 50)
   */
  @Get("search")
  async search(@Query("q") query: string, @Query("limit") limit?: string) {
    const parsedLimit = Math.min(parseInt(limit || "10", 10) || 10, 50);
    const results = await this.notesService.search(query || "", parsedLimit);

    return {
      query: query || "",
      results,
      totalCount: results.length,
    };
  }

  /**
   * GET /notes/recent - Get recent notes
   * Sprint 12 - Recent notes for sidebar
   */
  @Get("recent")
  async getRecent(@Query("limit") limit?: string) {
    const parsedLimit = parseInt(limit || "5", 10);
    const notes = await this.notesService.getRecent(parsedLimit);
    return notes.map((note) => ({
      id: note.id,
      title: note.title,
      blockCount: note.content?.blocks?.length || 0,
      iconEmoji: note.iconEmoji,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    }));
  }

  /**
   * GET /notes/favorites - Get favorite notes
   * Sprint 12 - Favorites for sidebar
   */
  @Get("favorites")
  async getFavorites() {
    const notes = await this.notesService.getFavorites();
    return notes.map((note) => ({
      id: note.id,
      title: note.title,
      blockCount: note.content?.blocks?.length || 0,
      iconEmoji: note.iconEmoji,
      isFavorite: note.isFavorite,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    }));
  }

  /**
   * GET /notes/:id - Tek not getir (full content)
   */
  @Get(":id")
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    const note = await this.notesService.findOne(id);
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      iconEmoji: note.iconEmoji,
      coverType: note.coverType,
      coverValue: note.coverValue,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  /**
   * PUT /notes/:id - Not güncelle
   * @SecOps - Zod validation zorunlu!
   */
  @Put(":id")
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateNoteSchema)) updateNoteDto: UpdateNoteDto,
  ) {
    const note = await this.notesService.update(id, updateNoteDto);
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      iconEmoji: note.iconEmoji,
      coverType: note.coverType,
      coverValue: note.coverValue,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  /**
   * PATCH /notes/:id/blocks/reorder - Blok sırasını güncelle
   * Sprint 2 - Drag & Drop Block Management
   */
  @Patch(":id/blocks/reorder")
  async reorderBlock(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReorderBlockSchema))
    reorderDto: ReorderBlockDto,
  ) {
    const note = await this.notesService.reorderBlock(
      id,
      reorderDto.blockId,
      reorderDto.newOrder,
    );
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  /**
   * GET /notes/:id/backlinks - Bu nota link veren notlar
   * Sprint 2 - Bi-directional Linking
   */
  @Get(":id/backlinks")
  async getBacklinks(@Param("id", ParseUUIDPipe) id: string) {
    const backlinks = await this.notesService.getBacklinks(id);
    return {
      noteId: id,
      backlinks: backlinks.map((note) => ({
        id: note.id,
        title: note.title,
        updatedAt: note.updatedAt.toISOString(),
      })),
      count: backlinks.length,
    };
  }

  /**
   * GET /notes/:id/outlinks - Bu notun link verdiği notlar
   * Sprint 2 - Bi-directional Linking
   */
  @Get(":id/outlinks")
  async getOutlinks(@Param("id", ParseUUIDPipe) id: string) {
    const outlinks = await this.notesService.getOutlinks(id);
    return {
      noteId: id,
      outlinks: outlinks.map((note) => ({
        id: note.id,
        title: note.title,
        updatedAt: note.updatedAt.toISOString(),
      })),
      count: outlinks.length,
    };
  }

  /**
   * PATCH /notes/:id/favorite - Toggle favorite status
   * Sprint 12 - Favorites
   */
  @Patch(":id/favorite")
  async toggleFavorite(@Param("id", ParseUUIDPipe) id: string) {
    const note = await this.notesService.toggleFavorite(id);
    return {
      id: note.id,
      title: note.title,
      isFavorite: note.isFavorite,
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  /**
   * DELETE /notes/:id - Not sil
   */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    await this.notesService.remove(id);
  }
}
