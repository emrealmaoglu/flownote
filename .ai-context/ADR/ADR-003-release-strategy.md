# ADR-003: Release Strategy & Semantic Versioning

## Durum
Kabul Edildi - Aralık 2024

## Bağlam
FlowNote projesi için tutarlı, otomatik ve takip edilebilir bir sürümleme stratejisi gerekiyor. Bu strateji:
- Versiyon numaralarının anlamlı olmasını sağlar
- Release sürecini otomatikleştirir
- Changelog'u otomatik günceller
- Takım içi iletişimi standardize eder

## Karar

### 1. Semantic Versioning (SemVer 2.0.0)
Format: `MAJOR.MINOR.PATCH`

| Değişiklik | Versiyon | Örnek |
|------------|----------|-------|
| Breaking change | MAJOR | 1.0.0 → 2.0.0 |
| Yeni özellik (backward compatible) | MINOR | 1.0.0 → 1.1.0 |
| Bug fix | PATCH | 1.0.0 → 1.0.1 |

### 2. Conventional Commits Standardı
Tüm commit mesajları şu formatta olmalı:
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Commit Tipleri ve Release Etkileri

| Tip | Açıklama | Release | Örnek |
|-----|----------|---------|-------|
| `feat` | Yeni özellik | MINOR | `feat(notes): add drag-drop` |
| `fix` | Bug düzeltme | PATCH | `fix(auth): resolve token bug` |
| `perf` | Performans | PATCH | `perf(search): optimize query` |
| `refactor` | Kod düzenleme | PATCH | `refactor(api): simplify logic` |
| `docs` | Dokümantasyon | - | `docs(readme): update install` |
| `style` | Formatting | - | `style: fix indentation` |
| `test` | Test | - | `test(notes): add unit tests` |
| `chore` | Bakım | - | `chore(deps): update packages` |
| `ci` | CI/CD | - | `ci: add coverage report` |
| `build` | Build sistemi | - | `build: update webpack` |

#### Breaking Changes
`BREAKING CHANGE:` footer'ı veya `!` ile işaretlenir:
```
feat(api)!: change response format

BREAKING CHANGE: API response artık { data, meta } formatında
```

### 3. Branch Stratejisi
```
main (protected)
│
├── feature/* ─── Yeni özellikler
│   └── feature/sprint-9-devops-docs
│
├── fix/* ─────── Bug düzeltmeleri
│   └── fix/123-auth-token-bug
│
└── docs/* ────── Sadece dokümantasyon
    └── docs/update-readme
```

#### Branch Kuralları
- `main`: Protected, direkt commit yasak
- `feature/*`: Yeni özellikler için
- `fix/*`: Bug fix'ler için (opsiyonel: issue numarası)
- PR merge stratejisi: Squash and merge (önerilir)

### 4. Release Akışı
```
┌─────────────────────────────────────────────────────────────┐
│                     RELEASE PIPELINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Developer        GitHub           CI/CD         Release    │
│  ─────────        ──────           ─────         ───────    │
│                                                             │
│  1. Feature       2. PR            3. Checks     4. Auto    │
│     branch ──────▶  açılır ───────▶  çalışır ───▶  release  │
│                                                             │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐   ┌─────────┐ │
│  │ Commit  │     │ Review  │     │ Lint    │   │ Tag     │ │
│  │ (conv.) │     │ Request │     │ Test    │   │ Release │ │
│  │         │     │         │     │ Build   │   │ CHANGELOG│ │
│  └─────────┘     └─────────┘     └─────────┘   └─────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Detaylı Akış
1. Developer `feature/*` branch'i oluşturur
2. Conventional commits ile çalışır
3. PR açar (main'e)
4. CI otomatik çalışır:
   - 🛡️ Security audit
   - 🔍 Lint check
   - 🧪 Test suite
   - 🏗️ Build verification
5. Code review yapılır
6. PR merge edilir (squash)
7. `semantic-release` otomatik çalışır:
   - Commit'leri analiz eder
   - Versiyon belirler
   - CHANGELOG.md günceller
   - Git tag oluşturur
   - GitHub Release publish eder

### 5. Araçlar ve Konfigürasyon

| Araç | Dosya | Amaç |
|------|-------|------|
| semantic-release | `.releaserc` | Otomatik versiyonlama |
| commitlint | `commitlint.config.js` | Commit format kontrolü |
| husky | `.husky/` | Git hooks |
| GitHub Actions | `.github/workflows/ci.yml` | CI/CD pipeline |

### 6. Release Notları Kategorileri

CHANGELOG.md'de commit'ler şu kategorilere ayrılır:
- 🚀 **Features** - `feat` commit'leri
- 🐛 **Bug Fixes** - `fix` commit'leri
- ⚡ **Performance** - `perf` commit'leri
- ♻️ **Refactoring** - `refactor` commit'leri
- 📚 **Documentation** - `docs` commit'leri (opsiyonel)

## Sonuçlar

### Olumlu
- ✅ Otomatik ve tutarlı versiyon yönetimi
- ✅ Anlaşılır release history
- ✅ Takip edilebilir değişiklikler
- ✅ Azaltılmış manuel iş yükü

### Dikkat Edilmesi Gerekenler
- ⚠️ Tüm takım conventional commits formatına uymalı
- ⚠️ Breaking change'ler dikkatli planlanmalı
- ⚠️ Commit mesajları anlamlı olmalı

## Referanslar
- [Semantic Versioning 2.0.0](https://semver.org/)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/)
- [semantic-release](https://semantic-release.gitbook.io/)
