import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto, LoginSchema, RegisterSchema } from "./dto";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";

/**
 * AuthController
 * Authentication endpoints
 */
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Yeni kullanıcı kaydı
   */
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      accessToken: result.accessToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    };
  }

  /**
   * POST /auth/login
   * Kullanıcı girişi
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      accessToken: result.accessToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
    };
  }
}
