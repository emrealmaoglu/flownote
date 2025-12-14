# 🗺️ FlowNote Project Roadmap

> **Son Güncelleme:** 2024-12-14  
> **Proje Durumu:** 🚀 v1.3.0 Released  
> **Branch Protection:** ✅ Aktif

---

## 📋 Proje Fazları (v1.0.0)

### Faz 1: Proje Kurulumu ve Altyapı (Foundation) ✅
> **Hedef:** Çalışan bir geliştirme ortamı ve boş ama fonksiyonel proje iskeleti

- [x] **1.1 Monorepo Yapısı** - package.json, tsconfig.json, workspaces
- [x] **1.2 Docker Altyapısı** - Dockerfile, docker-compose.yml
- [x] **1.3 Git & Commit** - Husky, Commitlint, Conventional Commits
- [x] **1.4 CI/CD Pipeline** - GitHub Actions, Semantic Release
- [x] **1.5 Semantic Release** - CHANGELOG.md, GitHub Releases

---

### Faz 2: Backend Core (API Temeli) ✅
> **Hedef:** Çalışan ve test edilmiş Notes CRUD API

- [x] **2.1 Veritabanı** - TypeORM, PostgreSQL, JSONB
- [x] **2.2 Notes Module** - Controller, Service, Zod DTOs
- [x] **2.3 API Testleri** - 13 unit tests

---

### Faz 3: Frontend Core (UI Temeli) ✅
> **Hedef:** Basit ama şık Note listesi ve block editor

- [x] **3.1 Proje Yapısı** - TailwindCSS, Axios, React Router
- [x] **3.2 Note Listesi** - NoteList, NoteCard, Empty state
- [x] **3.3 Block Editor** - Text, Heading, Checkbox, Image blocks
- [x] **3.4 Sayfalar** - Home, NoteDetail, NewNote

---

### Faz 4: Authentication (Güvenlik) ✅
- [x] **4.1 Backend Auth** - JWT, bcrypt, Zod validation
- [x] **4.2 Frontend Auth** - AuthContext, ProtectedRoute

---

### Faz 5: Polish & Release ✅
- [x] **5.1 Dokümantasyon** - README.md, API docs
- [x] **5.2 Final** - Tests passing, CI/CD ready

---

## 🚀 Sprint 1: Advanced Features (v1.1.0) ✅

| Özellik | Açıklama | Durum |
|---------|----------|-------|
| **Global Search** | pg_trgm full-text search | ✅ |
| **Command Palette** | Cmd+K quick actions | ✅ |
| **Code Blocks** | Syntax highlighting (Prism.js) | ✅ |
| **Focus Mode** | Distraction-free writing | ✅ |

---

## 🚀 Sprint 2: Block Management (v1.2.0 - v1.3.0) ✅

| Özellik | Açıklama | Versiyon |
|---------|----------|----------|
| **Drag & Drop** | @dnd-kit, fractional indexing | v1.2.0 |
| **Bi-directional Linking** | [[wikilinks]], BacklinksPanel | v1.3.0 |

---

## 📈 Release History

| Versiyon | Tarih | Öne Çıkan Özellik |
|----------|-------|-------------------|
| v1.3.0 | 14 Aralık 2024 | Bi-directional Linking |
| v1.2.0 | 13 Aralık 2024 | Drag & Drop |
| v1.1.0 | 13 Aralık 2024 | Global Search, Command Palette |
| v1.0.0 | 12 Aralık 2024 | Core Features |

---

## 📋 Parking Lot (v1.4+)

| Özellik | Öncelik | Sprint |
|---------|---------|--------|
| Templates System | Yüksek | Sprint 3 |
| FlowAI Integration | Orta | Sprint 3 |
| PWA Support | Orta | Sprint 4 |
| Image Upload | Düşük | Sprint 4 |
| Real-time Collaboration | Düşük | v2.0 |
| Export (PDF/Markdown) | Düşük | v2.0 |

---

## 📝 Kurallar

- ✅ **Conventional Commits** formatı zorunlu
- ✅ **Feature branch** ile çalış: `git checkout -b feature/xxx`
- ✅ **Main branch'e direkt commit YASAK** (Ruleset aktif)
- ✅ **PR merge öncesi:** Lint + Test + Build geçmeli
