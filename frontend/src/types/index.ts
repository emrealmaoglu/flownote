/**
 * FlowNote Frontend Types
 * Backend ile senkronize tipler (shared/types'dan kopyalandı)
 */

// ============================================
// Block Types
// ============================================

export type BlockType =
    | 'text'
    | 'heading'
    | 'checkbox'
    | 'image'
    | 'code'
    | 'divider'    // Sprint 12
    | 'quote'      // Sprint 12
    | 'callout'    // Sprint 12
    | 'bookmark';  // Sprint 12

// Code Language Types (Sprint 1)
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

// Sprint 1: CodeBlock for syntax highlighting
export interface CodeBlock extends BaseBlock {
    type: 'code';
    data: {
        code: string;
        language: CodeLanguage;
        filename?: string;
    };
}

// Sprint 12: New Block Types - Quick Wins

export interface DividerBlock extends BaseBlock {
    type: 'divider';
    data: Record<string, never>; // Empty data object
}

export interface QuoteBlock extends BaseBlock {
    type: 'quote';
    data: {
        text: string;
        author?: string;
    };
}

export interface CalloutBlock extends BaseBlock {
    type: 'callout';
    data: {
        text: string;
        emoji: string; // Default: 💡
        color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
    };
}

export interface BookmarkBlock extends BaseBlock {
    type: 'bookmark';
    data: {
        url: string;
        title?: string;
        description?: string;
        image?: string;
    };
}

export type Block =
    | TextBlock
    | HeadingBlock
    | CheckboxBlock
    | ImageBlock
    | CodeBlock
    | DividerBlock
    | QuoteBlock
    | CalloutBlock
    | BookmarkBlock;

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
    // Sprint 8: Identity Fields
    iconEmoji?: string;
    coverType?: 'none' | 'gradient' | 'color' | 'image';
    coverValue?: string;
}

export interface NoteSummary {
    id: string;
    title: string;
    blockCount: number;
    createdAt: string;
    updatedAt: string;
    iconEmoji?: string;
}

// ============================================
// API Request Types
// ============================================

export interface CreateNoteRequest {
    title: string;
    content: NoteContent;
    iconEmoji?: string;
    coverType?: 'none' | 'gradient' | 'color' | 'image';
    coverValue?: string;
}

export interface UpdateNoteRequest {
    title?: string;
    content?: NoteContent;
    iconEmoji?: string;
    coverType?: 'none' | 'gradient' | 'color' | 'image';
    coverValue?: string;
}
