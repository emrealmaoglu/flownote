import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";
import { Note } from "./entities/note.entity";
import { NoteLink } from "./entities/note-link.entity";

/**
 * Notes Module
 * Block-based not yönetimi için NestJS modülü
 * Sprint 2: NoteLink entity eklendi (Bi-directional Linking)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Note, NoteLink])],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule { }
