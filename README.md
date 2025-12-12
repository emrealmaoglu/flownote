# 🌊 FlowNote

> A modern, block-based note-taking application built with React + NestJS

[![CI/CD Pipeline](https://github.com/yourusername/flownote/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/flownote/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📋 Overview

FlowNote is a simplified "Notion-like" note-taking application featuring a block-based editor. Notes are composed of different block types: Text, Headings, Checkboxes, and Images.

**Key Focus Areas:**
- 🔄 Feature Branch Workflow
- 📦 Semantic Versioning (Automated)
- 🚀 CI/CD Pipeline with GitHub Actions
- 🐳 Docker-based Development

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **Backend** | Node.js 20, NestJS, TypeORM |
| **Database** | PostgreSQL 16 |
| **Validation** | Zod |
| **Testing** | Jest, Vitest |
| **Infrastructure** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions, Semantic Release |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/flownote.git
cd flownote

# Copy environment variables
cp .env.example .env

# Start all services with one command
docker-compose up
```

Services will be available at:
- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:3000/api
- 🐘 PostgreSQL: localhost:5432

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev
```

## 📁 Project Structure

```
flownote/
├── frontend/          # React + Vite application
├── backend/           # NestJS API
├── shared/            # Shared types & validation schemas
├── .ai-context/       # AI memory system
├── .github/workflows/ # CI/CD pipelines
└── docker-compose.yml # Container orchestration
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only

# Testing
npm run test             # Run all tests

# Building
npm run build            # Build all packages

# Linting
npm run lint             # Lint all packages
```

## 📝 Commit Convention

This project uses **Conventional Commits** for automated versioning:

```
feat: add new feature          -> Minor version bump (1.0.0 -> 1.1.0)
fix: bug fix                   -> Patch version bump (1.0.0 -> 1.0.1)
feat!: breaking change         -> Major version bump (1.0.0 -> 2.0.0)
```

### Examples

```bash
git commit -m "feat(notes): add block editor component"
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "docs: update README with new instructions"
```

## 🔀 Git Workflow

1. **Never commit directly to `main`**
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes with proper commits
4. Push and create a Pull Request
5. After merge, Semantic Release automatically creates a new version

## 🧪 Testing

```bash
# Run backend tests
npm run test --workspace=backend

# Run frontend tests
npm run test --workspace=frontend

# Run with coverage
npm run test:cov --workspace=backend
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild images
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
```

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | API status |
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/notes` | List notes |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/:id` | Get note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by FlowNote Team**
