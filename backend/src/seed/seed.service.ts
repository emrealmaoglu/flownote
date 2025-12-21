import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Team } from '../users/entities/team.entity';
import { Note } from '../notes/entities/note.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    console.log('Checking database state...');

    // 1. Create or Get Teams
    const teamsData = [
      { name: 'Engineering', description: 'Backend, Frontend, DevOps' },
      { name: 'Product', description: 'Design, PM, Research' },
      { name: 'Marketing', description: 'Growth, Content, Sales' },
    ];

    const teams = [];
    for (const tData of teamsData) {
      let team = await this.teamRepository.findOne({ where: { name: tData.name } });
      if (!team) {
        team = await this.teamRepository.save(tData);
        console.log(`Created team: ${tData.name}`);
      } else {
        console.log(`Team already exists: ${tData.name}`);
      }
      teams.push(team);
    }

    // 2. Create Users (10 users)
    const usersData = [
      { username: 'admin', name: 'Admin User', role: 'admin', teamIdx: 0 },
      { username: 'emre', name: 'Emre Almaoglu', role: 'user', teamIdx: 0 },
      { username: 'ahmet', name: 'Ahmet Yilmaz', role: 'user', teamIdx: 0 },
      { username: 'mehmet', name: 'Mehmet Demir', role: 'user', teamIdx: 0 }, // Engineering
      { username: 'zeynep', name: 'Zeynep Kaya', role: 'user', teamIdx: 1 },
      { username: 'ayse', name: 'Ayse Celik', role: 'user', teamIdx: 1 },
      { username: 'fatma', name: 'Fatma Sahin', role: 'user', teamIdx: 1 }, // Product
      { username: 'can', name: 'Can Ozturk', role: 'user', teamIdx: 2 },
      { username: 'mert', name: 'Mert Koc', role: 'user', teamIdx: 2 },
      { username: 'elif', name: 'Elif Arslan', role: 'user', teamIdx: 2 }, // Marketing
    ];

    for (const userData of usersData) {
      const existingUser = await this.userRepository.findOne({ where: { username: userData.username } });
      if (existingUser) {
          console.log(`User already exists: ${userData.username}`);
          continue;
      }

      // Password = username (Requested by user)
      const passwordHash = await bcrypt.hash(userData.username, 10);
      
      // Match team by index based on teams array order above
      // Note: teams array logic matches usersData teamIdx logic
      const assignedTeam = teams[userData.teamIdx];

      const user = this.userRepository.create({
        username: userData.username,
        email: `${userData.username}@flownote.com`,
        name: userData.name,
        role: userData.role as any,
        passwordHash,
        team: assignedTeam,
      });

      await this.userRepository.save(user);
      console.log(`Created user: ${userData.username}`);

      // 3. Create Notes for each user
      const notes = this.generateNotes(user.id, userData.teamIdx);
      await this.noteRepository.save(notes);
    }

    console.log('Database seeding completed check!');
  }

  private generateNotes(userId: string, teamIdx: number): Partial<Note>[] {
    const commonNotes = [
      { title: 'Welcome to FlowNote', content: { blocks: [{ id: '1', type: 'text', order: 1, data: { text: 'Welcome directly from the seed service!' } }] } },
      { title: 'My Daily Tasks', content: { blocks: [{ id: '1', type: 'text', order: 1, data: { text: '- [ ] Check emails\n- [ ] Update tasks' } }] } },
    ];

    const teamSpecificNotes = [
      // Engineering
      [
        { title: 'API Specifications', content: { blocks: [{ id: '1', type: 'text', order: 1, data: { text: 'Endpoints for v2:\n- POST /auth/login\n- GET /notes' } }] } },
        { title: 'Deployment Pipeline', content: { blocks: [{ id: '1', type: 'text', order: 1, data: { text: 'CI/CD steps using GitHub Actions...' } }] } },
      ],
      // Product
      [
        { title: 'User Research Q4', content: { blocks: [{ id: '1', type: 'text', order: 1, data: { text: 'Interview results from 5 users...' } }] } },
        { title: 'Design System Tokens', content: { blocks: [{ id: '1', type: 'text', order: 1, data: { text: 'Primary Color: #3b82f6\nSpacing: 4px base' } }] } },
      ],
      // Marketing
      [
        { title: 'Social Media Strategy', content: { blocks: [{ id: '1', type: 'text', order: 1, data: { text: 'Twitter threads for launch week...' } }] } },
        { title: 'Blog Post Draft', content: { blocks: [{ id: '1', type: 'text', order: 1, data: { text: 'Introducing FlowNote: The Future of Notes' } }] } },
      ],
    ];

    // Mix common notes + team notes
    const userNotes: any[] = [
        ...commonNotes, 
        ...(teamSpecificNotes[teamIdx] || []),
        { title: 'Inbox Item 1', content: { blocks: [{ id: '1', type: 'text', order: 1, data: { text: 'Quick thought logged.' } }] } }
    ];

    return userNotes.map(n => ({
        ...n,
        userId,
        // Fake dates to make dashboard look alive
        createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
    }));
  }
}
