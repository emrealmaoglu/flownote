import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Note } from "../../notes/entities/note.entity";
import { Team } from "../../users/entities/team.entity";

/**
 * User Roles
 */
export type UserRole = "admin" | "user";

/**
 * User Entity
 * Kullanıcı bilgilerini tutar
 * @SecOps - Şifre hashlenmeli, plain text asla saklanmamalı!
 */
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 50, unique: true })
  username: string;

  @Column({ type: "varchar", length: 255, unique: true, nullable: true })
  email: string | null;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 20, default: "user" })
  role: UserRole;

  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];

  @ManyToOne(() => Team, (team) => team.members, { nullable: true })
  @JoinColumn({ name: "team_id" })
  team: Team | null;

  @Column({ name: "team_id", nullable: true })
  teamId: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date | null;
}
