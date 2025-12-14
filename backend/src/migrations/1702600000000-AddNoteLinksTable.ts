import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Add note_links table for bi-directional linking
 * Sprint 2 - Bi-directional Linking Feature
 */
export class AddNoteLinksTa1702600000000 implements MigrationInterface {
  name = "AddNoteLinksTa1702600000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create note_links junction table
    await queryRunner.query(`
            CREATE TABLE "note_links" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "source_note_id" uuid NOT NULL,
                "target_note_id" uuid NOT NULL,
                "link_text" varchar(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_note_links" PRIMARY KEY ("id"),
                CONSTRAINT "FK_note_links_source" FOREIGN KEY ("source_note_id") 
                    REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "FK_note_links_target" FOREIGN KEY ("target_note_id") 
                    REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
                CONSTRAINT "UQ_note_links_source_target" UNIQUE ("source_note_id", "target_note_id")
            )
        `);

    // Create indexes for efficient lookups
    await queryRunner.query(`
            CREATE INDEX "IDX_note_links_source" ON "note_links" ("source_note_id")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_note_links_target" ON "note_links" ("target_note_id")
        `);

    console.log("✅ note_links table created with indexes");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_note_links_target"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_note_links_source"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "note_links"`);

    console.log("🗑️ note_links table dropped");
  }
}
