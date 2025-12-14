import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "../auth/entities/user.entity";

/**
 * AdminController
 * Admin panel işlemleri
 * Tüm endpoint'ler admin rolü gerektirir
 */
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * GET /admin/users
   * Tüm kullanıcıları listele
   */
  @Get("users")
  async getUsers() {
    const users = await this.usersRepository.find({
      order: { createdAt: "DESC" },
    });

    // passwordHash'i çıkar
    return users.map((user) => {
      const { passwordHash: _ph, ...userWithoutPassword } = user;
      void _ph;
      return userWithoutPassword;
    });
  }

  /**
   * DELETE /admin/users/:id
   * Kullanıcı sil
   * Kendini silemez
   */
  @Delete("users/:id")
  async deleteUser(
    @Param("id") id: string,
    @CurrentUser() currentUser: Omit<User, "passwordHash">,
  ) {
    // Kendini silmeyi engelle
    if (id === currentUser.id) {
      throw new ForbiddenException("Kendinizi silemezsiniz");
    }

    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      return { message: "Kullanıcı bulunamadı" };
    }

    await this.usersRepository.remove(user);

    return { message: "Kullanıcı silindi", id };
  }
}
