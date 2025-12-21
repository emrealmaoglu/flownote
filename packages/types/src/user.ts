/**
 * User Types
 * Shared types for User entities
 */

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  email: string | null;
  name: string;
  role: UserRole;
  bio: string | null;
  avatar: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateUserDTO {
  username: string;
  email?: string | null;
  password: string;
  name: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string | null;
  bio?: string | null;
  avatar?: string | null;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'passwordHash'>;
}
