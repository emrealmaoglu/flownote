import { Inbox } from 'lucide-react';

export function InboxPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center animate-in fade-in duration-500">
            <div className="bg-dark-900 p-6 rounded-2xl mb-6 shadow-2xl border border-dark-800">
                <Inbox className="w-16 h-16 text-rose-400" />
            </div>
            <h1 className="text-3xl font-bold text-dark-100 mb-2">Inbox</h1>
            <p className="text-dark-400 max-w-md mb-8 leading-relaxed">
                Capture quick thoughts and tasks before organizing them. Your digital scratchpad is being built.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-900 border border-dark-800 text-xs font-medium text-dark-500">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                Coming Soon
            </div>
        </div>
    );
}

export default InboxPage;
