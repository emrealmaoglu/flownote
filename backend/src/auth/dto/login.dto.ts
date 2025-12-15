import { IsNotEmpty, IsString } from "class-validator";

/**
 * Login DTO
 */
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // username or email

  @IsString()
  @IsNotEmpty()
  password: string;
}
