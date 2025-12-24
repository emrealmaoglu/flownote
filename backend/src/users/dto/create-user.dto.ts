import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new user
 * Used by UsersService.create() and AuthService.register()
 */
export class CreateUserDto {
    @ApiProperty({
        description: 'Unique username',
        example: 'john_doe',
        minLength: 3,
        maxLength: 50,
    })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    })
    username: string;

    @ApiProperty({
        description: 'Valid email address',
        example: 'john@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Password (min 8 chars, 1 upper, 1 lower, 1 number)',
        example: 'SecurePass123!',
        minLength: 8,
        maxLength: 72,
    })
    @IsString()
    @MinLength(8)
    @MaxLength(72) // bcrypt limit
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase, one lowercase, and one number',
    })
    password: string;

    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe',
        minLength: 1,
        maxLength: 100,
    })
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({
        description: 'Optional Team ID',
        example: 'uuid-string',
    })
    @IsOptional()
    @IsString()
    teamId?: string;
}
