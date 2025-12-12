/**
 * FlowNote Shared Types
 * @description Frontend ve Backend'in ortak kullandığı tip tanımlamaları
 * @author @Arch
 */

// ============================================
// Block Types - Notion-like block yapısı
// ============================================

/** Desteklenen block tipleri */
export type BlockType = 'text' | 'heading' | 'checkbox' | 'image';

/** Base Block interface - Tüm block'ların temel yapısı */
export interface BaseBlock {
    /** UUID formatında benzersiz ID */
    id: string;
    /** Block tipi - discriminator */
    type: BlockType;
    /** Sıralama için order numarası */
    order: number;
}

/** Text Block - Düz metin */
export interface TextBlock extends BaseBlock {
    type: 'text';
    data: {
        text: string;
    };
}

/** Heading Block - Başlık (h1, h2, h3) */
export interface HeadingBlock extends BaseBlock {
    type: 'heading';
    data: {
        text: string;
        level: 1 | 2 | 3;
    };
}

/** Checkbox Block - Todo item */
export interface CheckboxBlock extends BaseBlock {
    type: 'checkbox';
    data: {
        text: string;
        checked: boolean;
    };
}

/** Image Block - Resim (URL tabanlı) */
export interface ImageBlock extends BaseBlock {
    type: 'image';
    data: {
        url: string;
        alt?: string;
        caption?: string;
    };
}

/** Union type - Tüm block varyantları */
export type Block = TextBlock | HeadingBlock | CheckboxBlock | ImageBlock;

/** Note content yapısı - JSONB'de saklanacak */
export interface NoteContent {
    blocks: Block[];
}

// ============================================
// Note Types - Not entity'si
// ============================================

/** Note entity - Full representation */
export interface Note {
    id: string;
    title: string;
    content: NoteContent;
    userId: string;
    createdAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
}

/** Note summary - Liste görünümü için */
export interface NoteSummary {
    id: string;
    title: string;
    blockCount: number;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// User Types - Kullanıcı entity'si
// ============================================

/** User entity - Auth için */
export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

/** Auth response - Login/Register sonucu */
export interface AuthResponse {
    accessToken: string;
    user: Omit<User, 'createdAt' | 'updatedAt'>;
}

// ============================================
// API Request/Response Types
// ============================================

/** Create Note Request */
export interface CreateNoteRequest {
    title: string;
    content: NoteContent;
}

/** Update Note Request */
export interface UpdateNoteRequest {
    title?: string;
    content?: NoteContent;
}

/** Login Request */
export interface LoginRequest {
    email: string;
    password: string;
}

/** Register Request */
export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

// ============================================
// API Error Response
// ============================================

export interface ApiError {
    statusCode: number;
    message: string | string[];
    error?: string;
}
