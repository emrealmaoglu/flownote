import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { PrismaService } from '../common/prisma.service';

/**
 * Sync Module
 * Sprint 14.2.3
 */
@Module({
    controllers: [SyncController],
    providers: [SyncService, PrismaService],
    exports: [SyncService],
})
export class SyncModule {}
