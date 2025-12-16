import { z } from "zod";

/**
 * Zod Validation Schemas - Notes
 * Sprint 1 - CodeBlock desteği eklendi
 * @SecOps approved - Tüm input'lar validate edilmeli!
 */

// ============================================
// Code Language Enum (10 dil desteği)
// ============================================
export const CodeLanguageSchema = z.enum([
  "javascript",
  "typescript",
  "python",
  "sql",
  "bash",
  "json",
  "html",
  "css",
  "markdown",
  "plaintext",
]);

export type CodeLanguage = z.infer<typeof CodeLanguageSchema>;

// ============================================
// Block Schemas (TECH_SPEC.md + TDD uyumlu)
// ============================================

const TextBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("text"),
  order: z.number().int().min(0),
  data: z.object({
    text: z.string(),
  }),
});

const HeadingBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("heading"),
  order: z.number().int().min(0),
  data: z.object({
    text: z.string(), // Removed .min(1) to allow empty headers in draft
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  }),
});

const CheckboxBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("checkbox"),
  order: z.number().int().min(0),
  data: z.object({
    text: z.string(),
    checked: z.boolean(),
  }),
});

const ImageBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("image"),
  order: z.number().int().min(0),
  data: z.object({
    url: z.string(), // Removed .url() validation for initial empty state, or use .url().or(z.literal(''))
    alt: z.string().optional(),
    caption: z.string().optional(),
  }),
});

/**
 * CodeBlock Schema - YENİ (Sprint 1)
 * Syntax highlighting için dil desteği
 */
const CodeBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("code"),
  order: z.number().int().min(0),
  data: z.object({
    code: z.string(),
    language: CodeLanguageSchema.default("plaintext"),
    filename: z.string().max(100).optional(),
  }),
});

// ============================================
// Birleşik Block Schema (Discriminated Union)
// ============================================
export const BlockSchema = z.discriminatedUnion("type", [
  TextBlockSchema,
  HeadingBlockSchema,
  CheckboxBlockSchema,
  ImageBlockSchema,
  CodeBlockSchema, // ← Sprint 1 eklendi
]);

export type Block = z.infer<typeof BlockSchema>;

// ============================================
// Note Content Schema
// ============================================
export const NoteContentSchema = z.object({
  blocks: z.array(BlockSchema).default([]),
});

export type NoteContent = z.infer<typeof NoteContentSchema>;

// ============================================
// CRUD Schemas
// ============================================

/**
 * Create Note Schema
 * POST /notes için validation
 */
export const CreateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
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
// Type Inference Exports
// ============================================
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;

// Block type exports for frontend sync
export type TextBlock = z.infer<typeof TextBlockSchema>;
export type HeadingBlock = z.infer<typeof HeadingBlockSchema>;
export type CheckboxBlock = z.infer<typeof CheckboxBlockSchema>;
export type ImageBlock = z.infer<typeof ImageBlockSchema>;
export type CodeBlock = z.infer<typeof CodeBlockSchema>;
