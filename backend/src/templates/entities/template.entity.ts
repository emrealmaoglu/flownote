import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../auth/entities/user.entity";

/**
 * Template Entity - Reusable note templates
 * Sprint 3 - Templates System
 *
 * content uses same JSONB structure as Note entity
 */
@Entity("templates")
export class Template {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  description: string | null;

  /**
   * JSONB content - same structure as Note
   * Blocks: text, heading, checkbox, image, code
   */
  @Column({ type: "jsonb", default: { blocks: [] } })
  content: {
    blocks: Array<{
      id: string;
      type: "text" | "heading" | "checkbox" | "image" | "code";
      order: number;
      data: Record<string, unknown>;
    }>;
  };

  /**
   * System templates (builtin) cannot be deleted by users
   */
  @Column({ name: "is_builtin", type: "boolean", default: false })
  isBuiltin: boolean;

  /**
   * Category for grouping templates
   */
  @Column({ type: "varchar", length: 100, nullable: true })
  category: string | null;

  /**
   * Owner - null for builtin templates
   */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user: User | null;

  @Column({ name: "user_id", nullable: true })
  userId: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
