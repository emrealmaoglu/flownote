import { Injectable } from '@nestjs/common';

/**
 * Ana Service - Uygulama durum bilgisi
 */
@Injectable()
export class AppService {
    /**
     * API durum bilgisini döndür
     */
    getStatus(): { status: string; message: string; version: string } {
        return {
            status: 'running',
            message: 'FlowNote API is up and running! 🚀',
            version: '0.0.0', // Semantic Release tarafından güncellenecek
        };
    }
}
