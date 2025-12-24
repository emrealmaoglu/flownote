import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /**
   * Create a new user with hashed password
   * @throws ConflictException if email or username already exists
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { username, email, password, name, teamId } = createUserDto;

    // Check for existing user
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user entity
    const user = this.userRepository.create({
      username,
      email,
      passwordHash,
      name,
      team: teamId ? { id: teamId } : null,
    });

    const savedUser = await this.userRepository.save(user);

    return new UserResponseDto({
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email!, // email is validated as non-null in DTO/Logic, asserting safely here
      name: savedUser.name,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    });
  }

  /**
   * Find user by ID
   * @throws NotFoundException if user not found
   */
  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['team'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserResponseDto({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.team?.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  /**
   * Find user by email (for auth purposes)
   * Returns null if not found (no exception)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  /**
   * Find user by username
   * Returns null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username, deletedAt: IsNull() },
    });
  }

  /**
   * Get all active users (admin use)
   */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    return users.map(user => new UserResponseDto({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  /**
   * Update user profile
   * @throws NotFoundException if user not found
   * @throws ConflictException if email/username already taken
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if changing
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new ConflictException('Email already registered');
      }
    }

    // Check username uniqueness if changing
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const usernameExists = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (usernameExists) {
        throw new ConflictException('Username already taken');
      }
    }

    // Hash new password if provided
    if (updateUserDto.password) {
      const saltRounds = 10;
      user.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Apply other updates
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.username) user.username = updateUserDto.username;
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.teamId !== undefined) {
      user.team = updateUserDto.teamId ? { id: updateUserDto.teamId } as any : null;
    }

    const savedUser = await this.userRepository.save(user);

    return new UserResponseDto({
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email!,
      name: savedUser.name,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    });
  }

  /**
   * Soft delete user (sets deletedAt timestamp)
   * @throws NotFoundException if user not found or already deleted
   */
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.deletedAt = new Date();
    await this.userRepository.save(user);

    return { message: 'User successfully deleted' };
  }

  /**
   * Restore soft-deleted user
   * @throws NotFoundException if user not found
   */
  async restore(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.deletedAt) {
      throw new ConflictException('User is not deleted');
    }

    user.deletedAt = null;
    const restoredUser = await this.userRepository.save(user);

    return new UserResponseDto({
      id: restoredUser.id,
      username: restoredUser.username,
      email: restoredUser.email!,
      name: restoredUser.name,
      role: restoredUser.role,
      createdAt: restoredUser.createdAt,
      updatedAt: restoredUser.updatedAt,
    });
  }

  /**
   * Hard delete - permanently remove user (admin only)
   */
  async hardDelete(id: string): Promise<{ message: string }> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User permanently deleted' };
  }

  // Existing method
  async getTeamMembers(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['team'],
    });

    if (!user || !user.team) {
      return [];
    }

    // Fetch other members of the same team
    const members = await this.userRepository.find({
      where: { team: { id: user.team.id } },
      select: ['id', 'username', 'name', 'role'], // Don't return passwords
    });

    return members.filter(m => m.id !== userId); // Exclude self
  }
}
