import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { SearchResultDto } from './dto/search-result.dto';

/**
 * Notes Service
 * Business logic katmanı - @Dev tarafından implemente edildi
 * Sprint 1: Search functionality eklendi
 */
@Injectable()
export class NotesService {
    constructor(
        @InjectRepository(Note)
        private readonly notesRepository: Repository<Note>,
    ) { }

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

    /**
     * Full-text search with fuzzy matching
     * Sprint 1 - Command Palette için optimize edildi
     * @param query - Arama sorgusu (min 2 karakter)
     * @param limit - Sonuç limiti (default: 10)
     * @returns Skorlanmış arama sonuçları
     */
    async search(query: string, limit = 10): Promise<SearchResultDto[]> {
        const sanitizedQuery = query.trim().toLowerCase();

        if (sanitizedQuery.length < 2) {
            return [];
        }

        // Find notes matching title or content
        const notes = await this.notesRepository
            .createQueryBuilder('note')
            .where('LOWER(note.title) LIKE :query', { query: `%${sanitizedQuery}%` })
            .orWhere('note.content::text ILIKE :query', { query: `%${sanitizedQuery}%` })
            .orderBy('note.updatedAt', 'DESC')
            .limit(limit)
            .getMany();

        return notes.map(note => {
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
                matchType: titleMatch ? 'title' as const : 'content' as const,
                score,
                updatedAt: note.updatedAt.toISOString(),
            };
        });
    }

    /**
     * Extract all text from block content
     */
    private extractTextFromBlocks(content: Note['content']): string {
        if (!content?.blocks) return '';

        return content.blocks
            .map(block => {
                const data = block.data as Record<string, unknown>;
                if (block.type === 'code') {
                    return (data.code as string) || '';
                }
                return (data.text as string) || '';
            })
            .filter(Boolean)
            .join(' ');
    }

    /**
     * Extract snippet around matched text (±50 chars)
     */
    private extractSnippet(fullText: string, query: string): string {
        if (!fullText) return '';

        const index = fullText.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) {
            return fullText.substring(0, 100) + (fullText.length > 100 ? '...' : '');
        }

        const start = Math.max(0, index - 50);
        const end = Math.min(fullText.length, index + query.length + 50);

        return (start > 0 ? '...' : '') +
            fullText.substring(start, end) +
            (end < fullText.length ? '...' : '');
    }
}

