/**
 * Search DTO - Sprint 1 TDD
 * GET /notes/search endpoint için response tipi
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
