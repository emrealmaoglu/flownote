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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { AuthenticatedRequest } from "../common/interfaces";
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
 */
@ApiTags('Notes')
@ApiBearerAuth('JWT-auth')
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
  @ApiOperation({
    summary: 'Create a new note',
    description: 'Creates a new note for the authenticated user',
  })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        content: { type: 'object' },
        iconEmoji: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Request() req: AuthenticatedRequest,
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
  @ApiOperation({
    summary: 'Get all notes',
    description: 'Returns all notes for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notes',
    schema: {
      type: 'object',
      properties: {
        notes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              blockCount: { type: 'number' },
              iconEmoji: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async findAll(@Request() req: AuthenticatedRequest) {
    const notes = await this.notesService.findAll(req.user.id);
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
   */
  @Get("search")
  @ApiOperation({
    summary: 'Search notes',
    description: 'Full-text search across note titles and content',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query (min 2 characters)',
    example: 'meeting notes',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Max results (default: 10, max: 50)',
    example: 10,
  })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@Request() req: AuthenticatedRequest, @Query("q") query: string, @Query("limit") limit?: string) {
    const parsedLimit = Math.min(parseInt(limit || "10", 10) || 10, 50);
    const results = await this.notesService.search(query || "", req.user.id, parsedLimit);

    return {
      query: query || "",
      results,
      totalCount: results.length,
    };
  }

  /**
   * GET /notes/recent - Get recent notes
   */
  @Get("recent")
  @ApiOperation({
    summary: 'Get recent notes',
    description: 'Returns most recently updated notes',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of notes (default: 5)',
    example: 5,
  })
  @ApiResponse({ status: 200, description: 'Recent notes list' })
  async getRecent(@Request() req: AuthenticatedRequest, @Query("limit") limit?: string) {
    const parsedLimit = parseInt(limit || "5", 10);
    const notes = await this.notesService.getRecent(req.user.id, parsedLimit);
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
   */
  @Get("favorites")
  @ApiOperation({
    summary: 'Get favorite notes',
    description: 'Returns notes marked as favorite',
  })
  @ApiResponse({ status: 200, description: 'Favorite notes list' })
  async getFavorites(@Request() req: AuthenticatedRequest) {
    const notes = await this.notesService.getFavorites(req.user.id);
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
  @ApiOperation({
    summary: 'Get note by ID',
    description: 'Returns a single note with full content',
  })
  @ApiParam({
    name: 'id',
    description: 'Note UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Note found' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async findOne(@Request() req: AuthenticatedRequest, @Param("id", ParseUUIDPipe) id: string) {
    const note = await this.notesService.findOne(id, req.user.id);
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
  @ApiOperation({
    summary: 'Update note',
    description: 'Updates an existing note',
  })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiResponse({ status: 200, description: 'Note updated' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async update(
    @Request() req: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateNoteSchema)) updateNoteDto: UpdateNoteDto,
  ) {
    const note = await this.notesService.update(id, updateNoteDto, req.user.id);
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
   */
  @Patch(":id/blocks/reorder")
  @ApiOperation({
    summary: 'Reorder blocks',
    description: 'Changes the order of a block within a note',
  })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiBody({ type: ReorderBlockDto })
  @ApiResponse({ status: 200, description: 'Block reordered' })
  async reorderBlock(
    @Request() req: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReorderBlockSchema))
    reorderDto: ReorderBlockDto,
  ) {
    const note = await this.notesService.reorderBlock(
      id,
      reorderDto.blockId,
      reorderDto.newOrder,
      req.user.id,
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
   */
  @Get(":id/backlinks")
  @ApiOperation({
    summary: 'Get backlinks',
    description: 'Returns notes that link to this note',
  })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiResponse({ status: 200, description: 'Backlinks found' })
  async getBacklinks(@Request() req: AuthenticatedRequest, @Param("id", ParseUUIDPipe) id: string) {
    const backlinks = await this.notesService.getBacklinks(id, req.user.id);
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
   */
  @Get(":id/outlinks")
  @ApiOperation({
    summary: 'Get outlinks',
    description: 'Returns notes that this note links to',
  })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiResponse({ status: 200, description: 'Outlinks found' })
  async getOutlinks(@Request() req: AuthenticatedRequest, @Param("id", ParseUUIDPipe) id: string) {
    const outlinks = await this.notesService.getOutlinks(id, req.user.id);
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
   */
  @Patch(":id/favorite")
  @ApiOperation({
    summary: 'Toggle favorite',
    description: 'Toggles the favorite status of a note',
  })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiResponse({ status: 200, description: 'Favorite toggled' })
  async toggleFavorite(@Request() req: AuthenticatedRequest, @Param("id", ParseUUIDPipe) id: string) {
    const note = await this.notesService.toggleFavorite(id, req.user.id);
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
  @ApiOperation({
    summary: 'Delete note',
    description: 'Permanently deletes a note',
  })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @ApiResponse({ status: 204, description: 'Note deleted' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async remove(@Request() req: AuthenticatedRequest, @Param("id", ParseUUIDPipe) id: string) {
    await this.notesService.remove(id, req.user.id);
  }
}
