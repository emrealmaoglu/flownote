/**
 * @flownote/types
 * Shared TypeScript types for FlowNote monorepo
 */

// Note types
export * from './note';

// Folder types
export * from './folder';

// User types
export * from './user';

// Template types
export * from './template';

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
