/**
 * Search Result DTO
 * Command Palette için optimize edildi
 * Sprint 1 - Global Search Feature
 */
export interface SearchResultDto {
    id: string;
    title: string;
    snippet: string;
    matchType: 'title' | 'content';
    score: number;
    updatedAt: string;
}

export interface SearchResponseDto {
    query: string;
    results: SearchResultDto[];
    totalCount: number;
}
