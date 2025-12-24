import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
    let service: UsersService;
    let repository: Repository<User>;

    const mockUserRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getTeamMembers', () => {
        const userId = 'user-1';
        const teamId = 'team-1';

        const mockUser = {
            id: userId,
            username: 'user1',
            team: { id: teamId },
        } as User;

        const mockMembers = [
            { id: userId, username: 'user1', role: 'admin' },
            { id: 'user-2', username: 'user2', role: 'user' },
            { id: 'user-3', username: 'user3', role: 'user' },
        ] as User[];

        it('should return team members excluding self', async () => {
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockUserRepository.find.mockResolvedValue(mockMembers);

            const result = await service.getTeamMembers(userId);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: userId },
                relations: ['team'],
            });
            expect(repository.find).toHaveBeenCalledWith({
                where: { team: { id: teamId } },
                select: ['id', 'username', 'name', 'role'],
            });
            expect(result).toHaveLength(2);
            expect(result).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: userId })]));
            expect(result).toEqual(expect.arrayContaining([
                expect.objectContaining({ id: 'user-2' }),
                expect.objectContaining({ id: 'user-3' }),
            ]));
        });

        it('should return empty array if user has no team', async () => {
            const userNoTeam = { ...mockUser, team: null } as User;
            mockUserRepository.findOne.mockResolvedValue(userNoTeam);

            const result = await service.getTeamMembers(userId);

            expect(repository.findOne).toHaveBeenCalled();
            expect(repository.find).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        it('should return empty array if user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            const result = await service.getTeamMembers('unknown-id');

            expect(repository.findOne).toHaveBeenCalled();
            expect(repository.find).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });
});
