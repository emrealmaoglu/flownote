import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UnauthorizedException, ConflictException } from "@nestjs/common";
import { UserRole } from "./entities/user.entity";
import { Response } from "express";

/**
 * Auth Controller Unit Tests
 * Tests authentication endpoints (register, login)
 * Sprint 10: Quality Gates - Test Coverage
 * Sprint 11: Updated for HttpOnly cookie support
 */
describe("AuthController", () => {
  let controller: AuthController;
  let service: AuthService;
  let mockResponse: Partial<Response>;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  // Mock Response object for cookie tests
  const createMockResponse = (): Partial<Response> => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    mockResponse = createMockResponse();

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  // ============================================
  // REGISTER Tests
  // ============================================
  describe("register", () => {
    const registerDto: RegisterDto = {
      username: "newuser",
      email: "newuser@example.com",
      password: "SecurePass123!",
      name: "New User",
    };

    const mockServiceResponse = {
      accessToken: "jwt-token-123",
      user: {
        id: "user-123",
        username: "newuser",
        email: "newuser@example.com",
        name: "New User",
        role: "user" as UserRole,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    it("should register a new user successfully", async () => {
      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      const result = await controller.register(
        registerDto,
        mockResponse as Response,
      );

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "access_token",
        mockServiceResponse.accessToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: "strict",
        }),
      );
      expect(result).toEqual({
        user: {
          id: mockServiceResponse.user.id,
          username: mockServiceResponse.user.username,
          email: mockServiceResponse.user.email,
          name: mockServiceResponse.user.name,
          role: mockServiceResponse.user.role,
        },
      });
      expect(result).not.toHaveProperty("accessToken");
    });

    it("should set cookie and return user data without token", async () => {
      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      const result = await controller.register(registerDto, mockResponse as Response);

      expect(result).not.toHaveProperty("accessToken");
      expect(result).toHaveProperty("user");
      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it("should return user without sensitive fields", async () => {
      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      const result = await controller.register(registerDto, mockResponse as Response);

      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user).not.toHaveProperty("password");
      expect(result.user).toHaveProperty("id");
      expect(result.user).toHaveProperty("username");
      expect(result.user).toHaveProperty("email");
      expect(result.user).toHaveProperty("role");
    });

    it("should include all required user fields in response", async () => {
      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      const result = await controller.register(registerDto, mockResponse as Response);

      expect(result.user.id).toBe("user-123");
      expect(result.user.username).toBe("newuser");
      expect(result.user.email).toBe("newuser@example.com");
      expect(result.user.name).toBe("New User");
      expect(result.user.role).toBe("user");
    });

    it("should throw ConflictException for duplicate username", async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException("Bu kullanıcı adı zaten alınmış"),
      );

      await expect(controller.register(registerDto, mockResponse as Response)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw ConflictException for duplicate email", async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException("Bu email adresi zaten kayıtlı"),
      );

      await expect(controller.register(registerDto, mockResponse as Response)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should call service with exact DTO", async () => {
      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      await controller.register(registerDto, mockResponse as Response);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(service.register).toHaveBeenCalledTimes(1);
    });

    it("should propagate service errors", async () => {
      const error = new Error("Database connection failed");
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto, mockResponse as Response)).rejects.toThrow(error);
    });
  });

  // ============================================
  // LOGIN Tests
  // ============================================
  describe("login", () => {
    const loginDto: LoginDto = {
      identifier: "testuser",
      password: "password123",
    };

    const mockServiceResponse = {
      accessToken: "jwt-token-456",
      user: {
        id: "user-456",
        username: "testuser",
        email: "testuser@example.com",
        name: "Test User",
        role: "user" as UserRole,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    it("should login successfully with username", async () => {
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(loginDto, mockResponse as Response);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "access_token",
        mockServiceResponse.accessToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: "strict",
        }),
      );
      expect(result).toEqual({
        user: {
          id: mockServiceResponse.user.id,
          username: mockServiceResponse.user.username,
          email: mockServiceResponse.user.email,
          name: mockServiceResponse.user.name,
          role: mockServiceResponse.user.role,
        },
      });
      expect(result).not.toHaveProperty("accessToken");
    });

    it("should login successfully with email", async () => {
      const emailLoginDto: LoginDto = {
        identifier: "testuser@example.com",
        password: "password123",
      };

      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(emailLoginDto, mockResponse as Response);

      expect(service.login).toHaveBeenCalledWith(emailLoginDto);
      expect(result).not.toHaveProperty("accessToken");
      expect(result).toHaveProperty("user");
    });

    it("should set cookie and return user data without token", async () => {
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(loginDto, mockResponse as Response);

      expect(result).not.toHaveProperty("accessToken");
      expect(result).toHaveProperty("user");
      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it("should return user without sensitive fields", async () => {
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(loginDto, mockResponse as Response);

      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user).not.toHaveProperty("password");
      expect(result.user).toHaveProperty("id");
      expect(result.user).toHaveProperty("username");
      expect(result.user).toHaveProperty("email");
      expect(result.user).toHaveProperty("role");
    });

    it("should include all required user fields in response", async () => {
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(loginDto, mockResponse as Response);

      expect(result.user.id).toBe("user-456");
      expect(result.user.username).toBe("testuser");
      expect(result.user.email).toBe("testuser@example.com");
      expect(result.user.name).toBe("Test User");
      expect(result.user.role).toBe("user");
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException("Kullanıcı adı veya şifre hatalı"),
      );

      await expect(controller.login(loginDto, mockResponse as Response)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException for non-existent user", async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException("Kullanıcı adı veya şifre hatalı"),
      );

      await expect(controller.login(loginDto, mockResponse as Response)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should call service with exact DTO", async () => {
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      await controller.login(loginDto, mockResponse as Response);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(service.login).toHaveBeenCalledTimes(1);
    });

    it("should propagate service errors", async () => {
      const error = new Error("Database connection failed");
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto, mockResponse as Response)).rejects.toThrow(error);
    });

    it("should handle admin role in response", async () => {
      const adminResponse = {
        ...mockServiceResponse,
        user: {
          ...mockServiceResponse.user,
          role: "admin" as UserRole,
        },
      };

      mockAuthService.login.mockResolvedValue(adminResponse);

      const result = await controller.login(loginDto, mockResponse as Response);

      expect(result.user.role).toBe("admin");
    });
  });

  // ============================================
  // RESPONSE FORMAT Tests
  // ============================================
  describe("response formatting", () => {
    it("should format register response consistently (no token in body)", async () => {
      const mockServiceResponse = {
        accessToken: "token",
        user: {
          id: "1",
          username: "user",
          email: "user@example.com",
          name: "User",
          role: "user" as UserRole,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      const result = await controller.register(
        {
          username: "user",
          email: "user@example.com",
          password: "pass",
          name: "User",
        },
        mockResponse as Response,
      );

      expect(Object.keys(result)).toEqual(["user"]);
      expect(Object.keys(result.user)).toEqual([
        "id",
        "username",
        "email",
        "name",
        "role",
      ]);
      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it("should format login response consistently (no token in body)", async () => {
      const mockServiceResponse = {
        accessToken: "token",
        user: {
          id: "1",
          username: "user",
          email: "user@example.com",
          name: "User",
          role: "user" as UserRole,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(
        {
          identifier: "user",
          password: "pass",
        },
        mockResponse as Response,
      );

      expect(Object.keys(result)).toEqual(["user"]);
      expect(Object.keys(result.user)).toEqual([
        "id",
        "username",
        "email",
        "name",
        "role",
      ]);
      expect(mockResponse.cookie).toHaveBeenCalled();
    });

    it("should not include createdAt and updatedAt in response", async () => {
      const mockServiceResponse = {
        accessToken: "token",
        user: {
          id: "1",
          username: "user",
          email: "user@example.com",
          name: "User",
          role: "user" as UserRole,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      const result = await controller.register(
        {
          username: "user",
          email: "user@example.com",
          password: "pass",
          name: "User",
        },
        mockResponse as Response,
      );

      expect(result.user).not.toHaveProperty("createdAt");
      expect(result.user).not.toHaveProperty("updatedAt");
    });
  });
});
