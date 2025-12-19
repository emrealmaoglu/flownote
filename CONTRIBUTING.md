# 🤝 FlowNote'a Katkıda Bulunma Rehberi

FlowNote'a katkıda bulunmak istediğiniz için teşekkürler! Bu döküman, projeye nasıl katkıda bulunabileceğinizi açıklar.

---

## 📋 İçindekiler

- [Geliştirme Ortamı](#-geliştirme-ortamı)
- [Git Workflow](#-git-workflow)
- [Commit Kuralları](#-commit-kuralları)
- [Pull Request Süreci](#-pull-request-süreci)
- [Kod Standartları](#-kod-standartları)

---

## 🛠 Geliştirme Ortamı

### Gereksinimler
- Node.js v20+
- Docker & Docker Compose
- Git

### Kurulum
```bash
# Projeyi klonla
git clone https://github.com/emrealmaoglu/flownote.git
cd flownote

# Bağımlılıkları yükle
npm install

# Development ortamını başlat
npm run dev
```

### Scriptler
| Script | Açıklama |
|--------|----------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run test` | Testleri çalıştır |
| `npm run lint` | Lint kontrolü |

---

## 🌿 Git Workflow

FlowNote uses **Feature Branch + Release Train** methodology with **2-week sprints**.

### Branch Stratejisi

```
main (production) ─────────v2.0.0──────────v2.1.0─────►
  ↑ PR only                  ↑               ↑
  │                          │               │
develop (beta) ────────v2.1.0-beta.1───v2.1.0-beta.2───►
  ↑ PR only                  ↑               ↑
  │                          │               │
feature/sprint-14 ───────────●───────────────●
  (direct push allowed)

release/2.1.0 ──────────────────────────────────►
  (release candidate)

hotfix/critical-bug ────────●
                            ↓
                          main
```

### Branch Types

| Branch | Lifetime | Purpose | Versioning | Push Access |
|--------|----------|---------|------------|-------------|
| `main` | Permanent | Production | v2.0.0 | PR only |
| `develop` | Permanent | Integration | v2.1.0-beta.1 | PR only |
| `feature/sprint-*` | 2 weeks | Sprint work | No versioning | Direct push |
| `release/*` | Until merge | RC preparation | v2.1.0-rc.1 | Direct push |
| `hotfix/*` | Until merge | Emergency fixes | Patch bump | Direct push |

### Sprint Workflow (Quick Start)

```bash
# Day 1: Sprint Start
git checkout develop && git pull origin develop
git checkout -b feature/sprint-14-backend-migration
git push -u origin feature/sprint-14-backend-migration

# Day 2-10: Daily Development
git add . && git commit -m "feat(database): add prisma schema"
git push origin feature/sprint-14-backend-migration

# Day 11: Merge to Develop (Beta Release)
gh pr create --base develop --head feature/sprint-14-backend-migration

# Day 12-14: Release Branch → Production
git checkout -b release/2.1.0
gh pr create --base main --head release/2.1.0
```

**📖 Full Documentation**: See [Sprint Workflow Guide](docs/SPRINT_WORKFLOW.md)

### Branch İsimlendirme

| Tip | Format | Örnek |
|-----|--------|-------|
| Sprint Feature | `feature/sprint-<number>-<description>` | `feature/sprint-14-backend-migration` |
| Hotfix | `hotfix/<description>` | `hotfix/critical-auth-bug` |
| Release | `release/<version>` | `release/2.1.0` |
| Docs | `docs/<konu>` | `docs/api-reference` |

---

## 📝 Commit Kuralları

Bu projede **Conventional Commits** standardı **ZORunlu**dur. Semantic versioning buradan hesaplanır!

### Format
```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

**⚠️ Scope zorunludur!** Monorepo yapısında hangi paketin etkilendiğini belirtir.

### Commit Tipleri (Versioning Impact)

| Tip | Version Bump | Açıklama | Örnek |
|-----|--------------|----------|-------|
| `feat` | **MINOR** (2.0.0 → 2.1.0) | Yeni özellik | `feat(editor): add table block` |
| `fix` | **PATCH** (2.1.0 → 2.1.1) | Bug düzeltme | `fix(auth): resolve login issue` |
| `perf` | **PATCH** | Performans | `perf(search): optimize query` |
| `refactor` | **PATCH** | Kod refactoring | `refactor(api): simplify handlers` |
| `feat!` | **MAJOR** (2.1.0 → 3.0.0) | Breaking change | `feat(api)!: change response format` |
| `docs` | No bump | Dokümantasyon | `docs(readme): update setup guide` |
| `test` | No bump | Test | `test(notes): add unit tests` |
| `chore` | No bump | Bakım işleri | `chore(deps): update packages` |
| `ci` | No bump | CI/CD | `ci: add coverage report` |
| `build` | No bump | Build sistemi | `build: update dockerfile` |

### Geçerli Scope'lar

```
web, api, database, types, ui, config, validators,
editor, note, folder, workspace, auth, sync, ai,
search, storage, collaboration, template,
migration, deps, test, docker, release
```

### Doğru Örnekler ✅
```bash
# Feature (minor bump)
feat(editor): add notion-like slash commands
feat(sync): implement offline-first sync engine
feat(ai): add text completion with ollama

# Fix (patch bump)
fix(auth): prevent token refresh race condition
fix(editor): resolve cursor position bug on paste

# Refactor (patch bump)
refactor(sync): extract conflict resolution logic
refactor(api): simplify error handling

# Chore (no bump)
chore(deps): upgrade typescript to 5.3
chore(config): update prettier rules

# Breaking change (major bump)
feat(api)!: change note response format

BREAKING CHANGE: API response now returns { data, meta } format.
Old { note, status } format is no longer supported.
Migration guide: docs/migration/v3.md
```

### Yanlış Örnekler ❌
```bash
Fixed bug                    # ❌ Tip yok
WIP                          # ❌ Anlamsız
feat: Add feature            # ❌ Scope eksik!
feat(notes): Add feature     # ❌ Subject büyük harfle başlıyor
FEAT(notes): add feature     # ❌ Tip büyük harf
feat(notes) add feature      # ❌ İki nokta yok
feat(invalidscope): test     # ❌ Geçersiz scope
```

### Commitlint (Otomatik Kontrol)

Commit mesajları otomatik kontrol edilir. Hatalı format **reddedilir**:

```bash
$ git commit -m "fixed bug"
⧗   input: fixed bug
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]
✖   scope may not be empty [scope-empty]

# Doğru kullanım:
$ git commit -m "fix(auth): resolve login bug"
✔   found 0 problems, 0 warnings
```

**📖 Detaylı Bilgi**: [Git Workflow Documentation](docs/GIT_WORKFLOW.md)

---

## 🔄 Pull Request Süreci

### PR Açmadan Önce Checklist

- [ ] Tüm testler geçiyor (`npm run test`)
- [ ] Lint hataları yok (`npm run lint`)
- [ ] Build başarılı (`npm run build`)
- [ ] Branch güncel (`git rebase origin/develop`)
- [ ] Conventional commits kullanıldı
- [ ] Scope'lar doğru
- [ ] Breaking change varsa belirtildi
- [ ] Merge conflict yok

### PR Oluşturma

```bash
# Develop'a PR (Beta Release)
gh pr create \
  --base develop \
  --head feature/sprint-14-backend-migration \
  --title "feat(sprint-14): backend migration foundation"

# Main'e PR (Production Release)
gh pr create \
  --base main \
  --head release/2.1.0 \
  --title "chore(release): version 2.1.0"
```

### PR Başlığı Kuralları

PR başlıkları da conventional commit formatında **olmalı**:

✅ **Doğru**:
```
feat(editor): add table block support
fix(auth): prevent token refresh race condition
chore(release): version 2.1.0
```

❌ **Yanlış**:
```
Add table block         # Scope yok
Sprint 14 changes       # Format yok
WIP: Testing            # Anlamsız
```

### Otomatik PR Labeling

PR açıldığında otomatik olarak label'lar eklenir:

- **Branch bazlı**: `feature`, `hotfix`, `release`
- **Dosya bazlı**: `frontend`, `backend`, `database`, `tests`
- **Boyut bazlı**: `size/XS`, `size/S`, `size/M`, `size/L`, `size/XL`
- **Sprint bazlı**: `sprint-14`

### Review Süreci

1. **Otomatik Kontroller**:
   - ✅ PR title validation (conventional commits)
   - ✅ Lint check
   - ✅ Test execution
   - ✅ Build verification
   - ✅ Security audit

2. **Manuel Review**:
   - En az **1 approval** gerekli
   - Tüm **conversations resolved** olmalı
   - Code owner approval (varsa)

3. **Branch Protection**:
   - `main`: 1 approval + all checks
   - `develop`: 1 approval + lint/test checks
   - `feature/*`: No requirements

### Merge Stratejisi

| Target Branch | Merge Method | Reason |
|---------------|--------------|--------|
| `main` | **Squash and Merge** | Clean history for releases |
| `develop` | **Squash and Merge** | Easier to track features |
| `feature/*` | **Merge Commit** | Preserve sprint history |

**Merge sonrası**:
- Branch otomatik silinir
- Release tag oluşturulur (main/develop için)
- Changelog güncellenir

---

## 💻 Kod Standartları

### TypeScript
- Strict mode aktif
- `any` kullanımından kaçın
- Interface'leri tercih et

### Naming Conventions
| Tip | Convention | Örnek |
|-----|------------|-------|
| Dosya | kebab-case | `note-editor.tsx` |
| Component | PascalCase | `NoteEditor` |
| Function | camelCase | `createNote` |
| Constant | UPPER_SNAKE | `MAX_NOTES` |
| Interface | PascalCase + I prefix (optional) | `NoteData` |

### Dosya Yapısı
```
src/
├── components/     # React components
├── hooks/          # Custom hooks
├── services/       # API calls
├── utils/          # Helper functions
├── types/          # TypeScript types
└── contexts/       # React contexts
```

### Import Sırası
1. External packages
2. Internal modules
3. Components
4. Types
5. Styles

```typescript
// External
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Internal
import { api } from '@/services/api';
import { NoteEditor } from '@/components/NoteEditor';

// Types
import type { Note } from '@/types';
```

---

## 🐛 Bug Raporlama

Bug bulduğunuzda:
1. Önce mevcut issue'ları kontrol edin
2. Yeni issue açın (bug template kullanın)
3. Tekrar edilebilir adımları ekleyin
4. Beklenen vs gerçekleşen davranışı açıklayın

---

## 💡 Özellik Önerisi

Yeni özellik önermek için:
1. Önce mevcut issue'ları kontrol edin
2. Yeni issue açın (feature template kullanın)
3. Kullanım senaryosunu açıklayın
4. Mümkünse mockup/wireframe ekleyin

---

## 📚 Ek Kaynaklar

### Git & Versioning
- 📖 [Git Workflow Guide](docs/GIT_WORKFLOW.md) - Feature Branch + Release Train metodolojisi
- 🏃 [Sprint Workflow](docs/SPRINT_WORKFLOW.md) - 2 haftalık sprint süreci
- 🔐 [Branch Protection Rules](docs/BRANCH_PROTECTION.md) - Branch koruma ayarları
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit standardı
- [Semantic Versioning](https://semver.org/) - Versiyon numaralama

### Project Documentation
- [Project Roadmap](.ai-context/ROADMAP.md) - Proje yol haritası
- [Architecture Decisions](.ai-context/ADR/) - Mimari kararlar
- [Lessons Learned](docs/LESSONS_LEARNED.md) - Öğrenilen dersler

---

## ❓ Sorular

Sorularınız için:
- GitHub Discussions kullanın
- Issue açın

Katkılarınız için teşekkürler! 🎉
