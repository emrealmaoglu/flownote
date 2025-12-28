import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User, UserRole } from "./entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { v4 as uuidv4 } from "uuid";

/**
 * AuthService
 * Kullanıcı kimlik doğrulama işlemleri
 * @SecOps - Şifre hashleme zorunlu!
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Kullanıcı kaydı
   * @SecOps - Şifre bcrypt ile hashleniyor
   */
  async register(
    registerDto: RegisterDto,
  ): Promise<{ accessToken: string; user: Omit<User, "passwordHash"> }> {
    // Username kontrolü
    const existingUsername = await this.usersRepository.findOne({
      where: { username: registerDto.username },
    });

    if (existingUsername) {
      throw new ConflictException("Bu kullanıcı adı zaten alınmış");
    }

    // Email kontrolü
    const existingEmail = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingEmail) {
      throw new ConflictException("Bu email adresi zaten kayıtlı");
    }

    // Şifre hashleme - KRITIK!
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Kullanıcı oluştur
    const user = this.usersRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      passwordHash,
      name: registerDto.name,
      role: "user" as UserRole,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await this.usersRepository.save(user);

    // Token üret
    const payload = {
      sub: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
    };
    const accessToken = this.jwtService.sign(payload);

    // passwordHash'i çıkar
    const { passwordHash: _ph1, ...userWithoutPassword } = savedUser;
    void _ph1;

    return {
      accessToken,
      user: userWithoutPassword as Omit<User, "passwordHash">,
    };
  }

  /**
   * Kullanıcı girişi
   * identifier: username veya email olabilir
   */
  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: Omit<User, "passwordHash"> }> {
    const { identifier, password } = loginDto;

    // Username veya email ile ara
    let user: User | null = null;

    // Email formatında mı kontrol et
    if (identifier.includes("@")) {
      user = await this.usersRepository.findOne({
        where: { email: identifier },
      });
    } else {
      user = await this.usersRepository.findOne({
        where: { username: identifier },
      });
    }

    if (!user) {
      throw new UnauthorizedException("Kullanıcı adı veya şifre hatalı");
    }

    // Şifre doğrulama
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Kullanıcı adı veya şifre hatalı");
    }

    // Token üret - role bilgisi dahil
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    // passwordHash'i çıkar
    const { passwordHash: _ph2, ...userWithoutPassword } = user;
    void _ph2;

    return {
      accessToken,
      user: userWithoutPassword as Omit<User, "passwordHash">,
    };
  }

  /**
   * ID ile kullanıcı getir (token validation için)
   */
  async validateUser(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: userId } });
  }

  /**
   * Refresh Token ile yeni Access Token al
   */
  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.validateUser(payload.sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      const newPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      return {
        accessToken: this.jwtService.sign(newPayload),
      };
    } catch (e) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * Kullanıcı profili getir
   */
  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }
}
