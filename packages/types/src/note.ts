/**
 * Note Types
 * Shared types for Note entities across frontend and backend
 */

export type BlockType = 'text' | 'heading' | 'checkbox' | 'image' | 'code';

export interface Block {
  id: string;
  type: BlockType;
  order: number;
  data: Record<string, unknown>;
}

export interface NoteContent {
  blocks: Block[];
}

export type CoverType = 'none' | 'gradient' | 'color' | 'image';

export interface Note {
  id: string;
  title: string;
  content: NoteContent | string; // string for JSON compatibility
  iconEmoji: string | null;
  coverType: CoverType;
  coverValue: string | null;
  isFavorite: boolean;
  folderId: string | null;
  parentId: string | null;
  position: number;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateNoteDTO {
  title: string;
  content?: NoteContent;
  iconEmoji?: string | null;
  coverType?: CoverType;
  coverValue?: string | null;
  folderId?: string | null;
  parentId?: string | null;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: NoteContent;
  iconEmoji?: string | null;
  coverType?: CoverType;
  coverValue?: string | null;
  isFavorite?: boolean;
  folderId?: string | null;
  position?: number;
}
