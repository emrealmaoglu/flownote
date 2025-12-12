/**
 * FlowNote Shared Zod Schemas
 * @description Frontend ve Backend'in ortak kullandığı validasyon şemaları
 * @author @SecOps - Validation is mandatory!
 */

import { z } from 'zod';

// ============================================
// Block Schemas - @SecOps approved
// ============================================

/** Text Block validasyonu */
export const TextBlockSchema = z.object({
    id: z.string().uuid('Block ID must be a valid UUID'),
    type: z.literal('text'),
    order: z.number().int().min(0, 'Order must be a non-negative integer'),
    data: z.object({
        text: z.string(),
    }),
});

/** Heading Block validasyonu */
export const HeadingBlockSchema = z.object({
    id: z.string().uuid('Block ID must be a valid UUID'),
    type: z.literal('heading'),
    order: z.number().int().min(0),
    data: z.object({
        text: z.string().min(1, 'Heading text cannot be empty'),
        level: z.union([z.literal(1), z.literal(2), z.literal(3)], {
            errorMap: () => ({ message: 'Level must be 1, 2, or 3' }),
        }),
    }),
});

/** Checkbox Block validasyonu */
export const CheckboxBlockSchema = z.object({
    id: z.string().uuid('Block ID must be a valid UUID'),
    type: z.literal('checkbox'),
    order: z.number().int().min(0),
    data: z.object({
        text: z.string(),
        checked: z.boolean(),
    }),
});

/** Image Block validasyonu */
export const ImageBlockSchema = z.object({
    id: z.string().uuid('Block ID must be a valid UUID'),
    type: z.literal('image'),
    order: z.number().int().min(0),
    data: z.object({
        url: z.string().url('Image URL must be a valid URL'),
        alt: z.string().optional(),
        caption: z.string().optional(),
    }),
});

/** Discriminated union - Tüm block tipleri */
export const BlockSchema = z.discriminatedUnion('type', [
    TextBlockSchema,
    HeadingBlockSchema,
    CheckboxBlockSchema,
    ImageBlockSchema,
]);

/** Note content - Block array */
export const NoteContentSchema = z.object({
    blocks: z.array(BlockSchema).default([]),
});

// ============================================
// Note Schemas
// ============================================

/** Create Note - Yeni not oluşturma */
export const CreateNoteSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title must be 255 characters or less'),
    content: NoteContentSchema,
});

/** Update Note - Not güncelleme */
export const UpdateNoteSchema = z.object({
    title: z
        .string()
        .min(1, 'Title cannot be empty')
        .max(255, 'Title must be 255 characters or less')
        .optional(),
    content: NoteContentSchema.optional(),
});

// ============================================
// Auth Schemas - @SecOps strict validation
// ============================================

/** Login - Kullanıcı girişi */
export const LoginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

/** Register - Yeni kullanıcı kaydı */
export const RegisterSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        ),
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be 100 characters or less'),
});

// ============================================
// Type Inference - Zod'dan TypeScript type'ı çıkar
// ============================================

export type TextBlockInput = z.infer<typeof TextBlockSchema>;
export type HeadingBlockInput = z.infer<typeof HeadingBlockSchema>;
export type CheckboxBlockInput = z.infer<typeof CheckboxBlockSchema>;
export type ImageBlockInput = z.infer<typeof ImageBlockSchema>;
export type BlockInput = z.infer<typeof BlockSchema>;
export type NoteContentInput = z.infer<typeof NoteContentSchema>;
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
