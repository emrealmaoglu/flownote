import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../auth/entities/user.entity";

/**
 * Note Entity - JSONB content ile block-based yapı
 * @Arch - TECH_SPEC.md'ye uygun olarak tasarlandı
 *
 * content sütunu JSONB tipinde ve şu yapıda:
 * {
 *   blocks: [
 *     { id, type: 'text'|'heading'|'checkbox'|'image', order, data }
 *   ]
 * }
 */
@Entity("notes")
@Index("idx_notes_user_updated", ["userId", "updatedAt"]) // Composite index for user + date queries
export class Note {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  title: string;

  /**
   * KRITIK: JSONB (PostgreSQL) veya simple-json (SQLite)
   * Block dizisi içerir: text, heading, checkbox, image, code
   * SQLite için simple-json kullanılır
   */
  @Column({ type: "simple-json", default: JSON.stringify({ blocks: [] }) })
  content: {
    blocks: Array<{
      id: string;
      type: "text" | "heading" | "checkbox" | "image" | "code";
      order: number;
      data: Record<string, unknown>;
    }>;
  };

  @ManyToOne(() => User, (user) => user.notes, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Index("idx_notes_user_id") // Foreign key index
  @Column({ name: "user_id", nullable: true })
  userId: string;

  @Index("idx_notes_created_at")
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @Index("idx_notes_updated_at")
  @Column({ name: "updated_at" })
  updatedAt: Date;

  // --- Identity Fields (Sprint 8) ---

  @Column({ name: "icon_emoji", type: "text", nullable: true })
  iconEmoji: string | null;

  @Column({ name: "cover_type", type: "text", default: "none" })
  coverType: string; // 'none' | 'gradient' | 'color' | 'image'

  @Column({ name: "cover_value", type: "text", nullable: true })
  coverValue: string | null;

  // --- Favorites (Sprint 12) ---

  @Column({ name: "is_favorite", type: "boolean", default: false })
  isFavorite: boolean;
}
