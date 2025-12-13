/**
 * FlowNote Frontend Types
 * Backend ile senkronize tipler (shared/types'dan kopyalandı)
 */

// ============================================
// Block Types
// ============================================

export type BlockType = 'text' | 'heading' | 'checkbox' | 'image' | 'code';

// Code Language Types (10 dil desteği - TDD uyumlu)
export type CodeLanguage =
    | 'javascript'
    | 'typescript'
    | 'python'
    | 'sql'
    | 'bash'
    | 'json'
    | 'html'
    | 'css'
    | 'markdown'
    | 'plaintext';

export interface BaseBlock {
    id: string;
    type: BlockType;
    order: number;
}

export interface TextBlock extends BaseBlock {
    type: 'text';
    data: {
        text: string;
    };
}

export interface HeadingBlock extends BaseBlock {
    type: 'heading';
    data: {
        text: string;
        level: 1 | 2 | 3;
    };
}

export interface CheckboxBlock extends BaseBlock {
    type: 'checkbox';
    data: {
        text: string;
        checked: boolean;
    };
}

export interface ImageBlock extends BaseBlock {
    type: 'image';
    data: {
        url: string;
        alt?: string;
        caption?: string;
    };
}

/**
 * CodeBlock - Sprint 1 eklentisi
 * Syntax highlighting destekli kod bloğu
 */
export interface CodeBlock extends BaseBlock {
    type: 'code';
    data: {
        code: string;
        language: CodeLanguage;
        filename?: string;
    };
}

export type Block = TextBlock | HeadingBlock | CheckboxBlock | ImageBlock | CodeBlock;

export interface NoteContent {
    blocks: Block[];
}

// ============================================
// Note Types
// ============================================

export interface Note {
    id: string;
    title: string;
    content: NoteContent;
    createdAt: string;
    updatedAt: string;
}

export interface NoteSummary {
    id: string;
    title: string;
    blockCount: number;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// API Request Types
// ============================================

export interface CreateNoteRequest {
    title: string;
    content: NoteContent;
}

export interface UpdateNoteRequest {
    title?: string;
    content?: NoteContent;
}
