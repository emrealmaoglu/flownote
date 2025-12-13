import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add Search Indexes
 * pg_trgm extension ve trigram index'leri ekler
 * @DevOps approved - Search performance için kritik
 */
export class AddSearchIndexes1702500000000 implements MigrationInterface {
    name = 'AddSearchIndexes1702500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. pg_trgm extension'ı aktifleştir
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

        // 2. Title üzerinde trigram index (fuzzy search için)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_notes_title_trgm 
            ON notes USING GIN (title gin_trgm_ops)
        `);

        // 3. JSONB content üzerinde GIN index (içerik arama için)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_notes_content_gin 
            ON notes USING GIN (content jsonb_path_ops)
        `);

        // 4. Full-text search için content text index
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_notes_content_text_trgm 
            ON notes USING GIN ((content::text) gin_trgm_ops)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_notes_content_text_trgm`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_notes_content_gin`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_notes_title_trgm`);
        // Extension'ı silmiyoruz çünkü başka tablolar kullanıyor olabilir
    }
}
