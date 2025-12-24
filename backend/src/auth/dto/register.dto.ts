import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Register DTO
 */
export class RegisterDto {
  @ApiProperty({
    description: "Unique username",
    example: "john_doe",
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: "Valid email address",
    example: "john@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "User full name",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Password (min 6 characters)",
    example: "SecurePass123!",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
