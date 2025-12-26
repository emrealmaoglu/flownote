<div align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS"/>
</div>

<br/>

<h1 align="center">📝 FlowNote</h1>

<p align="center">
  <strong>Block-based not tutma uygulaması</strong><br/>
  Notion benzeri, modern ve güvenli bir not defteri
</p>

<p align="center">
  <a href="#-özellikler">Özellikler</a> •
  <a href="#-teknoloji-yığını">Teknoloji</a> •
  <a href="#-kurulum">Kurulum</a> •
  <a href="#-testler">Testler</a> •
  <a href="#-proje-mimarisi">Mimari</a> •
  <a href="#-ödev-gereksinimleri">Ödev Gereksinimleri</a>
</p>

---

## ✨ Özellikler

- 🔐 **JWT Authentication** — Güvenli kullanıcı girişi ve kayıt
- 📝 **Block-based Editor** — Text, Heading, Checkbox, Image blokları
- 🗄️ **JSONB Storage** — PostgreSQL JSONB ile esnek içerik yapısı
- 🎨 **Modern UI** — TailwindCSS ile şık ve responsive tasarım
- 🐳 **Docker Ready** — Tek komutla çalışan konteyner yapısı
- ✅ **Tested** — Jest ile unit testler
- 🚀 **CI/CD** — GitHub Actions ile otomatik pipeline

---

## 🛠 Teknoloji Yığını

### Backend
| Teknoloji | Açıklama |
|-----------|----------|
| **NestJS** | Node.js framework |
| **TypeORM** | ORM ve migration |
| **PostgreSQL** | Veritabanı (JSONB) |
| **JWT + Passport** | Authentication |
| **Zod** | Input validation |
| **Jest** | Unit testing |

### Frontend
| Teknoloji | Açıklama |
|-----------|----------|
| **React 18** | UI library |
| **Vite** | Build tool |
| **TailwindCSS** | Styling |
| **TanStack Query** | Server state |
| **React Router** | Routing |
| **Lucide React** | Icons |

### DevOps
| Teknoloji | Açıklama |
|-----------|----------|
| **Docker** | Containerization |
| **GitHub Actions** | CI/CD pipeline |
| **Semantic Release** | Auto versioning |
| **Husky + Commitlint** | Git hooks |

---

## 🚀 Kurulum

### Ön Gereksinimler

- [Docker](https://www.docker.com/) ve Docker Compose
- [Node.js](https://nodejs.org/) v18+ (local development için)
- [Git](https://git-scm.com/)

### Docker ile Çalıştırma (Önerilen)

```bash
# 1. Projeyi klonlayın
git clone https://github.com/YOUR_USERNAME/flownote.git
cd flownote

# 2. Environment dosyasını oluşturun
cp .env.example .env

# 3. Docker ile çalıştırın (TEK KOMUT!)
docker-compose up -d

# 4. Uygulamaya erişin
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000/api
```

### Local Development

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. PostgreSQL başlatın (Docker ile)
docker-compose up -d postgres

# 3. Backend'i çalıştırın
npm run dev:backend

# 4. Frontend'i çalıştırın (yeni terminal)
npm run dev:frontend
```

---

## 🧪 Testler

```bash
# Tüm testleri çalıştır
npm run test

# Backend testleri
cd backend && npm run test

# Test coverage
cd backend && npm run test:cov
```

### Test Sonuçları

```
✓ AppController (2 tests)
✓ NotesService (11 tests)
─────────────────────────
Test Suites: 2 passed
Tests:       13 passed
```

---

## 📁 Proje Mimarisi

```
flownote/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   │   ├── dto/           # DTOs + Zod schemas
│   │   │   ├── guards/        # JWT guard
│   │   │   ├── strategies/    # Passport JWT strategy
│   │   │   └── entities/      # User entity
│   │   ├── notes/             # Notes module
│   │   │   ├── dto/           # DTOs + Zod schemas
│   │   │   └── entities/      # Note entity (JSONB)
│   │   └── common/            # Shared utilities
│   └── Dockerfile
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── api/               # Axios client
│   │   ├── components/        # UI components
│   │   │   ├── blocks/        # BlockRenderer
│   │   │   ├── notes/         # NoteCard, NoteList
│   │   │   ├── layout/        # Sidebar, MainLayout
│   │   │   └── auth/          # ProtectedRoute
│   │   ├── contexts/          # AuthContext
│   │   ├── pages/             # Route pages
│   │   └── lib/               # Utilities
│   └── Dockerfile
│
├── shared/                     # Shared types & schemas
│   ├── types/
│   └── schemas/
│
├── .github/workflows/          # CI/CD
├── docker-compose.yml          # Container orchestration
└── .ai-context/               # AI development docs
```

---

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Kullanıcı kaydı |
| POST | `/api/auth/login` | Kullanıcı girişi |

### Notes (Protected)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/notes` | Tüm notları listele |
| GET | `/api/notes/:id` | Not detayı |
| POST | `/api/notes` | Yeni not oluştur |
| PUT | `/api/notes/:id` | Not güncelle |
| DELETE | `/api/notes/:id` | Not sil |

---

## 📋 Git Workflow

### Branch Stratejisi
- `main` — Production branch
- `feature/*` — Yeni özellikler
- `fix/*` — Bug fixes

### Commit Formatı (Conventional Commits)
```
feat(scope): description    # Yeni özellik
fix(scope): description     # Bug fix
docs(scope): description    # Dokümantasyon
chore(scope): description   # Maintenance
```

---

## ✅ Ödev Gereksinimleri Karşılanma Tablosu

> Bu tablo, projenin ödev isterlerini karşıladığını göstermektedir.

| # | Gereksinim | Durum | Kanıt |
|---|------------|-------|-------|
| 1 | **Feature Branch Workflow** | ✅ | `feature/initial-setup`, `feature/backend-core`, `feature/frontend-core`, `feature/auth`, `feature/release-prep` |
| 2 | **Conventional Commits** | ✅ | Tüm commitler `feat:`, `fix:`, `chore:`, `docs:` formatında |
| 3 | **Commitlint Entegrasyonu** | ✅ | `commitlint.config.js` + Husky hooks |
| 4 | **Semantic Release** | ✅ | `.releaserc` konfigürasyonu |
| 5 | **GitHub Actions CI/CD** | ✅ | `.github/workflows/ci.yml` |
| 6 | **Docker Compose** | ✅ | PostgreSQL + Backend + Frontend |
| 7 | **NestJS Backend** | ✅ | Modüler yapı, Controllers, Services |
| 8 | **React + TailwindCSS Frontend** | ✅ | Vite, Component-based, Responsive UI |
| 9 | **PostgreSQL + JSONB** | ✅ | `notes.content` JSONB column |
| 10 | **Zod Input Validation** | ✅ | Notes + Auth DTOs |
| 11 | **Jest Unit Tests** | ✅ | 13 test, 2 suite, tümü geçiyor |
| 12 | **JWT Authentication** | ✅ | bcrypt + Passport + Guards |
| 13 | **Block-based Editor** | ✅ | Text, Heading, Checkbox, Image |
| 14 | **TypeScript (No `any`)** | ✅ | Strict mode, full type safety |
| 15 | **README Dokümantasyonu** | ✅ | Bu dosya |

---

## 👨‍💻 Geliştirici

**Emre Almaoğlu**

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

<div align="center">
  <sub>Built with ❤️ using NestJS + React + TypeScript</sub>
</div>

## 🐳 Docker Development

### Quick Start

```bash
# Start all services
make dev
# or
npm run docker:dev
```

### Available Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start with live output |
| `make up` | Start in background |
| `make down` | Stop all services |
| `make logs` | View all logs |
| `make db-shell` | PostgreSQL shell |
| `make test` | Run tests |
| `make clean` | Full cleanup |

### Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Adminer (DB GUI) | http://localhost:8080 |

### Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```
<!-- release test 3 -->
