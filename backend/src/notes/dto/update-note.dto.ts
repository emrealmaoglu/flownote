/**
 * Update Note DTO
 * @SecOps - Zod ile validate edilir
 */
export class UpdateNoteDto {
    title?: string;
    content?: {
        blocks: Array<{
            id: string;
            type: 'text' | 'heading' | 'checkbox' | 'image';
            order: number;
            data: Record<string, unknown>;
        }>;
    };
}
