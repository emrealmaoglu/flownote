import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

/**
 * JWT Strategy
 * Token doğrulama mantığı
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET', 'dev-jwt-secret'),
        });
    }

    /**
     * Token doğrulandığında çağrılır
     * Request'e user bilgisini ekler
     */
    async validate(payload: { sub: string; email: string }) {
        const user = await this.usersRepository.findOne({
            where: { id: payload.sub },
        });

        if (!user) {
            throw new UnauthorizedException('Geçersiz token');
        }

        // passwordHash'i çıkar
        const { passwordHash: _ph, ...userWithoutPassword } = user;
        void _ph;
        return userWithoutPassword;
    }
}
