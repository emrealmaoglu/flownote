import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./admin.controller";
import { User } from "../auth/entities/user.entity";

/**
 * AdminModule
 * Admin panel işlemleri için modül
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AdminController],
})
export class AdminModule {}
