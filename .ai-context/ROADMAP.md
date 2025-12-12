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

### Faz 3: Frontend Core (UI Temeli)
> **Hedef:** Basit ama şık Note listesi ve block editor

- [ ] **3.1 Proje Yapısı**
  - [ ] TailwindCSS konfigürasyonu
  - [ ] API client (Axios/TanStack Query)
  - [ ] Router yapısı

- [ ] **3.2 Note Listesi**
  - [ ] NoteList component
  - [ ] NoteCard component
  - [ ] Empty state

- [ ] **3.3 Block Editor**
  - [ ] BlockEditor component
  - [ ] TextBlock
  - [ ] HeadingBlock
  - [ ] CheckboxBlock
  - [ ] ImageBlock (URL)

---

### Faz 4: Authentication
> **Hedef:** JWT tabanlı basit auth sistemi

- [ ] **4.1 Backend Auth**
  - [ ] AuthModule
  - [ ] JWT stratejisi
  - [ ] Login/Register endpoints
  - [ ] Guards

- [ ] **4.2 Frontend Auth**
  - [ ] Login sayfası
  - [ ] Register sayfası
  - [ ] Auth context/store

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
| Faz 3 - Frontend | ⏳ Bekliyor | 0% |
| Faz 4 - Auth | ⏳ Bekliyor | 0% |
| Faz 5 - Release | ⏳ Bekliyor | 0% |

---

## 🔖 Aktif Görev

**Şu anki görev:** Faz 2 tamamlandı! Faz 3 (Frontend Core) bekleniyor.

---

## 📝 Notlar

- Her commit **Conventional Commits** formatında olmalı
- Kod değişikliklerinden önce branch oluşturulmalı: `git checkout -b feature/xxx`
- Main branch'e direkt commit **YASAK**
