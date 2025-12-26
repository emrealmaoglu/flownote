import { Request } from "express";
import { UserRole } from "../../auth/entities/user.entity";

/**
 * JWT payload structure after validation
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

/**
 * User object attached to request after JWT validation
 * Matches the returned object from JwtStrategy.validate()
 */
export interface RequestUser {
  id: string;
  email: string | null;
  username: string;
  role: UserRole;
}

/**
 * Extended Request interface with authenticated user
 * Use this instead of `any` for @Request() decorator
 */
export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}
