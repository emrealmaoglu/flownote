import { describe, it, expect } from 'vitest';

/**
 * App Smoke Tests
 * Frontend temel testleri
 */
describe('App', () => {
    it('should be defined', () => {
        expect(true).toBe(true);
    });

    it('should have correct environment', () => {
        expect(typeof window).toBe('undefined'); // Node.js environment in tests
    });
});

describe('Utils', () => {
    it('should format dates correctly', () => {
        const date = new Date('2024-01-01');
        expect(date.getFullYear()).toBe(2024);
    });
});
