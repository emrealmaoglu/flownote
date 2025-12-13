/**
 * Wikilink Parser
 * Sprint 2 - Bi-directional Linking
 * Parses [[wikilink]] syntax in text content
 */

export interface ParsedLink {
  fullMatch: string;
  noteTitle: string;
  startIndex: number;
  endIndex: number;
}

// Regex to match [[Note Title]] syntax
const WIKILINK_REGEX = /\[\[([^\]]+)\]\]/g;

/**
 * Parse wikilinks from text content
 * @param content - Text content to parse
 * @returns Array of parsed links with positions
 */
export function parseWikilinks(content: string): ParsedLink[] {
  const links: ParsedLink[] = [];
  let match;

  // Reset regex state
  WIKILINK_REGEX.lastIndex = 0;

  while ((match = WIKILINK_REGEX.exec(content)) !== null) {
    links.push({
      fullMatch: match[0],
      noteTitle: match[1].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return links;
}

/**
 * Extract all wikilinks from JSONB block content
 * @param blocks - Note content blocks
 * @returns Array of unique note titles referenced
 */
export function extractLinksFromBlocks(
  blocks: Array<{ type: string; data: Record<string, unknown> }>,
): string[] {
  const allLinks: string[] = [];

  for (const block of blocks) {
    let textContent = "";

    // Extract text from different block types
    if (
      block.type === "text" ||
      block.type === "heading" ||
      block.type === "checkbox"
    ) {
      textContent = (block.data.text as string) || "";
    } else if (block.type === "code") {
      // Don't parse code blocks for links
      continue;
    }

    const links = parseWikilinks(textContent);
    allLinks.push(...links.map((l) => l.noteTitle));
  }

  // Return unique titles
  return [...new Set(allLinks)];
}

/**
 * Replace wikilinks with rendered HTML/JSX
 * @param text - Text containing wikilinks
 * @param linkResolver - Function to resolve note title to URL
 * @returns Text with links replaced
 */
export function renderWikilinks(
  text: string,
  linkResolver: (title: string) => string | null,
): string {
  return text.replace(WIKILINK_REGEX, (match, title) => {
    const url = linkResolver(title.trim());
    if (url) {
      return `<a href="${url}" class="wikilink">${title}</a>`;
    }
    // Unresolved link
    return `<span class="wikilink-unresolved">${title}</span>`;
  });
}
