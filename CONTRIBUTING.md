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

### Branch Stratejisi
```
main (protected)
│
├── feature/* ─── Yeni özellikler
├── fix/* ─────── Bug düzeltmeleri
└── docs/* ────── Dokümantasyon
```

### Branch Oluşturma
```bash
# Main'den güncel al
git checkout main
git pull origin main

# Yeni branch oluştur
git checkout -b feature/özellik-adı
```

### Branch İsimlendirme
| Tip | Format | Örnek |
|-----|--------|-------|
| Özellik | `feature/<açıklama>` | `feature/drag-drop-blocks` |
| Bug fix | `fix/<issue>-<açıklama>` | `fix/123-auth-token` |
| Docs | `docs/<konu>` | `docs/api-reference` |

---

## 📝 Commit Kuralları

Bu projede **Conventional Commits** standardı kullanılmaktadır.

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Tipleri

| Tip | Emoji | Açıklama | Örnek |
|-----|-------|----------|-------|
| `feat` | 🚀 | Yeni özellik | `feat(notes): add block editor` |
| `fix` | 🐛 | Bug düzeltme | `fix(auth): resolve login issue` |
| `docs` | 📚 | Dokümantasyon | `docs(readme): update setup guide` |
| `style` | 💄 | Kod formatı (logic değişikliği yok) | `style: fix indentation` |
| `refactor` | ♻️ | Kod yeniden yapılandırma | `refactor(api): simplify handlers` |
| `perf` | ⚡ | Performans iyileştirme | `perf(search): optimize query` |
| `test` | 🧪 | Test ekleme/düzeltme | `test(notes): add unit tests` |
| `chore` | 🔧 | Bakım işleri | `chore(deps): update packages` |
| `ci` | 👷 | CI/CD değişiklikleri | `ci: add coverage report` |
| `build` | 📦 | Build sistemi | `build: update dockerfile` |

### Doğru Örnekler ✅
```bash
feat(notes): add drag-drop reordering
fix(auth): resolve token expiration bug
docs(readme): update installation steps
refactor(api): simplify error handling
test(notes): add service unit tests
chore(deps): upgrade typescript to 5.3
```

### Yanlış Örnekler ❌
```bash
Fixed bug                    # Tip yok
WIP                          # Anlamsız
feat: Add feature            # Büyük harf
FEAT(notes): add feature     # Tip büyük harf
feat(notes) add feature      # İki nokta yok
```

### Breaking Changes
API'de breaking change varsa:
```bash
feat(api)!: change response format

BREAKING CHANGE: API response artık { data, meta } formatında döner.
Eski format desteklenmiyor.
```

### Commitlint
Commit mesajları otomatik kontrol edilir. Hatalı format reddedilir:
```bash
$ git commit -m "fixed bug"
⧗   input: fixed bug
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]
```

---

## 🔄 Pull Request Süreci

### PR Açmadan Önce
- [ ] Tüm testler geçiyor (`npm run test`)
- [ ] Lint hataları yok (`npm run lint`)
- [ ] Build başarılı (`npm run build`)
- [ ] Branch güncel (main'den rebase/merge)

### PR Açarken
1. Anlamlı bir başlık kullan (conventional commit formatında)
2. Değişiklikleri açıkla
3. İlgili issue'ları linkle
4. Checklist'i doldur

### PR Template
PR açarken otomatik template yüklenir. Lütfen tüm alanları doldurun.

### Review Süreci
1. En az 1 approval gerekli
2. CI checks geçmeli
3. Reviewer yorumları çözülmeli

### Merge
- **Squash and merge** önerilir (temiz history için)
- Merge sonrası branch silinir

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

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Project Roadmap](.ai-context/ROADMAP.md)
- [Architecture Decisions](.ai-context/ADR/)

---

## ❓ Sorular

Sorularınız için:
- GitHub Discussions kullanın
- Issue açın

Katkılarınız için teşekkürler! 🎉
