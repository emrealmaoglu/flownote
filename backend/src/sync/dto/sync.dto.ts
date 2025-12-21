import { IsOptional, IsNumber, IsArray, IsString } from 'class-validator';

/**
 * Sync DTOs
 * Sprint 14.2.3
 */

export class SyncPullDto {
    @IsOptional()
    @IsNumber()
    since?: number;
}

export class SyncPushDto {
    @IsOptional()
    @IsArray()
    created?: any[];

    @IsOptional()
    @IsArray()
    updated?: any[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    deleted?: string[];
}

export class SyncRequestDto {
    @IsOptional()
    @IsNumber()
    lastSyncAt?: number;

    @IsOptional()
    changes?: {
        created: any[];
        updated: any[];
        deleted: string[];
    };
}
