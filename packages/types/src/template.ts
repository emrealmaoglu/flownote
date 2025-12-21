/**
 * Template Types
 * Shared types for Template entities
 */

import type { NoteContent } from './note';

export type TemplateCategory =
  | 'personal'
  | 'work'
  | 'education'
  | 'creative'
  | 'meeting'
  | 'project'
  | 'other';

export interface Template {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: TemplateCategory;
  content: NoteContent | string; // string for JSON compatibility
  isPublic: boolean;
  usageCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateTemplateDTO {
  name: string;
  description?: string | null;
  icon?: string | null;
  category?: TemplateCategory;
  content: NoteContent;
  isPublic?: boolean;
}

export interface UpdateTemplateDTO {
  name?: string;
  description?: string | null;
  icon?: string | null;
  category?: TemplateCategory;
  content?: NoteContent;
  isPublic?: boolean;
}
