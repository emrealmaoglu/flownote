import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SeedService } from "./seed.service";
import { User } from "../auth/entities/user.entity";
import { Team } from "../users/entities/team.entity";
import { Note } from "../notes/entities/note.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Team, Note])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
