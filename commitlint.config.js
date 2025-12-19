/**
 * Commitlint Configuration
 * Conventional Commits standardını zorunlu kılar
 * @DevOps - Semantic Versioning depends on this!
 *
 * Geçerli commit formatları:
 * - feat: yeni özellik (minor version bump)
 * - fix: bug düzeltme (patch version bump)
 * - perf: performans iyileştirme (patch version bump)
 * - refactor: kod yeniden yapılandırma (patch version bump)
 * - docs: dokümantasyon (no version bump)
 * - style: formatting (no version bump)
 * - test: test ekleme/düzeltme (no version bump)
 * - chore: bakım işleri (no version bump)
 * - ci: CI/CD değişiklikleri (no version bump)
 * - build: build sistemi değişiklikleri (no version bump)
 * - BREAKING CHANGE: major version bump
 *
 * Scope zorunludur! Monorepo yapısında hangi package'in etkilendiğini belirtir.
 *
 * Örnek: feat(editor): add block drag-drop support
 * Örnek: fix(auth): prevent token refresh race condition
 * Örnek: feat(api)!: change note response format (breaking change)
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
                'feat',     // ✨ Yeni özellik (minor)
                'fix',      // 🐛 Bug fix (patch)
                'perf',     // ⚡ Performans (patch)
                'refactor', // ♻️ Kod yeniden yapılandırma (patch)
                'docs',     // 📚 Dokümantasyon
                'style',    // 💄 Formatting
                'test',     // ✅ Test
                'chore',    // 🔧 Bakım
                'ci',       // 👷 CI/CD
                'build',    // 📦 Build sistemi
                'revert',   // ⏪ Geri alma
            ],
        ],
        // Scope zorunlu (monorepo için kritik)
        'scope-empty': [2, 'never'],
        // Scope küçük harf
        'scope-case': [2, 'always', 'lower-case'],
        // Geçerli scope'lar
        'scope-enum': [
            2,
            'always',
            [
                // Monorepo packages
                'web',           // Frontend (Next.js app)
                'api',           // Backend API
                'database',      // Database schema/migrations
                'types',         // Shared TypeScript types
                'ui',            // Shared UI components
                'config',        // Shared configuration
                'validators',    // Shared Zod schemas

                // Feature areas
                'editor',        // Block editor
                'note',          // Note functionality
                'folder',        // Folder functionality
                'workspace',     // Workspace features
                'auth',          // Authentication
                'sync',          // Sync engine
                'ai',            // AI features
                'search',        // Search functionality
                'storage',       // File storage
                'collaboration', // Real-time collaboration
                'template',      // Templates

                // Infrastructure
                'migration',     // Data migration
                'deps',          // Dependencies
                'test',          // Test infrastructure
                'docker',        // Docker configuration
                'release',       // Release process
            ],
        ],
        // Subject zorunlu
        'subject-empty': [2, 'never'],
        // Subject küçük harfle başlar
        'subject-case': [2, 'always', 'lower-case'],
        // Subject nokta ile bitmez
        'subject-full-stop': [2, 'never', '.'],
        // Header max 100 karakter
        'header-max-length': [2, 'always', 100],
        // Body line length - disabled for semantic-release
        'body-max-line-length': [0, 'always', Infinity],
        // Footer line length - disabled for BREAKING CHANGE
        'footer-max-line-length': [0, 'always', Infinity],
    },
};
