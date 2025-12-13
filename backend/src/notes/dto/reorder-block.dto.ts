import { z } from "zod";

/**
 * Reorder Block DTO
 * Sprint 2 - Drag & Drop Block Management
 */
export const ReorderBlockSchema = z.object({
  blockId: z.string().uuid("Invalid block ID"),
  newOrder: z.number().min(0, "Order must be positive"),
});

export type ReorderBlockDto = z.infer<typeof ReorderBlockSchema>;
