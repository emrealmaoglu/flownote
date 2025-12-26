# 🗺️ FlowNote Project Roadmap

> **Son Güncelleme:** 2025-12-24
> **Proje Durumu:** 🚀 v3.1.0-beta.4 (Sprint 14.4 Complete)
> **Branch Protection:** ✅ Aktif

---

## 📅 Release History

| Versiyon | Tarih | Öne Çıkan Özellik |
|----------|-------|-------------------|
| v3.1.0-beta.4 | 24 Aralık 2024 | Sync Logging, API Docs, Strict Type Safety |
| v3.0.0 | 23 Aralık 2024 | Tech Debt Reduction, Monorepo Setup |
| v1.7.5 | 16 Aralık 2024 | UX Polish (Zen Mode), Bug Fixes |

---

## ✅ Completed Sprints (Recent)

### Sprint 14.4: Tech Debt & Quality (v3.1.0) ✅
- [x] **API Docs:** Swagger/OpenAPI setup (`/api/docs`)
- [x] **Logging:** Structured logging for Sync package
- [x] **Type Safety:** 0 explicit `any` types in Frontend
- [x] **Testing:** Unit tests for `UsersService`

### Sprint 8: Identity & Trust (v1.8.0) ✅
- [x] Note Icons & Covers
- [x] DB Hygiene
- [x] Sidebar Groups

---

## 🏃‍♂️ Current Sprint

### Sprint 15: Auth, Safety & Reliability (v3.2.0)
> **Goal:** Solidify the Authentication system and ensure rigorous testing coverage.

#### 1. Backend Feature Parity (`api`)
- [ ] `UsersService` CRUD: `create`, `update`, `delete`, `findByEmail` capabilities.
- [ ] Refactor `AuthService` to use `UsersService` methods properly.

#### 2. Quality Assurance (`test`)
- [ ] **E2E Tests:** Implement full Auth flow (Register -> Login -> Fail -> Logout).
- [ ] Verify Release Workflow automation.

#### 3. Performance (`perf`)
- [ ] Frontend Bundle Size audit & report.
- [ ] Lazy loading optimization for heavy components.

---

## 📋 Future Sprints

### Sprint 16: The Omnibar (v3.3.0)
- Command Center (cmd+k)
- Global Search
- Keyboard-first navigation

### Sprint 17: FlowAI (v4.0.0)
- Ollama integration
- Streaming SSE
- Note summarization

---

## 📝 Kurallar
- ✅ **Conventional Commits** formatı zorunlu
- ✅ **Feature branch** ile çalış
- ✅ **PR merge öncesi:** Lint + Test + Build
