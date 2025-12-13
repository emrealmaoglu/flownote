import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";
import { Note } from "./entities/note.entity";

/**
 * Notes Module
 * Block-based not yönetimi için NestJS modülü
 */
@Module({
  imports: [TypeOrmModule.forFeature([Note])],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
