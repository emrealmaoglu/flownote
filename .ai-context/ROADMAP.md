# 🗺️ FlowNote Project Roadmap

> **Son Güncelleme:** 2024-12-12
> **Proje Durumu:** 🚦 Başlatılıyor

---

## 📋 Proje Fazları

### Faz 1: Proje Kurulumu ve Altyapı (Foundation) ✅
> **Hedef:** Çalışan bir geliştirme ortamı ve boş ama fonksiyonel proje iskeleti

- [x] **1.1 Monorepo Yapısı**
  - [x] Kök dizin yapılandırması (package.json, tsconfig.json)
  - [x] Frontend klasörü oluşturma (React + Vite + TS + TailwindCSS)
  - [x] Backend klasörü oluşturma (NestJS)
  - [x] Shared types klasörü

- [x] **1.2 Docker Altyapısı**
  - [x] Dockerfile (Backend)
  - [x] Dockerfile (Frontend)
  - [x] docker-compose.yml (PostgreSQL + Backend + Frontend)
  - [x] .env.example dosyası

- [x] **1.3 Git & Commit Yapılandırması**
  - [x] .gitignore
  - [x] Husky kurulumu
  - [x] Commitlint yapılandırması
  - [x] Conventional Commits enforcer

- [x] **1.4 CI/CD Pipeline (GitHub Actions)**
  - [x] Temel workflow dosyası (.github/workflows/ci.yml)
  - [x] Test adımları
  - [x] Build adımları
  - [x] Semantic Release entegrasyonu

- [x] **1.5 Semantic Release Yapılandırması**
  - [x] .releaserc dosyası
  - [x] CHANGELOG.md otomatik oluşturma
  - [x] GitHub Release oluşturma

---

### Faz 2: Backend Core (API Temeli) ✅
> **Hedef:** Çalışan ve test edilmiş Notes CRUD API

- [x] **2.1 Veritabanı Bağlantısı**
  - [x] TypeORM kurulumu
  - [x] PostgreSQL bağlantısı
  - [x] Notes Entity (JSONB content alanı)
  - [x] Migration sistemi (auto-sync enabled for dev)

- [x] **2.2 Notes Module**
  - [x] NotesController
  - [x] NotesService
  - [x] CreateNoteDto (Zod validasyonlu)
  - [x] UpdateNoteDto (Zod validasyonlu)

- [x] **2.3 API Testleri**
  - [x] Unit testler (Service layer) - 11 tests
  - [x] App controller tests - 2 tests

---

### Faz 3: Frontend Core (UI Temeli) ✅
> **Hedef:** Basit ama şık Note listesi ve block editor

- [x] **3.1 Proje Yapısı**
  - [x] TailwindCSS konfigürasyonu
  - [x] API client (Axios + TanStack Query)
  - [x] Router yapısı (React Router)

- [x] **3.2 Note Listesi**
  - [x] NoteList component
  - [x] NoteCard component
  - [x] Empty state

- [x] **3.3 Block Editor**
  - [x] BlockRenderer component
  - [x] TextBlock
  - [x] HeadingBlock
  - [x] CheckboxBlock
  - [x] ImageBlock (URL)

- [x] **3.4 Sayfalar**
  - [x] HomePage
  - [x] NoteDetailPage
  - [x] NewNotePage (block editor)

---

### Faz 4: Authentication (Güvenlik) ✅
> **Hedef:** Basit JWT tabanlı kimlik doğrulama

- [x] **4.1 Backend Auth**
  - [x] User Entity (bcrypt hash)
  - [x] AuthModule (JWT Strategy)
  - [x] Login Endpoint (Zod validated)
  - [x] Register Endpoint (Zod validated)

- [x] **4.2 Frontend Auth**
  - [x] AuthContext/Store
  - [x] Login Page
  - [x] Register Page
  - [x] ProtectedRoute Componentext/store

---

### Faz 5: Polish & Release
> **Hedef:** Production-ready release

- [ ] **5.1 Final Testler**
  - [ ] Tüm testlerin geçtiğini doğrulama
  - [ ] Coverage raporu

- [ ] **5.2 Dokümantasyon**
  - [ ] README.md tamamlama
  - [ ] API dokümantasyonu
  - [ ] Setup guide

- [ ] **5.3 İlk Release**
  - [ ] v1.0.0 yayınlama
  - [ ] GitHub Release doğrulama

---

## 📊 Progress Tracking

| Faz | Durum | Tamamlanma |
|-----|-------|------------|
| Faz 1 - Kurulum | ✅ Tamamlandı | 100% |
| Faz 2 - Backend | ✅ Tamamlandı | 100% |
| Faz 3 - Frontend | ✅ Tamamlandı | 100% |
| Faz 4 - Auth | ✅ Tamamlandı | 100% |
| Faz 5 - Release | ⏳ Bekliyor | 0% |

---

## 🔖 Aktif Görev

**Şu anki görev:** Faz 4 tamamlandı! Faz 5 (Polish & Release) bekleniyor.

---

## 📝 Notlar

- Her commit **Conventional Commits** formatında olmalı
- Kod değişikliklerinden önce branch oluşturulmalı: `git checkout -b feature/xxx`
- Main branch'e direkt commit **YASAK**
