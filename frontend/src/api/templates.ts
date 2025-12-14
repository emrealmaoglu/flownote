import { apiClient } from './client';

/**
 * Template Types
 * Sprint 3 - Templates System
 */
export interface TemplateSummary {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    isBuiltin: boolean;
    blockCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Template {
    id: string;
    name: string;
    description: string | null;
    content: {
        blocks: Array<{
            id: string;
            type: 'text' | 'heading' | 'checkbox' | 'image' | 'code';
            order: number;
            data: Record<string, unknown>;
        }>;
    };
    category: string | null;
    isBuiltin: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTemplateRequest {
    name: string;
    description?: string | null;
    content: Template['content'];
    category?: string | null;
}

export interface ApplyTemplateRequest {
    title: string;
}

/**
 * Templates API
 * Sprint 3 - Templates System
 */
export const templatesApi = {
    /**
     * Get all templates (builtin + user's)
     */
    async getAll(): Promise<TemplateSummary[]> {
        const response = await apiClient.get<{ templates: TemplateSummary[] }>('/templates');
        return response.data.templates;
    },

    /**
     * Get template by ID (full content)
     */
    async getById(id: string): Promise<Template> {
        const response = await apiClient.get<Template>(`/templates/${id}`);
        return response.data;
    },

    /**
     * Create a new template
     */
    async create(data: CreateTemplateRequest): Promise<Template> {
        const response = await apiClient.post<Template>('/templates', data);
        return response.data;
    },

    /**
     * Update template
     */
    async update(id: string, data: Partial<CreateTemplateRequest>): Promise<Template> {
        const response = await apiClient.put<Template>(`/templates/${id}`, data);
        return response.data;
    },

    /**
     * Delete template
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/templates/${id}`);
    },

    /**
     * Apply template to create a new note
     */
    async apply(id: string, data: ApplyTemplateRequest): Promise<{
        id: string;
        title: string;
        content: Template['content'];
        createdAt: string;
        updatedAt: string;
    }> {
        const response = await apiClient.post(`/templates/${id}/apply`, data);
        return response.data;
    },
};

export default templatesApi;
