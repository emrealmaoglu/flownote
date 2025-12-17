import { KanbanSquare } from 'lucide-react';

export function TasksPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center animate-in fade-in duration-500">
            <div className="bg-dark-900 p-6 rounded-2xl mb-6 shadow-2xl border border-dark-800">
                <KanbanSquare className="w-16 h-16 text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-dark-100 mb-2">Tasks & Projects</h1>
            <p className="text-dark-400 max-w-md mb-8 leading-relaxed">
                We're building a powerful Kanban board to help you organize your workflow directly within FlowNote.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-900 border border-dark-800 text-xs font-medium text-dark-500">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                Coming in Sprint 8
            </div>
        </div>
    );
}

export default TasksPage;
