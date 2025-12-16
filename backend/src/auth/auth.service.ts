import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  OnModuleInit,
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

/**
 * AuthService
 * Kullanıcı kimlik doğrulama işlemleri
 * @SecOps - Şifre hashleme zorunlu!
 */
@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Module başlatıldığında default kullanıcıları oluştur
   */
  async onModuleInit() {
    await this.seedDefaultUsers();
  }

  /**
   * Default kullanıcıları seed et
   */
  private async seedDefaultUsers() {
    // Admin kullanıcısı
    const adminExists = await this.usersRepository.findOne({
      where: { username: "admin" },
    });

    if (!adminExists) {
      const adminPassword =
        this.configService.get<string>("SEED_ADMIN_PASSWORD") || "admin";
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      const admin = this.usersRepository.create({
        username: "admin",
        email: "admin@flownote.local",
        passwordHash,
        name: "Admin",
        role: "admin" as UserRole,
      });

      await this.usersRepository.save(admin);
      this.logger.log("Admin user seeded: admin / [SEED_ADMIN_PASSWORD]");
    }

    // Emre kullanıcısı
    const emreExists = await this.usersRepository.findOne({
      where: { username: "emre" },
    });

    if (!emreExists) {
      const passwordHash = await bcrypt.hash("emre", 10);

      const emre = this.usersRepository.create({
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", // Fixed ID to prevent token invalidation on DB reset
        username: "emre",
        email: "emrealmaogluu@gmail.com", // Corrected typo in logic if needed, but keeping existing email
        passwordHash,
        name: "Emre",
        role: "user" as UserRole,
      });

      await this.usersRepository.save(emre);
      this.logger.log("User seeded: emre / emre");
    }
  }

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
}
