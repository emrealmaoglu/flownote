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

/**
 * Sprint 12: New Block Types
 */
const DividerBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("divider"),
  order: z.number().int().min(0),
  data: z.object({}).strict(),
});

const QuoteBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("quote"),
  order: z.number().int().min(0),
  data: z.object({
    text: z.string(),
    author: z.string().optional(),
  }),
});

const CalloutBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("callout"),
  order: z.number().int().min(0),
  data: z.object({
    text: z.string(),
    emoji: z.string().default("💡"),
    color: z.enum(["blue", "green", "yellow", "red", "purple", "gray"]).default("blue"),
  }),
});

const BookmarkBlockSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("bookmark"),
  order: z.number().int().min(0),
  data: z.object({
    url: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
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
  DividerBlockSchema,    // ← Sprint 12
  QuoteBlockSchema,      // ← Sprint 12
  CalloutBlockSchema,    // ← Sprint 12
  BookmarkBlockSchema,   // ← Sprint 12
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
// Identity Schemas (Sprint 8 - MVP+)
// ============================================

const CoverTypeSchema = z.enum(["none", "color", "gradient", "image"]);

const HexColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, "coverValue must be #RRGGBB");

const UrlSchema = z.string().url("coverValue must be a valid URL");

// ============================================
// CRUD Schemas
// ============================================

/**
 * Create Note Schema
 * POST /notes için validation
 */
export const CreateNoteSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255, "Title too long"),
    content: NoteContentSchema,

    // NEW (Sprint 8)
    iconEmoji: z.string().max(32).optional().nullable(),
    coverType: CoverTypeSchema.optional().default("none"),
    coverValue: z.string().max(2048).optional().nullable(),
  })
  .strict()
  .superRefine((val, ctx) => {
    const t = val.coverType ?? "none";
    const v = val.coverValue;

    if (t === "none") {
      if (v != null && v !== "") {
        ctx.addIssue({
          code: "custom",
          path: ["coverValue"],
          message: "coverValue must be null/empty when coverType=none",
        });
      }
      return;
    }

    if (v == null || v === "") {
      ctx.addIssue({
        code: "custom",
        path: ["coverValue"],
        message: "coverValue is required when coverType is not none",
      });
      return;
    }

    if (t === "color" && !HexColorSchema.safeParse(v).success) {
      ctx.addIssue({
        code: "custom",
        path: ["coverValue"],
        message: "Invalid hex color",
      });
    }
    if (t === "image" && !UrlSchema.safeParse(v).success) {
      ctx.addIssue({
        code: "custom",
        path: ["coverValue"],
        message: "Invalid image URL",
      });
    }
    // t === "gradient": MVP’de allowlist yoksa sadece non-empty kabul ediyoruz.
  });

/**
 * Update Note Schema
 * PUT /notes/:id için validation
 */
export const UpdateNoteSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    content: NoteContentSchema.optional(),

    // NEW (Sprint 8)
    iconEmoji: z.string().max(32).optional().nullable(),
    coverType: CoverTypeSchema.optional(),
    coverValue: z.string().max(2048).optional().nullable(),
  })
  .strict()
  .superRefine((val, ctx) => {
    const hasType = "coverType" in val;
    const hasValue = "coverValue" in val;

    if (!hasType && !hasValue) return;

    // coverValue gönderildiyse coverType da gönderilsin (clobber riskini azaltır)
    if (!hasType && hasValue) {
      ctx.addIssue({
        code: "custom",
        path: ["coverType"],
        message: "coverType is required when coverValue is provided",
      });
      return;
    }

    const t = val.coverType ?? "none";
    const v = val.coverValue;

    if (t === "none") {
      if (hasValue && v != null && v !== "") {
        ctx.addIssue({
          code: "custom",
          path: ["coverValue"],
          message: "coverValue must be null/empty when coverType=none",
        });
      }
      return;
    }

    // coverType none değilse coverValue bekleriz (MVP netliği)
    if (!hasValue || v == null || v === "") {
      ctx.addIssue({
        code: "custom",
        path: ["coverValue"],
        message: "coverValue is required when coverType is not none",
      });
      return;
    }

    if (t === "color" && !HexColorSchema.safeParse(v).success) {
      ctx.addIssue({
        code: "custom",
        path: ["coverValue"],
        message: "Invalid hex color",
      });
    }
    if (t === "image" && !UrlSchema.safeParse(v).success) {
      ctx.addIssue({
        code: "custom",
        path: ["coverValue"],
        message: "Invalid image URL",
      });
    }
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
export type DividerBlock = z.infer<typeof DividerBlockSchema>;
export type QuoteBlock = z.infer<typeof QuoteBlockSchema>;
export type CalloutBlock = z.infer<typeof CalloutBlockSchema>;
export type BookmarkBlock = z.infer<typeof BookmarkBlockSchema>;
