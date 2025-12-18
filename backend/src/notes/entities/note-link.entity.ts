import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from "typeorm";
import { Note } from "./note.entity";

/**
 * NoteLink Entity
 * Sprint 2 - Bi-directional Linking
 * Junction table for note-to-note references
 */
@Entity("note_links")
@Unique(["sourceNote", "targetNote"])
export class NoteLink {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index("idx_note_links_source") // Index for link queries
  @Column({ name: "source_note_id" })
  sourceNoteId!: string;

  @Index("idx_note_links_target") // Index for backlink queries
  @Column({ name: "target_note_id" })
  targetNoteId!: string;

  @Column({ name: "link_text", nullable: true, length: 255 })
  linkText?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Note, { onDelete: "CASCADE" })
  @JoinColumn({ name: "source_note_id" })
  sourceNote!: Note;

  @ManyToOne(() => Note, { onDelete: "CASCADE" })
  @JoinColumn({ name: "target_note_id" })
  targetNote!: Note;
}
