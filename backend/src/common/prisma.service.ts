import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prisma } from '@flownote/database';

/**
 * Prisma Service for NestJS
 * Sprint 14.2.3 - Prisma integration
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    // Expose prisma client
    get client() {
        return prisma;
    }

    async onModuleInit() {
        await prisma.$connect();
        console.log('✅ Prisma connected');
    }

    async onModuleDestroy() {
        await prisma.$disconnect();
        console.log('✅ Prisma disconnected');
    }

    // Helper methods
    async healthCheck(): Promise<boolean> {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }
}
