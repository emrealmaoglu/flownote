import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

/**
 * Login DTO
 */
export class LoginDto {
  @ApiProperty({
    description: 'User identifier (username or email)',
    example: 'user@example.com',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecretPassword123!',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
