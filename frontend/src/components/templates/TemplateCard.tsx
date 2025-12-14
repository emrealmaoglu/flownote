import React from 'react';
import { FileText, Calendar, ListTodo, Briefcase } from 'lucide-react';
import type { TemplateSummary } from '../../api/templates';

interface TemplateCardProps {
    template: TemplateSummary;
    onSelect: (template: TemplateSummary) => void;
}

/**
 * Get icon based on template category or name
 */
const getTemplateIcon = (template: TemplateSummary) => {
    const name = template.name.toLowerCase();
    if (name.includes('meeting')) return Briefcase;
    if (name.includes('journal') || name.includes('daily')) return Calendar;
    if (name.includes('todo') || name.includes('list')) return ListTodo;
    return FileText;
};

/**
 * Get gradient based on category
 */
const getCategoryGradient = (category: string | null) => {
    switch (category?.toLowerCase()) {
        case 'work':
            return 'from-blue-500 to-indigo-600';
        case 'personal':
            return 'from-purple-500 to-pink-600';
        default:
            return 'from-gray-500 to-gray-700';
    }
};

/**
 * Template Card Component
 * Sprint 3 - Templates System
 * Displays template preview in a card format
 */
export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
    const Icon = getTemplateIcon(template);
    const gradient = getCategoryGradient(template.category);

    return (
        <button
            onClick={() => onSelect(template)}
            className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-left transition-all duration-300 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1"
        >
            {/* Category Badge */}
            {template.category && (
                <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r ${gradient} text-white`}>
                    {template.category}
                </span>
            )}

            {/* Icon */}
            <div className={`mb-3 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${gradient}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                {template.name}
            </h3>

            {/* Description */}
            {template.description && (
                <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {template.description}
                </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{template.blockCount} blocks</span>
                {template.isBuiltin && (
                    <>
                        <span>•</span>
                        <span className="text-indigo-400">Built-in</span>
                    </>
                )}
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </button>
    );
};

export default TemplateCard;
