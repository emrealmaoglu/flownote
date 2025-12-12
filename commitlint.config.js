/**
 * Commitlint Configuration
 * Conventional Commits standardını zorunlu kılar
 * @DevOps - Semantic Versioning depends on this!
 *
 * Geçerli commit formatları:
 * - feat: yeni özellik
 * - fix: bug düzeltme
 * - docs: dokümantasyon
 * - style: formatting
 * - refactor: kod yeniden yapılandırma
 * - perf: performans iyileştirme
 * - test: test ekleme/düzeltme
 * - chore: bakım işleri
 * - ci: CI/CD değişiklikleri
 * - build: build sistemi değişiklikleri
 *
 * Örnek: feat(notes): add block editor component
 */
module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // Type zorunlu
        'type-empty': [2, 'never'],
        // Type küçük harf
        'type-case': [2, 'always', 'lower-case'],
        // Geçerli type'lar
        'type-enum': [
            2,
            'always',
            [
                'feat',     // Yeni özellik
                'fix',      // Bug fix
                'docs',     // Dokümantasyon
                'style',    // Formatting
                'refactor', // Kod yeniden yapılandırma
                'perf',     // Performans
                'test',     // Test
                'chore',    // Bakım
                'ci',       // CI/CD
                'build',    // Build sistemi
                'revert',   // Geri alma
            ],
        ],
        // Subject zorunlu
        'subject-empty': [2, 'never'],
        // Subject büyük harfle başlamaz
        'subject-case': [2, 'always', 'lower-case'],
        // Subject nokta ile bitmez
        'subject-full-stop': [2, 'never', '.'],
        // Header max 100 karakter
        'header-max-length': [2, 'always', 100],
        // Body line length - disabled for semantic-release
        'body-max-line-length': [0, 'always', Infinity],
    },
};
