import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { SyncPullDto, SyncPushDto, SyncRequestDto } from "./dto/sync.dto";

/**
 * Sync Service
 * Sprint 14.2.3 - Bidirectional sync logic
 */
@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  /**
   * Pull changes from server since last sync
   */
  async pullChanges(userId: string, dto: SyncPullDto) {
    const since = dto.since ? new Date(dto.since) : new Date(0);

    const [notes, folders, deletedNotes, deletedFolders] = await Promise.all([
      // Get updated notes
      this.prisma.client.note.findMany({
        where: {
          userId,
          updatedAt: { gte: since },
        },
        orderBy: { updatedAt: "asc" },
      }),

      // Get updated folders
      this.prisma.client.folder.findMany({
        where: {
          userId,
          updatedAt: { gte: since },
        },
        orderBy: { updatedAt: "asc" },
      }),

      // Get deleted notes (if you track deletions)
      // For now, return empty array
      Promise.resolve([]),

      // Get deleted folders
      Promise.resolve([]),
    ]);

    return {
      notes,
      folders,
      deletedNoteIds: deletedNotes,
      deletedFolderIds: deletedFolders,
      timestamp: Date.now(),
    };
  }

  /**
   * Push local changes to server
   */
  async pushChanges(userId: string, dto: SyncPushDto) {
    const { created = [], updated = [], deleted = [] } = dto;

    // Process created items
    const createdNotes = created.filter((item: any) => item.type === "note");
    const createdFolders = created.filter(
      (item: any) => item.type === "folder",
    );

    // Process updated items
    const updatedNotes = updated.filter((item: any) => item.type === "note");
    const updatedFolders = updated.filter(
      (item: any) => item.type === "folder",
    );

    // Create new records
    if (createdNotes.length > 0) {
      await this.prisma.client.note.createMany({
        data: createdNotes.map((note: any) => ({
          ...note,
          userId,
        })),
        skipDuplicates: true,
      } as any);
    }

    if (createdFolders.length > 0) {
      await this.prisma.client.folder.createMany({
        data: createdFolders.map((folder: any) => ({
          ...folder,
          userId,
        })),
        skipDuplicates: true,
      } as any);
    }

    // Update existing records
    for (const note of updatedNotes) {
      await this.prisma.client.note.update({
        where: { id: note.id },
        data: note,
      });
    }

    for (const folder of updatedFolders) {
      await this.prisma.client.folder.update({
        where: { id: folder.id },
        data: folder,
      });
    }

    // Delete records
    if (deleted.length > 0) {
      await this.prisma.client.note.deleteMany({
        where: {
          id: { in: deleted },
          userId,
        },
      });
    }

    return {
      success: true,
      processed: {
        created: created.length,
        updated: updated.length,
        deleted: deleted.length,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Full bidirectional sync
   */
  async sync(userId: string, dto: SyncRequestDto) {
    // Push local changes first
    if (dto.changes) {
      await this.pushChanges(userId, {
        created: dto.changes.created,
        updated: dto.changes.updated,
        deleted: dto.changes.deleted,
      });
    }

    // Then pull server changes
    const serverChanges = await this.pullChanges(userId, {
      since: dto.lastSyncAt,
    });

    return serverChanges;
  }

  /**
   * Get sync status
   */
  async getStatus(userId: string) {
    const [noteCount, folderCount, lastNote] = await Promise.all([
      this.prisma.client.note.count({ where: { userId } }),
      this.prisma.client.folder.count({ where: { userId } }),
      this.prisma.client.note.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ]);

    return {
      noteCount,
      folderCount,
      lastSyncAt: lastNote?.updatedAt?.getTime() || null,
      pendingChanges: 0,
      conflicts: 0,
    };
  }
}
