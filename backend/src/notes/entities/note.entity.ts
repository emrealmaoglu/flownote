import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

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
@Entity('notes')
export class Note {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    /**
     * KRITIK: JSONB tipinde content
     * Block dizisi içerir: text, heading, checkbox, image, code
     */
    @Column({ type: 'jsonb', default: { blocks: [] } })
    content: {
        blocks: Array<{
            id: string;
            type: 'text' | 'heading' | 'checkbox' | 'image' | 'code';
            order: number;
            data: Record<string, unknown>;
        }>;
    };

    @ManyToOne(() => User, (user) => user.notes, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id', nullable: true })
    userId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

