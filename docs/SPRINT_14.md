# 🚀 Sprint 14: Monorepo Foundation & Database Setup

**Duration**: 2 weeks
**Branch**: `feature/sprint-14-monorepo-setup`
**Status**: Foundation Complete ✅

---

## 📋 Overview

Sprint 14 lays the groundwork for FlowNote's transformation from a localStorage-based application to a full-stack, database-backed system. This sprint focuses on:

1. **Monorepo Setup** with Turborepo
2. **Database Layer** with Prisma
3. **Shared Types** Package
4. **Git Workflow** Modernization

---

## 🎯 Goals

### Primary Goals
- ✅ Setup Turborepo monorepo structure
- ✅ Create `packages/database` with Prisma
- ✅ Create `packages/types` for shared TypeScript types
- ✅ Configure multi-branch Git workflow (main, develop, feature/*)
- ✅ Update semantic release for beta/rc channels

### Secondary Goals
- ⏳ Migration script (localStorage → Database) - Sprint 14.2
- ⏳ Backend integration with Prisma - Sprint 14.3
- ⏳ Frontend sync engine - Sprint 14.4

---

## 📦 Project Structure

```
flownote/
├── frontend/                    # Existing React + Vite app
├── backend/                     # Existing NestJS API
├── shared/                      # Existing shared code
├── packages/                    # NEW: Monorepo packages
│   ├── database/               # Prisma schema & client
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   └── seed.ts        # Seed data
│   │   ├── src/
│   │   │   └── index.ts       # Prisma client export
│   │   └── package.json
│   └── types/                  # Shared TypeScript types
│       ├── src/
│       │   ├── note.ts
│       │   ├── folder.ts
│       │   ├── user.ts
│       │   ├── template.ts
│       │   └── index.ts
│       └── package.json
├── turbo.json                   # NEW: Turborepo config
├── .releaserc.json             # NEW: Multi-branch semantic release
├── docs/
│   ├── GIT_WORKFLOW.md         # NEW: Comprehensive Git guide
│   ├── SPRINT_WORKFLOW.md      # NEW: Sprint process cheat sheet
│   ├── BRANCH_PROTECTION.md    # NEW: Branch protection setup
│   └── SPRINT_14.md            # This file
└── package.json                # Updated for Turborepo
```

---

## 🗄️ Database Schema

### Entities

#### User
- Authentication & profile
- Roles: admin, user
- Relations: notes, folders

#### Folder
- Hierarchical structure (parent-child)
- Color & icon customization
- Position ordering

#### Note
- Block-based content (JSON)
- Visual identity (icon, cover)
- Favorites system
- Hierarchy support (sub-notes)

#### Template
- Pre-made note templates
- Category system
- Public/private visibility

#### Session
- JWT alternative (future)
- IP & user agent tracking

---

## 🛠️ Technologies

### Monorepo
- **Turborepo** 2.3.3 - Fast build system
- **npm workspaces** - Package management

### Database
- **Prisma** 5.22.0 - ORM
- **SQLite** (development) - Fast local development
- **PostgreSQL** (production-ready) - Scalable database

### Types
- **TypeScript** 5.3.3 - Strict type safety
- Shared types across frontend/backend

### Git Workflow
- **Conventional Commits** - Enforced via commitlint
- **Semantic Release** - Automated versioning
- **Husky** - Git hooks
- **GitHub Actions** - CI/CD pipelines

---

## 📝 Git Workflow Changes

### Branch Strategy

```
main (production) ─────────v2.0.0──────────v2.1.0─────►
  ↑ PR only
  │
develop (beta) ────────v2.1.0-beta.1───v2.1.0-beta.2───►
  ↑ PR only
  │
feature/sprint-14 ───────────●───────────────●
  (direct push allowed)

release/2.1.0 ──────────────────────────────────►
  (release candidate)
```

### Key Changes

1. **Mandatory Scope** in commit messages
   ```bash
   # ❌ Old (accepted)
   feat: add feature

   # ✅ New (required)
   feat(database): add prisma schema
   ```

2. **Multi-branch Releases**
   - `main` → v2.0.0 (production)
   - `develop` → v2.1.0-beta.1 (beta)
   - `release/*` → v2.1.0-rc.1 (release candidate)

3. **Automated PR Validation**
   - PR title must follow conventional commits
   - Auto-labeling based on files changed
   - Size labels (XS, S, M, L, XL)

---

## 🚀 Quick Start

### Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Create database & tables
cd packages/database
npx prisma migrate dev --name init

# Seed database with demo data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Development

```bash
# Run everything
npm run dev

# Run specific workspace
npm run dev:frontend
npm run dev:backend

# Database commands
npm run db:generate   # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Create migration
npm run db:studio    # Open database GUI
npm run db:seed      # Seed demo data
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

---

## 📊 Database Schema Details

### Note Content Structure

Notes use a block-based JSON structure:

```typescript
{
  "blocks": [
    {
      "id": "block-1",
      "type": "heading",
      "order": 0,
      "data": { "text": "My Heading", "level": 1 }
    },
    {
      "id": "block-2",
      "type": "text",
      "order": 1,
      "data": { "text": "Paragraph content" }
    },
    {
      "id": "block-3",
      "type": "checkbox",
      "order": 2,
      "data": { "text": "Todo item", "checked": false }
    }
  ]
}
```

### Block Types Supported

- `text` - Plain text paragraph
- `heading` - H1, H2, H3 headings
- `checkbox` - Todo items
- `image` - Image blocks
- `code` - Code blocks

---

## 🔄 Migration Strategy (Sprint 14.2)

### Phase 1: Dual-Mode (Current Sprint)
- ✅ Prisma schema defined
- ⏳ Migration script from localStorage
- ⏳ Backend integration
- ⏳ Frontend sync layer

### Phase 2: Backend Priority (Sprint 15)
- Backend becomes primary data source
- localStorage as offline cache
- Conflict resolution

### Phase 3: Backend Only (Sprint 16+)
- Full cloud operation
- Remove localStorage dependency
- Real-time collaboration

---

## 📚 Documentation

### New Documentation
- [Git Workflow Guide](./GIT_WORKFLOW.md) - Comprehensive workflow documentation
- [Sprint Workflow](./SPRINT_WORKFLOW.md) - Developer cheat sheet
- [Branch Protection](./BRANCH_PROTECTION.md) - GitHub branch protection setup

### Updated Documentation
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Updated with new workflow
- [CHANGELOG.md](../CHANGELOG.md) - Auto-generated from commits

---

## 🎓 Lessons Learned

### What Went Well ✅
1. **Turborepo Setup** - Smooth integration with existing workspace structure
2. **Prisma Schema** - Clean, simple schema based on existing entities
3. **Git Workflow** - Comprehensive documentation prevents confusion
4. **Type Sharing** - `@flownote/types` package reduces duplication

### Challenges 🤔
1. **Scope Enforcement** - Breaking change, requires team onboarding
2. **Database Choice** - SQLite for dev, PostgreSQL for prod requires dual support
3. **Migration Complexity** - localStorage to DB migration needs careful planning

### Future Improvements 💡
1. Add workspace/team features (Sprint 15+)
2. Implement real-time collaboration (Sprint 16+)
3. Add AI features with Ollama (Sprint 17+)
4. Optimize Turborepo caching

---

## 🔜 Next Steps (Sprint 14.2)

### Week 2 Goals

1. **Migration Script**
   - Export localStorage data
   - Transform to Prisma format
   - Import to database
   - Validation & rollback

2. **Backend Integration**
   - Replace TypeORM with Prisma
   - Update services to use `@flownote/database`
   - Maintain API compatibility

3. **Frontend Sync**
   - Create sync engine (localStorage ↔ Backend)
   - Offline-first approach
   - Conflict resolution

4. **Testing**
   - Database integration tests
   - Migration script tests
   - E2E tests with database

---

## 📞 Resources

- **Turborepo Docs**: https://turbo.build/repo/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Conventional Commits**: https://www.conventionalcommits.org/
- **Semantic Versioning**: https://semver.org/

---

**Sprint Lead**: FlowNote Team
**Last Updated**: 2024-12-19
**Next Sprint**: Sprint 14.2 - Migration & Integration
