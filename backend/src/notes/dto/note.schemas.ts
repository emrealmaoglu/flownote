import { z } from 'zod';

/**
 * Zod Validation Schemas - Notes
 * @SecOps approved - Tüm input'lar validate edilmeli!
 * @Arch - Sprint 1 TDD'ye uygun olarak CodeBlock eklendi
 */

// ============================================
// Code Language Enum (10 dil desteği)
// ============================================
export const CodeLanguageSchema = z.enum([
    'javascript',
    'typescript',
    'python',
    'sql',
    'bash',
    'json',
    'html',
    'css',
    'markdown',
    'plaintext',
]);

export type CodeLanguage = z.infer<typeof CodeLanguageSchema>;

// ============================================
// Block Schemas
// ============================================

const TextBlockSchema = z.object({
    id: z.string().uuid(),
    type: z.literal('text'),
    order: z.number().int().min(0),
    data: z.object({
        text: z.string(),
    }),
});

const HeadingBlockSchema = z.object({
    id: z.string().uuid(),
    type: z.literal('heading'),
    order: z.number().int().min(0),
    data: z.object({
        text: z.string().min(1),
        level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    }),
});

const CheckboxBlockSchema = z.object({
    id: z.string().uuid(),
    type: z.literal('checkbox'),
    order: z.number().int().min(0),
    data: z.object({
        text: z.string(),
        checked: z.boolean(),
    }),
});

const ImageBlockSchema = z.object({
    id: z.string().uuid(),
    type: z.literal('image'),
    order: z.number().int().min(0),
    data: z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        caption: z.string().optional(),
    }),
});

/**
 * CodeBlock Schema - Sprint 1 TDD
 * Syntax highlighted kod blokları için
 */
const CodeBlockSchema = z.object({
    id: z.string().uuid(),
    type: z.literal('code'),
    order: z.number().int().min(0),
    data: z.object({
        code: z.string(),
        language: CodeLanguageSchema.default('plaintext'),
        filename: z.string().max(100).optional(),
    }),
});

// ============================================
// Combined Block Schema (Discriminated Union)
// ============================================

const BlockSchema = z.discriminatedUnion('type', [
    TextBlockSchema,
    HeadingBlockSchema,
    CheckboxBlockSchema,
    ImageBlockSchema,
    CodeBlockSchema, // ← YENİ
]);

const NoteContentSchema = z.object({
    blocks: z.array(BlockSchema).default([]),
});

// ============================================
// Note CRUD Schemas
// ============================================

/**
 * Create Note Schema
 * POST /notes için validation
 */
export const CreateNoteSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    content: NoteContentSchema,
});

/**
 * Update Note Schema
 * PUT /notes/:id için validation
 */
export const UpdateNoteSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    content: NoteContentSchema.optional(),
});

// ============================================
// Search Schemas - Sprint 1 TDD
// ============================================

/**
 * Search Query Schema
 * GET /notes/search için validation
 */
export const SearchQuerySchema = z.object({
    q: z.string().min(2, 'Query must be at least 2 characters'),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

// ============================================
// Type Inference Exports
// ============================================

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
export type SearchQueryInput = z.infer<typeof SearchQuerySchema>;
export type Block = z.infer<typeof BlockSchema>;
export type NoteContent = z.infer<typeof NoteContentSchema>;

// Block type exports for external use
export type TextBlock = z.infer<typeof TextBlockSchema>;
export type HeadingBlock = z.infer<typeof HeadingBlockSchema>;
export type CheckboxBlock = z.infer<typeof CheckboxBlockSchema>;
export type ImageBlock = z.infer<typeof ImageBlockSchema>;
export type CodeBlock = z.infer<typeof CodeBlockSchema>;
