import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';
import { NotFoundException } from '@nestjs/common';

/**
 * Notes Service Unit Tests
 * @QA - Her service mutlaka test edilmeli!
 */
describe('NotesService', () => {
    let service: NotesService;
    let repository: Repository<Note>;

    // Mock note data
    const mockNote: Partial<Note> = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Note',
        content: {
            blocks: [
                {
                    id: '123e4567-e89b-12d3-a456-426614174001',
                    type: 'text',
                    order: 0,
                    data: { text: 'Hello World' },
                },
            ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // Mock repository
    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotesService,
                {
                    provide: getRepositoryToken(Note),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<NotesService>(NotesService);
        repository = module.get<Repository<Note>>(getRepositoryToken(Note));

        // Reset mocks
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ============================================
    // CREATE Tests
    // ============================================
    describe('create', () => {
        it('should create a new note successfully', async () => {
            const createDto = {
                title: 'New Note',
                content: { blocks: [] },
            };

            mockRepository.create.mockReturnValue(mockNote);
            mockRepository.save.mockResolvedValue(mockNote);

            const result = await service.create(createDto);

            expect(mockRepository.create).toHaveBeenCalledWith({
                title: createDto.title,
                content: createDto.content,
            });
            expect(mockRepository.save).toHaveBeenCalled();
            expect(result).toEqual(mockNote);
        });

        it('should create a note with blocks', async () => {
            const createDto = {
                title: 'Note with Blocks',
                content: {
                    blocks: [
                        {
                            id: '123e4567-e89b-12d3-a456-426614174001',
                            type: 'heading' as const,
                            order: 0,
                            data: { text: 'Header', level: 1 },
                        },
                    ],
                },
            };

            mockRepository.create.mockReturnValue({ ...mockNote, ...createDto });
            mockRepository.save.mockResolvedValue({ ...mockNote, ...createDto });

            const result = await service.create(createDto);

            expect(result.content.blocks).toHaveLength(1);
            expect(result.content.blocks[0].type).toBe('heading');
        });
    });

    // ============================================
    // FIND ALL Tests
    // ============================================
    describe('findAll', () => {
        it('should return an array of notes', async () => {
            const notes = [mockNote, { ...mockNote, id: 'another-id', title: 'Another Note' }];
            mockRepository.find.mockResolvedValue(notes);

            const result = await service.findAll();

            expect(mockRepository.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual(notes);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no notes exist', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });
    });

    // ============================================
    // FIND ONE Tests
    // ============================================
    describe('findOne', () => {
        it('should return a note by id', async () => {
            mockRepository.findOne.mockResolvedValue(mockNote);

            const result = await service.findOne(mockNote.id as string);

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockNote.id },
            });
            expect(result).toEqual(mockNote);
        });

        it('should throw NotFoundException when note not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('non-existent-id')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    // ============================================
    // UPDATE Tests
    // ============================================
    describe('update', () => {
        it('should update a note title', async () => {
            const updatedNote = { ...mockNote, title: 'Updated Title' };
            mockRepository.findOne.mockResolvedValue(mockNote);
            mockRepository.save.mockResolvedValue(updatedNote);

            const result = await service.update(mockNote.id as string, {
                title: 'Updated Title',
            });

            expect(result.title).toBe('Updated Title');
        });

        it('should update note content', async () => {
            const newContent = { blocks: [] };
            const updatedNote = { ...mockNote, content: newContent };
            mockRepository.findOne.mockResolvedValue(mockNote);
            mockRepository.save.mockResolvedValue(updatedNote);

            const result = await service.update(mockNote.id as string, {
                content: newContent,
            });

            expect(result.content).toEqual(newContent);
        });
    });

    // ============================================
    // REMOVE Tests
    // ============================================
    describe('remove', () => {
        it('should remove a note', async () => {
            mockRepository.findOne.mockResolvedValue(mockNote);
            mockRepository.remove.mockResolvedValue(mockNote);

            await service.remove(mockNote.id as string);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockNote);
        });

        it('should throw NotFoundException when removing non-existent note', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.remove('non-existent-id')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
