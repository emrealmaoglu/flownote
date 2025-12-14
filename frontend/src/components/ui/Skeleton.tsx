import { cn } from '../../lib/utils';

/**
 * Skeleton Component
 * @Designer - Smooth loading states
 */

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-dark-700 rounded',
                className
            )}
        />
    );
}

/**
 * Note Card Skeleton
 */
export function NoteCardSkeleton() {
    return (
        <div className="p-4 rounded-xl bg-dark-800 border border-dark-700">
            <Skeleton className="h-5 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
        </div>
    );
}

/**
 * Note List Skeleton
 */
export function NoteListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <NoteCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Note Detail Skeleton
 */
export function NoteDetailSkeleton() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <Skeleton className="h-10 w-1/2 mb-6" />
            <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
            </div>
        </div>
    );
}

/**
 * Inline Text Skeleton
 */
export function TextSkeleton({ width = 'w-24' }: { width?: string }) {
    return <Skeleton className={cn('h-4 inline-block', width)} />;
}

export default Skeleton;
