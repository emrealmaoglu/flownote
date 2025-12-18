import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  Res,
  UseGuards,
  Req,
} from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto, LoginSchema, RegisterSchema } from "./dto";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

/**
 * AuthController
 * Authentication endpoints with HttpOnly cookie support
 * Sprint 11: Performance & Security - HttpOnly Cookies
 */
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Yeni kullanıcı kaydı
   * Token HttpOnly cookie olarak set edilir
   */
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(registerDto);

    // Token'ı HttpOnly cookie olarak set et
    this.setAuthCookie(response, result.accessToken);

    // Response'da token döndürme (güvenlik)
    return {
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
    };
  }

  /**
   * POST /auth/login
   * Kullanıcı girişi (username veya email ile)
   * Token HttpOnly cookie olarak set edilir
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Token'ı HttpOnly cookie olarak set et
    this.setAuthCookie(response, result.accessToken);

    // Response'da token döndürme
    return {
      user: {
        id: result.user.id,
        username: result.user.username,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
    };
  }

  /**
   * POST /auth/logout
   * Kullanıcı çıkışı - Cookie'yi temizler
   */
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    // Cookie'yi temizle
    response.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return { message: "Logged out successfully" };
  }

  /**
   * GET /auth/me
   * Mevcut kullanıcı bilgilerini döndürür
   * Cookie'den token okunur
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    return req.user;
  }

  /**
   * Helper method for setting auth cookie
   * HttpOnly, Secure, SameSite ayarlarıyla güvenli cookie oluşturur
   */
  private setAuthCookie(response: Response, token: string) {
    const isProduction = process.env.NODE_ENV === "production";

    response.cookie("access_token", token, {
      httpOnly: true, // JavaScript erişemez (XSS koruması)
      secure: isProduction, // HTTPS only (production)
      sameSite: "strict", // CSRF koruması
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
      path: "/",
    });
  }
}
