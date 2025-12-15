# 🗺️ FlowNote Project Roadmap

> **Son Güncelleme:** 2024-12-15  
> **Proje Durumu:** 🚀 v1.7.0 (Sprint 5 Complete)  
> **Branch Protection:** ✅ Aktif

---

## � Release History

| Versiyon | Tarih | Öne Çıkan Özellik |
|----------|-------|-------------------|
| v1.7.0 | 15 Aralık 2024 | Security Hardening, Observability |
| v1.5.0 | 14 Aralık 2024 | Auth & Local Dev (SQLite, Username) |
| v1.4.0 | 14 Aralık 2024 | Templates System |
| v1.3.0 | 14 Aralık 2024 | Bi-directional Linking |
| v1.2.0 | 13 Aralık 2024 | Drag & Drop |
| v1.1.0 | 13 Aralık 2024 | Global Search, Command Palette |
| v1.0.0 | 12 Aralık 2024 | Core Features |

---

## ✅ Completed Sprints

### Sprint 1: Advanced Features (v1.1.0) ✅
- Global Search (pg_trgm)
- Command Palette (Cmd+K)
- Code Blocks (Prism.js)
- Focus Mode

### Sprint 2: Block Management (v1.2.0 - v1.3.0) ✅
- Drag & Drop (@dnd-kit)
- Bi-directional Linking

### Sprint 3: Templates System (v1.4.0) ✅
- Built-in templates (Meeting, Journal, Project, Todo)
- Template API & UI

### Sprint 4: Auth & Local Dev (v1.5.0) ✅
- SQLite support (Docker-free dev)
- Username/Role fields
- Identifier login (username OR email)
- Admin panel
- RolesGuard

### Sprint 5: Foundation & Security (v1.7.0) ✅
- Helmet security headers
- Rate limiting (global + auth)
- Winston structured logging
- Correlation ID tracking
- Global exception filter
- Toast notifications
- ErrorBoundary
- Skeleton components
- CI security audit

---

## � Current Sprint

### Sprint 6: Quality Gates (v1.8.0) - PLANNED
| Özellik | Öncelik |
|---------|---------|
| Playwright E2E Tests | P0 |
| Lighthouse CI | P1 |
| Axe-core A11y | P1 |
| Migration System | P2 |
| ADR-002 Auth Docs | P2 |

---

## 📋 Future Sprints

### Sprint 7: FlowAI (v2.0.0)
- Ollama integration
- Streaming SSE
- AI assistant UI
- Note summarization
- PII filtering

---

## 📝 Kurallar

- ✅ **Conventional Commits** formatı zorunlu (küçük harfle!)
- ✅ **Feature branch** ile çalış
- ✅ **Main'e direkt commit YASAK**
- ✅ **PR merge öncesi:** Lint + Test + Build
- ✅ **LESSONS_LEARNED.md** her sprint başında oku!

---

## 📚 Key Documents

| Dosya | Açıklama |
|-------|----------|
| `.ai-context/ROADMAP.md` | Bu dosya |
| `.ai-context/LESSONS_LEARNED.md` | Hatalar ve çözümler |
| `.ai-context/ADR/` | Mimari kararlar |
