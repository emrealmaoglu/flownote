import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

/**
 * Notes Service
 * Business logic katmanı - @Dev tarafından implemente edildi
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
}
