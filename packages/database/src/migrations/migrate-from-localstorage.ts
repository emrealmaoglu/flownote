/**
 * LocalStorage to Database Migration Script
 * Sprint 14.2.1 - Day 1-2
 *
 * Migrates legacy localStorage data to Prisma database
 * with validation, topological sorting, and rollback support
 */

import { z } from 'zod';
import { prisma } from '../index';

// Legacy localStorage schemas
const LegacyNoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(), // markdown format
  folderId: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  isFavorite: z.boolean().optional().default(false),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

const LegacyFolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  position: z.number().optional().default(0),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

type LegacyNote = z.infer<typeof LegacyNoteSchema>;
type LegacyFolder = z.infer<typeof LegacyFolderSchema>;

interface MigrationResult {
  success: boolean;
  foldersCreated: number;
  notesCreated: number;
  errors: string[];
}

export class LocalStorageMigration {
  private userId: string;
  private createdFolderIds: string[] = [];
  private createdNoteIds: string[] = [];

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Parse and validate legacy localStorage data
   */
  private parseLegacyData(
    notesJson: string,
    foldersJson: string
  ): { notes: LegacyNote[]; folders: LegacyFolder[] } {
    try {
      const notesData = JSON.parse(notesJson);
      const foldersData = JSON.parse(foldersJson);

      const notes = z.array(LegacyNoteSchema).parse(notesData);
      const folders = z.array(LegacyFolderSchema).parse(foldersData);

      return { notes, folders };
    } catch (error) {
      throw new Error(`Invalid legacy data format: ${error}`);
    }
  }

  /**
   * Topological sort for folder hierarchy
   * Parents must be created before children
   */
  private topologicalSort(folders: LegacyFolder[]): LegacyFolder[] {
    const sorted: LegacyFolder[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const folderMap = new Map(folders.map((f) => [f.id, f]));

    const visit = (folderId: string) => {
      if (visited.has(folderId)) return;
      if (visiting.has(folderId)) {
        throw new Error(`Circular folder dependency detected: ${folderId}`);
      }

      visiting.add(folderId);

      const folder = folderMap.get(folderId);
      if (folder && folder.parentId) {
        visit(folder.parentId);
      }

      visiting.delete(folderId);
      visited.add(folderId);

      if (folder) {
        sorted.push(folder);
      }
    };

    folders.forEach((folder) => visit(folder.id));

    return sorted;
  }

  /**
   * Migrate folders with ID mapping
   */
  private async migrateFolders(
    folders: LegacyFolder[]
  ): Promise<Map<string, string>> {
    const oldToNewIdMap = new Map<string, string>();
    const sortedFolders = this.topologicalSort(folders);

    for (const folder of sortedFolders) {
      const newParentId = folder.parentId
        ? oldToNewIdMap.get(folder.parentId) ?? null
        : null;

      const createdFolder = await prisma.folder.create({
        data: {
          name: folder.name,
          color: folder.color ?? null,
          icon: folder.icon ?? null,
          parentId: newParentId,
          position: folder.position ?? 0,
          userId: this.userId,
          createdAt: new Date(folder.createdAt),
          updatedAt: new Date(folder.updatedAt),
        },
      });

      oldToNewIdMap.set(folder.id, createdFolder.id);
      this.createdFolderIds.push(createdFolder.id);
    }

    return oldToNewIdMap;
  }

  /**
   * Migrate notes with folder references
   */
  private async migrateNotes(
    notes: LegacyNote[],
    folderIdMap: Map<string, string>
  ): Promise<void> {
    for (const note of notes) {
      const newFolderId = note.folderId
        ? folderIdMap.get(note.folderId) ?? null
        : null;

      // Convert markdown to blocks format (simple text block)
      const content = {
        blocks: [
          {
            id: `block-${Date.now()}`,
            type: 'text',
            order: 0,
            data: {
              text: note.content,
              format: 'markdown',
            },
          },
        ],
      };

      // Map legacy fields to new schema
      // Legacy: color, icon, coverImage
      // New: iconEmoji, coverType, coverValue
      const coverType = note.coverImage
        ? 'image'
        : note.color
        ? 'color'
        : 'none';
      const coverValue = note.coverImage ?? note.color ?? null;

      const createdNote = await prisma.note.create({
        data: {
          title: note.title,
          content: JSON.stringify(content),
          iconEmoji: note.icon ?? null,
          coverType,
          coverValue,
          isFavorite: note.isFavorite ?? false,
          folderId: newFolderId,
          userId: this.userId,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        },
      });

      this.createdNoteIds.push(createdNote.id);
    }
  }

  /**
   * Full migration pipeline
   */
  async migrate(
    notesJson: string,
    foldersJson: string
  ): Promise<MigrationResult> {
    const errors: string[] = [];

    try {
      console.log('🔄 Starting migration...');

      // 1. Parse and validate
      console.log('📋 Parsing legacy data...');
      const { notes, folders } = this.parseLegacyData(notesJson, foldersJson);
      console.log(`Found ${folders.length} folders, ${notes.length} notes`);

      // 2. Migrate folders
      console.log('📁 Migrating folders...');
      const folderIdMap = await this.migrateFolders(folders);
      console.log(`✅ Created ${this.createdFolderIds.length} folders`);

      // 3. Migrate notes
      console.log('📝 Migrating notes...');
      await this.migrateNotes(notes, folderIdMap);
      console.log(`✅ Created ${this.createdNoteIds.length} notes`);

      console.log('🎉 Migration completed successfully!');

      return {
        success: true,
        foldersCreated: this.createdFolderIds.length,
        notesCreated: this.createdNoteIds.length,
        errors,
      };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      errors.push(error instanceof Error ? error.message : String(error));

      // Rollback
      console.log('🔙 Rolling back...');
      await this.rollback();

      return {
        success: false,
        foldersCreated: 0,
        notesCreated: 0,
        errors,
      };
    }
  }

  /**
   * Rollback: Delete all created entities
   */
  async rollback(): Promise<void> {
    try {
      if (this.createdNoteIds.length > 0) {
        await prisma.note.deleteMany({
          where: { id: { in: this.createdNoteIds } },
        });
        console.log(`🗑️  Deleted ${this.createdNoteIds.length} notes`);
      }

      if (this.createdFolderIds.length > 0) {
        await prisma.folder.deleteMany({
          where: { id: { in: this.createdFolderIds } },
        });
        console.log(`🗑️  Deleted ${this.createdFolderIds.length} folders`);
      }

      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
    }
  }

  /**
   * Utility: Count words in markdown
   */
  private countWords(markdown: string): number {
    return markdown
      .replace(/[#*_~`>\-\[\]()]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
}

// CLI Interface for testing
async function main() {
  console.log('🚀 LocalStorage Migration Script\n');

  // Demo data for testing
  const demoFolders = JSON.stringify([
    {
      id: 'legacy-folder-1',
      name: 'Personal',
      parentId: null,
      color: '#3b82f6',
      icon: '🏠',
      position: 0,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'legacy-folder-2',
      name: 'Work Projects',
      parentId: null,
      color: '#8b5cf6',
      icon: '💼',
      position: 1,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: 'legacy-folder-3',
      name: 'Q1 2024',
      parentId: 'legacy-folder-2',
      color: '#10b981',
      icon: '📊',
      position: 0,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ]);

  const demoNotes = JSON.stringify([
    {
      id: 'legacy-note-1',
      title: 'My First Note',
      content: '# Welcome to FlowNote\n\nThis is a legacy markdown note.',
      folderId: 'legacy-folder-1',
      color: '#ef4444',
      icon: '📌',
      isFavorite: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-05'),
    },
    {
      id: 'legacy-note-2',
      title: 'Q1 Planning',
      content: '## Objectives\n\n- Launch MVP\n- Get 100 users\n- Iterate',
      folderId: 'legacy-folder-3',
      color: '#10b981',
      icon: '🎯',
      isFavorite: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-04'),
    },
    {
      id: 'legacy-note-3',
      title: 'Random Thoughts',
      content: 'Just some random ideas...',
      folderId: null,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
  ]);

  try {
    // Get or create demo user
    const demoUser = await prisma.user.findUnique({
      where: { username: 'demo' },
    });

    if (!demoUser) {
      console.error('❌ Demo user not found. Run: npm run db:seed');
      process.exit(1);
    }

    console.log(`👤 Migrating data for user: ${demoUser.username}\n`);

    // Run migration
    const migration = new LocalStorageMigration(demoUser.id);
    const result = await migration.migrate(demoNotes, demoFolders);

    // Print results
    console.log('\n📊 Migration Results:');
    console.log(`Success: ${result.success}`);
    console.log(`Folders created: ${result.foldersCreated}`);
    console.log(`Notes created: ${result.notesCreated}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach((err) => console.log(`  - ${err}`));
    }

    console.log('\n💡 Next step: Open Prisma Studio to verify results');
    console.log('   npm run db:studio\n');

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
