import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SyncService } from './sync.service';
import { SyncPullDto, SyncPushDto, SyncRequestDto } from './dto/sync.dto';

/**
 * Sync Controller
 * Sprint 14.2.3 - Sync endpoints
 */
@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
    constructor(private readonly syncService: SyncService) {}

    @Get('pull')
    async pullChanges(@Req() req: any, @Body() dto: SyncPullDto) {
        return this.syncService.pullChanges(req.user.id, dto);
    }

    @Post('push')
    async pushChanges(@Req() req: any, @Body() dto: SyncPushDto) {
        return this.syncService.pushChanges(req.user.id, dto);
    }

    @Post()
    async sync(@Req() req: any, @Body() dto: SyncRequestDto) {
        return this.syncService.sync(req.user.id, dto);
    }

    @Get('status')
    async getStatus(@Req() req: any) {
        return this.syncService.getStatus(req.user.id);
    }
}
