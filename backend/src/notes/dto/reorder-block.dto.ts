import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Reorder Block DTO
 * Sprint 2 - Drag & Drop Block Management
 */
export const ReorderBlockSchema = z.object({
  blockId: z.string().uuid("Invalid block ID"),
  newOrder: z.number().min(0, "Order must be positive"),
});

export class ReorderBlockDto {
  @ApiProperty({
    description: "Block ID to move",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  blockId: string;

  @ApiProperty({
    description: "New order index",
    example: 1,
    minimum: 0,
  })
  newOrder: number;
}
