import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
  Res,
  UsePipes,
} from "@nestjs/common";
import { Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthenticatedRequest } from "../common/interfaces";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { LoginSchema, RegisterSchema } from "./dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Register a new user",
    description: "Creates a new user account and returns JWT tokens",
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: "User successfully registered",
    schema: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
          },
        },
        accessToken: { type: "string" },
        refreshToken: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 409, description: "Email already exists" })
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(registerDto);

    // Token'ı HttpOnly cookie olarak set et
    this.setAuthCookie(response, result.accessToken);

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

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Login user",
    description: "Authenticates user and returns JWT tokens",
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "Successfully authenticated",
    schema: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
          },
        },
        accessToken: { type: "string" },
        refreshToken: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    this.setAuthCookie(response, result.accessToken);

    return result;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return { message: "Logged out successfully" };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refresh access token",
    description: "Returns new access token using refresh token",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        refreshToken: { type: "string" },
      },
      required: ["refreshToken"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Token refreshed successfully",
    schema: {
      type: "object",
      properties: {
        accessToken: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async refresh(@Body("refreshToken") refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Get current user",
    description: "Returns the authenticated user profile",
  })
  @ApiResponse({
    status: 200,
    description: "Current user profile",
    schema: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        email: { type: "string", format: "email" },
        name: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.id);
  }

  private setAuthCookie(response: Response, token: string) {
    response.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
  }
}
