import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: Add pg_trgm Extension and Search Indexes
 * Sprint 1 - Global Search Feature
 * @DevOps - pg_trgm extension'ı PostgreSQL'de superuser gerektirir
 */
export class AddSearchIndexes1702500000000 implements MigrationInterface {
  name = "AddSearchIndexes1702500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. pg_trgm extension'ı aktifleştir (fuzzy search için)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    // 2. Title üzerinde trigram index (fuzzy search)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_title_trgm 
      ON notes USING GIN (title gin_trgm_ops)
    `);

    // 3. JSONB content üzerinde GIN index (path queries için)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_content_gin 
      ON notes USING GIN (content jsonb_path_ops)
    `);

    // 4. Full-text search için combined search column (opsiyonel performans boost)
    // Not: generated column yerine basit GIN index kullanıyoruz (compat için)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_notes_content_text_trgm 
      ON notes USING GIN ((content::text) gin_trgm_ops)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Indexleri kaldır (extension'ı kaldırmıyoruz, başka tablolarda kullanılıyor olabilir)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notes_content_text_trgm`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notes_content_gin`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notes_title_trgm`);
  }
}
