import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Create Note DTO
 * @SecOps - Zod ile validate edilir
 */
export class CreateNoteDto {
  @ApiProperty({
    description: "Note title",
    example: "Meeting Notes - Q4 Planning",
    maxLength: 255,
  })
  title: string;

  @ApiPropertyOptional({
    description: "Note content in block format",
    example: {
      blocks: [
        {
          id: "1",
          type: "paragraph",
          content: "First paragraph",
          order: 0,
          data: {},
        },
      ],
    },
  })
  content: {
    blocks: Array<{
      id: string;
      type: "text" | "heading" | "checkbox" | "image" | "code";
      order: number;
      data: Record<string, unknown>;
    }>;
  };

  @ApiPropertyOptional({
    description: "Icon emoji for the note",
    example: "📝",
  })
  iconEmoji?: string;

  @ApiPropertyOptional({
    description: "Cover image type",
    enum: ["none", "gradient", "color", "image"],
    example: "gradient",
  })
  coverType?: "none" | "gradient" | "color" | "image";

  @ApiPropertyOptional({
    description: "Cover value (color code, gradient, or image URL)",
    example: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  })
  coverValue?: string;
}
