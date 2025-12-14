import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../entities/user.entity";

export const ROLES_KEY = "roles";

/**
 * Roles Decorator
 * Route'larda gerekli rolleri belirtmek için kullanılır
 * @example @Roles('admin')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
