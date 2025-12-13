import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * AddSearchIndexes Migration
 * pg_trgm extension ve search indexleri ekler
 * @Arch - ADR-001 referansı ile tasarlandı
 */
export class AddSearchIndexes1702500000000 implements MigrationInterface {
    name = 'AddSearchIndexes1702500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. pg_trgm extension'ı aktifleştir (fuzzy search için)
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

        // 2. Title üzerinde trigram index (fuzzy title search)
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_title_trgm 
      ON notes USING GIN (title gin_trgm_ops)
    `);

        // 3. JSONB content üzerinde GIN index (content search)
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_content_gin 
      ON notes USING GIN (content jsonb_path_ops)
    `);

        // 4. Full-text search için combined text index (opsiyonel, performans için)
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_content_text_trgm 
      ON notes USING GIN ((content::text) gin_trgm_ops)
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Indexleri kaldır (ters sıra)
        await queryRunner.query(`DROP INDEX IF EXISTS idx_notes_content_text_trgm`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_notes_content_gin`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_notes_title_trgm`);

        // Extension'ı kaldırma - diğer tablolar kullanıyor olabilir
        // await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm`);
    }
}
