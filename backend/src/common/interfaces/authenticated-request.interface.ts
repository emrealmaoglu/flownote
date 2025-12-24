import { Request } from 'express';

/**
 * JWT payload structure after validation
 */
export interface JwtPayload {
    sub: string;      // User ID
    email: string;
    iat?: number;     // Issued at
    exp?: number;     // Expiration
}

/**
 * Extended Request interface with authenticated user
 * Use this instead of `any` for @Request() decorator
 */
export interface AuthenticatedRequest extends Request {
    user: JwtPayload;
}

/**
 * User object attached to request after JWT validation
 */
export interface RequestUser {
    id: string;
    email: string;
}
