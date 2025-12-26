import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UsersService } from "./users.service";
import { User, UserRole } from "../auth/entities/user.entity";
import { CreateUserDto } from "./dto";

// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue("salt"),
}));

describe("UsersService", () => {
  let service: UsersService;
  // repository removed

  const mockUser: Partial<User> = {
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
    passwordHash: "hashed_password",
    name: "Test User",
    role: "user" as UserRole,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    team: { id: "team-1" } as any,
  };

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    // repository assignment removed as unused

    // CRITICAL: Reset repository mocks to clear unconsumed 'mockResolvedValueOnce' queues
    mockRepository.findOne.mockReset();
    mockRepository.find.mockReset();
    mockRepository.create.mockReset();
    mockRepository.save.mockReset();
    mockRepository.delete.mockReset();

    // Clear global spies (like bcrypt)
    jest.clearAllMocks();

    // Reset mockUser state in case of leaked mutation
    mockUser.deletedAt = null;
  });

  describe("create", () => {
    const createUserDto: CreateUserDto = {
      username: "newuser",
      email: "new@example.com",
      password: "Password123",
      name: "New User",
    };

    it("should create a new user successfully", async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ ...mockUser });
      mockRepository.save.mockResolvedValue({ ...mockUser });

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty("passwordHash");
      expect(bcrypt.hash).toHaveBeenCalledWith("Password123", 10);
    });

    it("should throw ConflictException if email exists", async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockUser,
        email: createUserDto.email,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        "Email already registered",
      );
    });

    it("should throw ConflictException if username exists", async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockUser,
        username: createUserDto.username,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        "Username already taken",
      );
    });
  });

  describe("findById", () => {
    it("should return user by id", async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockUser });

      const result = await service.findById("user-123");

      expect(result).toBeDefined();
      expect(result.id).toBe("user-123");
      expect(result).not.toHaveProperty("passwordHash");
    });

    it("should throw NotFoundException if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByEmail", () => {
    it("should return user with password for auth", async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockUser });

      const result = await service.findByEmail("test@example.com");

      expect(result).toBeDefined();
      expect(result?.passwordHash).toBe("hashed_password");
    });

    it("should return null if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail("notfound@example.com");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return array of users without passwords", async () => {
      mockRepository.find.mockResolvedValue([
        { ...mockUser },
        { ...mockUser, id: "user-456" },
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty("passwordHash");
    });

    it("should return empty array if no users", async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    it("should update user successfully", async () => {
      // In this test, we only update name, so unique checks (findOne) are skipped
      // But we mock findOneOnce just for the initial user lookup
      mockRepository.findOne.mockResolvedValueOnce({ ...mockUser });
      mockRepository.save.mockResolvedValue({
        ...mockUser,
        name: "Updated Name",
      });

      const result = await service.update("user-123", { name: "Updated Name" });

      expect(result.name).toBe("Updated Name");
    });

    it("should hash password if provided", async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockUser });
      mockRepository.save.mockResolvedValue({ ...mockUser });

      await service.update("user-123", { password: "NewPassword123" });

      expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword123", 10);
    });

    it("should throw ConflictException if new email exists", async () => {
      mockRepository.findOne
        .mockResolvedValueOnce({ ...mockUser }) // find user
        .mockResolvedValueOnce({ ...mockUser, id: "other-user" }); // email taken

      await expect(
        service.update("user-123", { email: "taken@example.com" }),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw NotFoundException if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update("invalid-id", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove (soft delete)", () => {
    it("should set deletedAt timestamp", async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockUser });
      mockRepository.save.mockResolvedValue({
        ...mockUser,
        deletedAt: new Date(),
      });

      const result = await service.remove("user-123");

      expect(result.message).toBe("User successfully deleted");
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("restore", () => {
    it("should clear deletedAt timestamp", async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      mockRepository.findOne.mockResolvedValue(deletedUser);
      mockRepository.save.mockResolvedValue({ ...mockUser, deletedAt: null });

      const result = await service.restore("user-123");

      expect(result).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should throw ConflictException if user not deleted", async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockUser,
        deletedAt: null,
      });

      await expect(service.restore("user-123")).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("hardDelete", () => {
    it("should permanently delete user", async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.hardDelete("user-123");

      expect(result.message).toBe("User permanently deleted");
    });

    it("should throw NotFoundException if user not found", async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.hardDelete("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getTeamMembers", () => {
    const userId = "user-123";
    const teamId = "team-1";

    const mockMembers = [
      { ...mockUser, id: userId, role: "admin" },
      { ...mockUser, id: "user-456", username: "user2", role: "user" },
      { ...mockUser, id: "user-789", username: "user3", role: "user" },
    ] as User[];

    it("should return team members excluding self", async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockUser } as User);
      mockRepository.find.mockResolvedValue(mockMembers);

      const result = await service.getTeamMembers(userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ["team"],
      });
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { team: { id: teamId } },
        select: ["id", "username", "name", "role"],
      });
      // Logic excludes self
      expect(result.length).toBe(2);
      expect(result).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: userId })]),
      );
    });

    it("should return empty array if user has no team", async () => {
      const userNoTeam = { ...mockUser, team: null } as User;
      mockRepository.findOne.mockResolvedValue(userNoTeam);

      const result = await service.getTeamMembers(userId);

      expect(result).toEqual([]);
    });

    it("should return empty array if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getTeamMembers("unknown-id");

      expect(result).toEqual([]);
    });
  });
});
