import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { SearchResultDto } from './dto/search.dto';
import { NoteContent } from './dto/note.schemas';

/**
 * Notes Service
 * Business logic katmanı - @Dev tarafından implemente edildi
 * @Arch - Sprint 1: Search functionality eklendi
 */
@Injectable()
export class NotesService {
    constructor(
        @InjectRepository(Note)
        private readonly notesRepository: Repository<Note>,
    ) { }

    /**
     * Full-text search with pg_trgm
     * Scoring: Title matches get 2x weight
     * @param query - Arama sorgusu (min 2 karakter)
     * @param limit - Sonuç limiti (default: 10)
     */
    async search(query: string, limit = 10): Promise<SearchResultDto[]> {
        const sanitizedQuery = query.trim().toLowerCase();

        if (sanitizedQuery.length < 2) {
            return [];
        }

        // pg_trgm similarity search with title priority
        const results = await this.notesRepository.query(
            `
            SELECT 
                id,
                title,
                content,
                updated_at,
                SIMILARITY(LOWER(title), $1) AS title_score,
                CASE 
                    WHEN LOWER(title) LIKE '%' || $1 || '%' THEN 1.0
                    ELSE SIMILARITY(LOWER(title), $1)
                END * 2 AS weighted_title_score
            FROM notes
            WHERE 
                LOWER(title) LIKE '%' || $1 || '%'
                OR content::text ILIKE '%' || $1 || '%'
            ORDER BY 
                CASE WHEN LOWER(title) LIKE '%' || $1 || '%' THEN 0 ELSE 1 END,
                SIMILARITY(LOWER(title), $1) DESC
            LIMIT $2
            `,
            [sanitizedQuery, limit],
        );

        return results.map((row: { id: string; title: string; content: NoteContent; updated_at: Date; weighted_title_score: string }) => ({
            id: row.id,
            title: row.title,
            snippet: this.extractSnippet(row.content, sanitizedQuery),
            matchType: this.getMatchType(row.title, sanitizedQuery),
            score: Math.min(parseFloat(row.weighted_title_score) || 0, 1),
            updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
        }));
    }

    /**
     * Extract snippet around matched text (±50 chars)
     */
    private extractSnippet(content: NoteContent, query: string): string {
        if (!content?.blocks) return '';

        const fullText = content.blocks
            .map((block) => {
                const data = block.data as { text?: string; code?: string };
                return data?.text || data?.code || '';
            })
            .join(' ');

        const lowerText = fullText.toLowerCase();
        const index = lowerText.indexOf(query.toLowerCase());

        if (index === -1) {
            return fullText.substring(0, 100) + (fullText.length > 100 ? '...' : '');
        }

        const start = Math.max(0, index - 50);
        const end = Math.min(fullText.length, index + query.length + 50);

        return (
            (start > 0 ? '...' : '') +
            fullText.substring(start, end) +
            (end < fullText.length ? '...' : '')
        );
    }

    /**
     * Determine if match was in title or content
     */
    private getMatchType(title: string, query: string): 'title' | 'content' {
        return title.toLowerCase().includes(query.toLowerCase()) ? 'title' : 'content';
    }

    /**
     * Yeni not oluştur
     * @param createNoteDto - Zod ile validate edilmiş DTO
     * @returns Oluşturulan not
     */
    async create(createNoteDto: CreateNoteDto): Promise<Note> {
        const note = this.notesRepository.create({
            title: createNoteDto.title,
            content: createNoteDto.content,
        });
        return this.notesRepository.save(note);
    }

    /**
     * Tüm notları listele
     * @returns Not listesi (özet bilgilerle)
     */
    async findAll(): Promise<Note[]> {
        return this.notesRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * ID ile not getir
     * @param id - Not UUID'si
     * @returns Tam not içeriği (JSONB dahil)
     */
    async findOne(id: string): Promise<Note> {
        const note = await this.notesRepository.findOne({ where: { id } });
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
    async update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
        const note = await this.findOne(id);

        if (updateNoteDto.title !== undefined) {
            note.title = updateNoteDto.title;
        }
        if (updateNoteDto.content !== undefined) {
            note.content = updateNoteDto.content;
        }

        return this.notesRepository.save(note);
    }

    /**
     * Not sil
     * @param id - Not UUID'si
     */
    async remove(id: string): Promise<void> {
        const note = await this.findOne(id);
        await this.notesRepository.remove(note);
    }
}
