import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating user profile
 * All fields optional, password requires special handling
 */
export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['password'] as const)
) {
    @ApiPropertyOptional({
        description: 'New password (optional)',
        example: 'NewSecurePass123!',
    })
    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase, one lowercase, and one number',
    })
    password?: string;
}
