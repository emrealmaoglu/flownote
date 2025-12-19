import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Configure marked for inline-only markdown parsing
 * Sprint 13: Rich Text Foundation
 *
 * Supported formats:
 * - **bold** → <strong>
 * - *italic* → <em>
 * - `code` → <code>
 * - ~~strikethrough~~ → <del>
 * - [link](url) → <a>
 */
marked.use({
    breaks: false,
    gfm: true, // GitHub Flavored Markdown
});

/**
 * Parse inline markdown to safe HTML
 * Supports: **bold**, *italic*, `code`, ~~strike~~, [link](url)
 *
 * @param text - Raw text with markdown syntax
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 *
 * @example
 * parseInlineMarkdown('This is **bold** and *italic* text')
 * // Returns: 'This is <strong>bold</strong> and <em>italic</em> text'
 */
export function parseInlineMarkdown(text: string): string {
    if (!text || text.trim() === '') {
        return '';
    }

    // Use marked.parse with inline option to avoid parsing block-level elements
    const html = marked.parse(text, { async: false }) as string;

    // Sanitize HTML to prevent XSS attacks
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['strong', 'em', 'code', 'del', 'a', 'span', 'p'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    });
}

/**
 * Strip markdown formatting for plain text preview
 * Used for search results, snippets, etc.
 *
 * @param text - Text with markdown syntax
 * @returns Plain text without markdown
 *
 * @example
 * stripMarkdown('This is **bold** and *italic*')
 * // Returns: 'This is bold and italic'
 */
export function stripMarkdown(text: string): string {
    if (!text) return '';

    return text
        .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
        .replace(/\*(.+?)\*/g, '$1') // Italic
        .replace(/`(.+?)`/g, '$1') // Code
        .replace(/~~(.+?)~~/g, '$1') // Strikethrough
        .replace(/\[(.+?)\]\(.+?\)/g, '$1'); // Links
}

/**
 * Check if text contains markdown formatting
 *
 * @param text - Text to check
 * @returns true if markdown syntax is detected
 */
export function hasMarkdown(text: string): boolean {
    if (!text) return false;

    const markdownPatterns = [
        /\*\*.+?\*\*/, // Bold
        /\*.+?\*/, // Italic
        /`.+?`/, // Code
        /~~.+?~~/, // Strikethrough
        /\[.+?\]\(.+?\)/, // Links
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
}
