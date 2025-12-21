import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from 'lucide-react';
import type { SyncStatus as SyncStatusType } from '../hooks/useSyncNote';

interface SyncStatusProps {
    status: SyncStatusType;
    lastSyncAt: Date | null;
    pendingChanges: number;
    onSync?: () => void;
}

/**
 * SyncStatus Component
 * Sprint 14.2.3 - Visual sync status indicator
 */
export function SyncStatus({ status, lastSyncAt, pendingChanges, onSync }: SyncStatusProps) {
    const getStatusIcon = () => {
        switch (status) {
            case 'syncing':
                return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
            case 'offline':
                return <CloudOff className="h-4 w-4 text-gray-400" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'idle':
                return pendingChanges > 0 ? (
                    <Cloud className="h-4 w-4 text-orange-500" />
                ) : (
                    <Check className="h-4 w-4 text-green-500" />
                );
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'syncing':
                return 'Syncing...';
            case 'offline':
                return 'Offline';
            case 'error':
                return 'Sync error';
            case 'idle':
                if (pendingChanges > 0) {
                    return `${pendingChanges} pending`;
                }
                if (lastSyncAt) {
                    const diff = Date.now() - lastSyncAt.getTime();
                    const seconds = Math.floor(diff / 1000);
                    if (seconds < 60) return 'Just now';
                    const minutes = Math.floor(seconds / 60);
                    if (minutes < 60) return `${minutes}m ago`;
                    const hours = Math.floor(minutes / 60);
                    return `${hours}h ago`;
                }
                return 'Not synced';
        }
    };

    return (
        <button
            onClick={onSync}
            disabled={status === 'syncing'}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            title={lastSyncAt ? `Last synced: ${lastSyncAt.toLocaleString()}` : 'Never synced'}
        >
            {getStatusIcon()}
            <span>{getStatusText()}</span>
        </button>
    );
}

export default SyncStatus;
