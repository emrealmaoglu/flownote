import { z } from 'zod';

/**
 * Zod Validation Schemas - Notes
 * @SecOps approved - Tüm input'lar validate edilmeli!
 */

// Block schemas (TECH_SPEC.md'ye uygun)
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

const BlockSchema = z.discriminatedUnion('type', [
    TextBlockSchema,
    HeadingBlockSchema,
    CheckboxBlockSchema,
    ImageBlockSchema,
]);

const NoteContentSchema = z.object({
    blocks: z.array(BlockSchema).default([]),
});

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

// Type inference
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
