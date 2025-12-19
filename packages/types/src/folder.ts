/**
 * Folder Types
 * Shared types for Folder entities
 */

export interface Folder {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  parentId: string | null;
  position: number;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateFolderDTO {
  name: string;
  color?: string | null;
  icon?: string | null;
  parentId?: string | null;
}

export interface UpdateFolderDTO {
  name?: string;
  color?: string | null;
  icon?: string | null;
  position?: number;
}
