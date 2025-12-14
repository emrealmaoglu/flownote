import React, { useState, useEffect } from 'react';
import { X, Loader2, LayoutTemplate } from 'lucide-react';
import { templatesApi, type TemplateSummary } from '../../api/templates';
import { TemplateCard } from './TemplateCard';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (templateId: string, title: string) => Promise<void>;
}

/**
 * Template Selection Modal
 * Sprint 3 - Templates System
 * Modal for selecting a template when creating a new note
 */
export const TemplateModal: React.FC<TemplateModalProps> = ({
    isOpen,
    onClose,
    onSelect,
}) => {
    const [templates, setTemplates] = useState<TemplateSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateSummary | null>(null);
    const [noteTitle, setNoteTitle] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadTemplates();
        } else {
            // Reset state when closing
            setSelectedTemplate(null);
            setNoteTitle('');
        }
    }, [isOpen]);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const data = await templatesApi.getAll();
            setTemplates(data);
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = (template: TemplateSummary) => {
        setSelectedTemplate(template);
        setNoteTitle(template.name);
    };

    const handleApply = async () => {
        if (!selectedTemplate || !noteTitle.trim()) return;

        setApplying(true);
        try {
            await onSelect(selectedTemplate.id, noteTitle.trim());
            onClose();
        } catch (error) {
            console.error('Failed to apply template:', error);
        } finally {
            setApplying(false);
        }
    };

    const handleBack = () => {
        setSelectedTemplate(null);
        setNoteTitle('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[80vh] bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                            <LayoutTemplate className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                {selectedTemplate ? 'Create from Template' : 'Choose a Template'}
                            </h2>
                            <p className="text-sm text-gray-400">
                                {selectedTemplate
                                    ? 'Enter a title for your new note'
                                    : 'Start with a pre-made template'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                        </div>
                    ) : selectedTemplate ? (
                        /* Title Input View */
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Note Title
                                </label>
                                <input
                                    type="text"
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    placeholder="Enter note title..."
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    autoFocus
                                />
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <p className="text-sm text-gray-400">
                                    Using template: <span className="text-indigo-400 font-medium">{selectedTemplate.name}</span>
                                </p>
                                {selectedTemplate.description && (
                                    <p className="text-xs text-gray-500 mt-1">{selectedTemplate.description}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Template Grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {templates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onSelect={handleTemplateSelect}
                                />
                            ))}
                            {templates.length === 0 && (
                                <div className="col-span-2 text-center py-12 text-gray-500">
                                    No templates available
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {selectedTemplate && (
                    <div className="px-6 py-4 border-t border-gray-800 flex justify-between">
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to templates
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={!noteTitle.trim() || applying}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                            {applying && <Loader2 className="w-4 h-4 animate-spin" />}
                            Create Note
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateModal;
