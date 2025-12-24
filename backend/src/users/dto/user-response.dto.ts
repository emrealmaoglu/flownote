import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../../auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Sanitized user response - never exposes sensitive data
 * Use with ClassSerializerInterceptor or manual mapping
 */
export class UserResponseDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    username: string;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty({ enum: ['admin', 'user'] })
    @Expose()
    role: UserRole;

    @ApiProperty({ required: false })
    @Expose()
    teamId?: string;

    @ApiProperty()
    @Expose()
    createdAt: Date;

    @ApiProperty()
    @Expose()
    updatedAt: Date;

    // Explicitly exclude sensitive fields
    @Exclude()
    passwordHash?: string;

    @Exclude()
    deletedAt?: Date;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}
