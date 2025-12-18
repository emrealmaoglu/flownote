import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UnauthorizedException, ConflictException } from "@nestjs/common";
import { UserRole } from "./entities/user.entity";

/**
 * Auth Controller Unit Tests
 * Tests authentication endpoints (register, login)
 * Sprint 10: Quality Gates - Test Coverage
 */
describe("AuthController", () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
  };

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

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        accessToken: mockServiceResponse.accessToken,
        user: {
          id: mockServiceResponse.user.id,
          username: mockServiceResponse.user.username,
          email: mockServiceResponse.user.email,
          name: mockServiceResponse.user.name,
          role: mockServiceResponse.user.role,
        },
      });
    });

    it("should return access token and user data", async () => {
      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("user");
      expect(result.accessToken).toBe("jwt-token-123");
    });

    it("should return user without sensitive fields", async () => {
      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      const result = await controller.register(registerDto);

      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user).not.toHaveProperty("password");
      expect(result.user).toHaveProperty("id");
      expect(result.user).toHaveProperty("username");
      expect(result.user).toHaveProperty("email");
      expect(result.user).toHaveProperty("role");
    });

    it("should include all required user fields in response", async () => {
      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      const result = await controller.register(registerDto);

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

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw ConflictException for duplicate email", async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException("Bu email adresi zaten kayıtlı"),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should call service with exact DTO", async () => {
      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(service.register).toHaveBeenCalledTimes(1);
    });

    it("should propagate service errors", async () => {
      const error = new Error("Database connection failed");
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(error);
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

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        accessToken: mockServiceResponse.accessToken,
        user: {
          id: mockServiceResponse.user.id,
          username: mockServiceResponse.user.username,
          email: mockServiceResponse.user.email,
          name: mockServiceResponse.user.name,
          role: mockServiceResponse.user.role,
        },
      });
    });

    it("should login successfully with email", async () => {
      const emailLoginDto: LoginDto = {
        identifier: "testuser@example.com",
        password: "password123",
      };

      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(emailLoginDto);

      expect(service.login).toHaveBeenCalledWith(emailLoginDto);
      expect(result).toHaveProperty("accessToken");
    });

    it("should return access token and user data", async () => {
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("user");
      expect(result.accessToken).toBe("jwt-token-456");
    });

    it("should return user without sensitive fields", async () => {
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(loginDto);

      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user).not.toHaveProperty("password");
      expect(result.user).toHaveProperty("id");
      expect(result.user).toHaveProperty("username");
      expect(result.user).toHaveProperty("email");
      expect(result.user).toHaveProperty("role");
    });

    it("should include all required user fields in response", async () => {
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      const result = await controller.login(loginDto);

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

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException for non-existent user", async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException("Kullanıcı adı veya şifre hatalı"),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should call service with exact DTO", async () => {
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(service.login).toHaveBeenCalledTimes(1);
    });

    it("should propagate service errors", async () => {
      const error = new Error("Database connection failed");
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
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

      const result = await controller.login(loginDto);

      expect(result.user.role).toBe("admin");
    });
  });

  // ============================================
  // RESPONSE FORMAT Tests
  // ============================================
  describe("response formatting", () => {
    it("should format register response consistently", async () => {
      const mockResponse = {
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

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register({
        username: "user",
        email: "user@example.com",
        password: "pass",
        name: "User",
      });

      expect(Object.keys(result)).toEqual(["accessToken", "user"]);
      expect(Object.keys(result.user)).toEqual([
        "id",
        "username",
        "email",
        "name",
        "role",
      ]);
    });

    it("should format login response consistently", async () => {
      const mockResponse = {
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

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login({
        identifier: "user",
        password: "pass",
      });

      expect(Object.keys(result)).toEqual(["accessToken", "user"]);
      expect(Object.keys(result.user)).toEqual([
        "id",
        "username",
        "email",
        "name",
        "role",
      ]);
    });

    it("should not include createdAt and updatedAt in response", async () => {
      const mockResponse = {
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

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register({
        username: "user",
        email: "user@example.com",
        password: "pass",
        name: "User",
      });

      expect(result.user).not.toHaveProperty("createdAt");
      expect(result.user).not.toHaveProperty("updatedAt");
    });
  });
});
