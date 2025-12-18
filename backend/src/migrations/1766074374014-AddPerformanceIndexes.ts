import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPerformanceIndexes1766074374014 implements MigrationInterface {
    name = 'AddPerformanceIndexes1766074374014';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Notes tablosu indexleri
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_notes_user_id"
            ON "notes" ("userId")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_notes_created_at"
            ON "notes" ("createdAt" DESC)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_notes_updated_at"
            ON "notes" ("updatedAt" DESC)
        `);

        // Note links tablosu indexleri
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_note_links_source"
            ON "note_links" ("sourceNoteId")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_note_links_target"
            ON "note_links" ("targetNoteId")
        `);

        // Composite index for user + date queries
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "idx_notes_user_updated"
            ON "notes" ("userId", "updatedAt" DESC)
        `);

        console.log('✅ Performance indexes created successfully');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_notes_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_notes_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_notes_updated_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_note_links_source"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_note_links_target"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_notes_user_updated"`);
    }

}
