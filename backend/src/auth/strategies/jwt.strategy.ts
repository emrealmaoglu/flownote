import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Request } from "express";
import { User, UserRole } from "../entities/user.entity";

/**
 * JWT Payload Interface
 */
interface JwtPayload {
  sub: string;
  username: string;
  email: string | null;
  role: UserRole;
}

/**
 * JWT Strategy
 * Token doğrulama mantığı
 * Sprint 11: HttpOnly cookie'den veya Authorization header'dan token okur
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      // Cookie'den VEYA Authorization header'dan token al
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Önce cookie'den dene (HttpOnly)
        (request: Request) => {
          return request?.cookies?.access_token || null;
        },
        // 2. Fallback: Authorization header (API clients, Postman için)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_SECRET", "dev-jwt-secret"),
    });
  }

  /**
   * Token doğrulandığında çağrılır
   * Request'e user bilgisini ekler (role dahil)
   */
  async validate(payload: JwtPayload) {
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException("Geçersiz token");
    }

    // passwordHash'i çıkar, role'ü dahil et
    const { passwordHash: _ph, ...userWithoutPassword } = user;
    void _ph;
    return userWithoutPassword;
  }
}
