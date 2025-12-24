import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

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
