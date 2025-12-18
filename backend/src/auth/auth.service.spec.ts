import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UnauthorizedException, ConflictException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { User, UserRole } from "./entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

// Mock bcrypt
jest.mock("bcrypt");

/**
 * Auth Service Unit Tests
 * Tests authentication, registration, and token generation
 * Sprint 10: Quality Gates - Test Coverage
 */
describe("AuthService", () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // REGISTER Tests
  // ============================================
  describe("register", () => {
    const registerDto: RegisterDto = {
      username: "newuser",
      email: "newuser@example.com",
      password: "password123",
      name: "New User",
    };

    const mockSavedUser = {
      id: "user-123",
      username: "newuser",
      email: "newuser@example.com",
      passwordHash: "hashedPassword123",
      name: "New User",
      role: "user" as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should successfully register a new user", async () => {
      const expectedToken = "jwt-token-123";

      // Mock: No existing user
      mockUserRepository.findOne.mockResolvedValue(null);

      // Mock: Password hashing
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");

      // Mock: User creation
      mockUserRepository.create.mockReturnValue(mockSavedUser);
      mockUserRepository.save.mockResolvedValue(mockSavedUser);

      // Mock: JWT token generation
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.register(registerDto);

      // Assertions
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2); // username + email check
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: registerDto.username,
        email: registerDto.email,
        passwordHash: "hashedPassword123",
        name: registerDto.name,
        role: "user",
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty("accessToken", expectedToken);
      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user.username).toBe(registerDto.username);
    });

    it("should throw ConflictException if username already exists", async () => {
      // Mock: Existing username
      mockUserRepository.findOne.mockResolvedValue({
        id: "existing-user",
        username: "newuser",
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        "Bu kullanıcı adı zaten alınmış",
      );
    });

    it("should throw ConflictException if email already exists", async () => {
      // Mock: Username available, but email taken
      // Need to mock for both service.register calls (we call it twice for two expects)
      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // first register: username check
        .mockResolvedValueOnce({
          // first register: email check
          id: "existing-user",
          email: "newuser@example.com",
        })
        .mockResolvedValueOnce(null) // second register: username check
        .mockResolvedValueOnce({
          // second register: email check
          id: "existing-user",
          email: "newuser@example.com",
        });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        "Bu email adresi zaten kayıtlı",
      );
    });

    it("should hash password with 10 salt rounds", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPwd");
      mockUserRepository.create.mockReturnValue(mockSavedUser);
      mockUserRepository.save.mockResolvedValue(mockSavedUser);
      mockJwtService.sign.mockReturnValue("token");

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it("should return user without passwordHash field", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPwd");
      mockUserRepository.create.mockReturnValue(mockSavedUser);
      mockUserRepository.save.mockResolvedValue(mockSavedUser);
      mockJwtService.sign.mockReturnValue("token");

      const result = await service.register(registerDto);

      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user).toHaveProperty("id");
      expect(result.user).toHaveProperty("username");
      expect(result.user).toHaveProperty("email");
    });

    it("should include correct payload in JWT token", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPwd");
      mockUserRepository.create.mockReturnValue(mockSavedUser);
      mockUserRepository.save.mockResolvedValue(mockSavedUser);
      mockJwtService.sign.mockReturnValue("token");

      await service.register(registerDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockSavedUser.id,
        username: mockSavedUser.username,
        email: mockSavedUser.email,
        role: mockSavedUser.role,
      });
    });

    it("should assign 'user' role to new registrations", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPwd");
      mockUserRepository.create.mockReturnValue(mockSavedUser);
      mockUserRepository.save.mockResolvedValue(mockSavedUser);
      mockJwtService.sign.mockReturnValue("token");

      await service.register(registerDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "user",
        }),
      );
    });
  });

  // ============================================
  // LOGIN Tests
  // ============================================
  describe("login", () => {
    const mockUser = {
      id: "user-123",
      username: "testuser",
      email: "test@example.com",
      passwordHash: "hashedPassword123",
      name: "Test User",
      role: "user" as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should successfully login with email", async () => {
      const loginDto: LoginDto = {
        identifier: "test@example.com",
        password: "password123",
      };
      const expectedToken = "jwt-token-123";

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.identifier },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash,
      );
      expect(result).toHaveProperty("accessToken", expectedToken);
      expect(result.user).not.toHaveProperty("passwordHash");
    });

    it("should successfully login with username", async () => {
      const loginDto: LoginDto = {
        identifier: "testuser",
        password: "password123",
      };
      const expectedToken = "jwt-token-456";

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: loginDto.identifier },
      });
      expect(result).toHaveProperty("accessToken", expectedToken);
    });

    it("should distinguish between email and username by @ symbol", async () => {
      const emailLogin: LoginDto = {
        identifier: "user@example.com",
        password: "pwd",
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue("token");

      await service.login(emailLogin);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: "user@example.com" },
      });
    });

    it("should throw UnauthorizedException if user not found", async () => {
      const loginDto: LoginDto = {
        identifier: "nonexistent@example.com",
        password: "password123",
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        "Kullanıcı adı veya şifre hatalı",
      );
    });

    it("should throw UnauthorizedException if password is invalid", async () => {
      const loginDto: LoginDto = {
        identifier: "test@example.com",
        password: "wrongpassword",
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        "Kullanıcı adı veya şifre hatalı",
      );
    });

    it("should return user without passwordHash field", async () => {
      const loginDto: LoginDto = {
        identifier: "test@example.com",
        password: "password123",
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue("token");

      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty("passwordHash");
      expect(result.user).toHaveProperty("id");
      expect(result.user).toHaveProperty("username");
      expect(result.user).toHaveProperty("email");
      expect(result.user).toHaveProperty("role");
    });

    it("should include correct payload in JWT token", async () => {
      const loginDto: LoginDto = {
        identifier: "test@example.com",
        password: "password123",
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue("token");

      await service.login(loginDto);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it("should include role in JWT payload", async () => {
      const adminUser = {
        ...mockUser,
        role: "admin" as UserRole,
      };

      mockUserRepository.findOne.mockResolvedValue(adminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue("token");

      await service.login({
        identifier: "admin@example.com",
        password: "adminpass",
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "admin",
        }),
      );
    });
  });

  // ============================================
  // VALIDATE USER Tests
  // ============================================
  describe("validateUser", () => {
    it("should return user when valid userId is provided", async () => {
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        role: "user" as UserRole,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser("user-123");

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser("nonexistent-id");

      expect(result).toBeNull();
    });

    it("should query by user id", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await service.validateUser("specific-user-id");

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: "specific-user-id" },
      });
    });
  });

  // ============================================
  // PASSWORD SECURITY Tests
  // ============================================
  describe("password security", () => {
    it("should use bcrypt for password hashing", async () => {
      const registerDto: RegisterDto = {
        username: "secureuser",
        email: "secure@example.com",
        password: "MySecurePass123!",
        name: "Secure User",
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
      mockUserRepository.create.mockReturnValue({});
      mockUserRepository.save.mockResolvedValue({
        id: "user-123",
        username: "secureuser",
        email: "secure@example.com",
        passwordHash: "hashed",
        role: "user",
      });
      mockJwtService.sign.mockReturnValue("token");

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        registerDto.password,
        expect.any(Number),
      );
    });

    it("should use bcrypt.compare for password verification", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        passwordHash: "hashedPassword",
        role: "user" as UserRole,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue("token");

      await service.login({
        identifier: "test@example.com",
        password: "plainPassword",
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "plainPassword",
        "hashedPassword",
      );
    });

    it("should never return passwordHash in responses", async () => {
      // Test register
      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
      mockUserRepository.create.mockReturnValue({});
      mockUserRepository.save.mockResolvedValue({
        id: "user-123",
        username: "user",
        email: "user@example.com",
        passwordHash: "shouldNotBeReturned",
        role: "user",
      });
      mockJwtService.sign.mockReturnValue("token");

      const registerResult = await service.register({
        username: "user",
        email: "user@example.com",
        password: "pass",
        name: "User",
      });

      expect(registerResult.user).not.toHaveProperty("passwordHash");

      // Test login
      mockUserRepository.findOne.mockResolvedValue({
        id: "user-123",
        email: "user@example.com",
        passwordHash: "shouldNotBeReturned",
        role: "user",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const loginResult = await service.login({
        identifier: "user@example.com",
        password: "pass",
      });

      expect(loginResult.user).not.toHaveProperty("passwordHash");
    });
  });
});
