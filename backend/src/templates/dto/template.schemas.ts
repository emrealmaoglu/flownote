import { z } from "zod";

/**
 * Block Schema - Reused from notes
 */
const BlockSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["text", "heading", "checkbox", "image", "code"]),
  order: z.number(),
  data: z.record(z.unknown()),
});

/**
 * Create Template Schema
 * Sprint 3 - Templates System
 */
export const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(500).optional().nullable(),
  content: z.object({
    blocks: z.array(BlockSchema),
  }),
  category: z.string().max(100).optional().nullable(),
});

export type CreateTemplateDto = z.infer<typeof CreateTemplateSchema>;

/**
 * Update Template Schema
 */
export const UpdateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(500).optional().nullable(),
  content: z
    .object({
      blocks: z.array(BlockSchema),
    })
    .optional(),
  category: z.string().max(100).optional().nullable(),
});

export type UpdateTemplateDto = z.infer<typeof UpdateTemplateSchema>;

/**
 * Apply Template Schema - Create note from template
 */
export const ApplyTemplateSchema = z.object({
  title: z.string().min(1).max(255),
});

export type ApplyTemplateDto = z.infer<typeof ApplyTemplateSchema>;
