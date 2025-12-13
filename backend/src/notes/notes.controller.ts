import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
    UsePipes,
    UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateNoteSchema, UpdateNoteSchema } from './dto/note.schemas';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
    constructor(private readonly notesService: NotesService) { }

    /**
     * POST /notes - Yeni not oluştur
     * @SecOps - Zod validation zorunlu!
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ZodValidationPipe(CreateNoteSchema))
    async create(@Body() createNoteDto: CreateNoteDto) {
        const note = await this.notesService.create(createNoteDto);
        return {
            id: note.id,
            title: note.title,
            content: note.content,
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
    @Get('search')
    async search(
        @Query('q') query: string,
        @Query('limit') limit?: string,
    ) {
        const parsedLimit = Math.min(parseInt(limit || '10', 10) || 10, 50);
        const results = await this.notesService.search(query || '', parsedLimit);

        return {
            query: query || '',
            results,
            totalCount: results.length,
        };
    }

    /**
     * GET /notes/:id - Tek not getir (full content)
     */
    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        const note = await this.notesService.findOne(id);
        return {
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
        };
    }

    /**
     * PUT /notes/:id - Not güncelle
     * @SecOps - Zod validation zorunlu!
     */
    @Put(':id')
    @UsePipes(new ZodValidationPipe(UpdateNoteSchema))
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateNoteDto: UpdateNoteDto,
    ) {
        const note = await this.notesService.update(id, updateNoteDto);
        return {
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
        };
    }

    /**
     * DELETE /notes/:id - Not sil
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        await this.notesService.remove(id);
    }
}
