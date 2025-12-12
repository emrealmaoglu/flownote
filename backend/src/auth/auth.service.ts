import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/**
 * AuthService
 * Kullanıcı kimlik doğrulama işlemleri
 * @SecOps - Şifre hashleme zorunlu!
 */
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Kullanıcı kaydı
     * @SecOps - Şifre bcrypt ile hashleniyor
     */
    async register(registerDto: RegisterDto): Promise<{ accessToken: string; user: Omit<User, 'passwordHash'> }> {
        // Email kontrolü
        const existingUser = await this.usersRepository.findOne({
            where: { email: registerDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Bu email adresi zaten kayıtlı');
        }

        // Şifre hashleme - KRITIK!
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

        // Kullanıcı oluştur
        const user = this.usersRepository.create({
            email: registerDto.email,
            passwordHash,
            name: registerDto.name,
        });

        const savedUser = await this.usersRepository.save(user);

        // Token üret
        const payload = { sub: savedUser.id, email: savedUser.email };
        const accessToken = this.jwtService.sign(payload);

        // passwordHash'i çıkar
        const { passwordHash: _ph1, ...userWithoutPassword } = savedUser;
        void _ph1;

        return {
            accessToken,
            user: userWithoutPassword as Omit<User, 'passwordHash'>,
        };
    }

    /**
     * Kullanıcı girişi
     */
    async login(loginDto: LoginDto): Promise<{ accessToken: string; user: Omit<User, 'passwordHash'> }> {
        const user = await this.usersRepository.findOne({
            where: { email: loginDto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Email veya şifre hatalı');
        }

        // Şifre doğrulama
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Email veya şifre hatalı');
        }

        // Token üret
        const payload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);

        // passwordHash'i çıkar
        const { passwordHash: _ph2, ...userWithoutPassword } = user;
        void _ph2;

        return {
            accessToken,
            user: userWithoutPassword as Omit<User, 'passwordHash'>,
        };
    }

    /**
     * ID ile kullanıcı getir (token validation için)
     */
    async validateUser(userId: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id: userId } });
    }
}
