# 🌿 FlowNote Git Workflow & Release Train

## 📋 Table of Contents

- [Overview](#overview)
- [Branch Strategy](#branch-strategy)
- [Sprint Workflow](#sprint-workflow)
- [Commit Conventions](#commit-conventions)
- [Release Process](#release-process)
- [Hotfix Workflow](#hotfix-workflow)
- [Version Management](#version-management)

---

## 🎯 Overview

FlowNote kullanır **Feature Branch + Release Train** metodolojisini:

- **Sprint-based development** (2 haftalık sprintler)
- **Continuous Integration** her branch'te
- **Automated Semantic Versioning** main ve develop branch'lerinde
- **Multi-channel releases** (production, beta, rc, alpha)

---

## 🌳 Branch Strategy

```
main (production) ───────────────v2.0.0──────────v2.1.0─────►
  ↑ merge PR                      ↑               ↑
  │                               │               │
develop (beta) ─────────v2.1.0-beta.1───v2.1.0-beta.2────►
  ↑ merge PR              ↑               ↑
  │                       │               │
feature/sprint-14 ────────●───────────────●
  ↑ commits
  │
release/2.1.0 ────────────────────────────────────►
  (release candidate)

hotfix/critical-bug ──────●
                          ↓
                        main
```

### Branch Tipleri

| Branch | Lifetime | Purpose | Versioning | Deploy Target |
|--------|----------|---------|------------|---------------|
| `main` | Permanent | Production-ready code | v2.0.0 (stable) | Production |
| `develop` | Permanent | Integration branch | v2.1.0-beta.1 | Staging/Beta |
| `feature/sprint-*` | Sprint (2 weeks) | Sprint development | No versioning | Dev/Preview |
| `release/*` | Until merge | Release preparation | v2.1.0-rc.1 | RC Environment |
| `hotfix/*` | Until merge | Critical production fixes | Patch version | Production (fast) |

---

## 🏃 Sprint Workflow

### Sprint Cycle (2 weeks)

```
Week 1 (Planning & Development)
└─ Day 1-2: Sprint planning, create feature branch
└─ Day 3-7: Development, daily commits

Week 2 (Testing & Release)
└─ Day 8-10: Testing, bug fixes
└─ Day 11: Merge to develop (beta release)
└─ Day 12: Create release branch (RC)
└─ Day 13-14: Final testing, merge to main (production)
```

### Step-by-Step Sprint Workflow

#### 1️⃣ Sprint Start (Day 1)

```bash
# Sync with develop
git checkout develop
git pull origin develop

# Create sprint feature branch
git checkout -b feature/sprint-14-backend-migration

# Push to remote
git push -u origin feature/sprint-14-backend-migration
```

#### 2️⃣ During Sprint (Day 2-10)

```bash
# Make changes
git add .

# Commit with conventional format
git commit -m "feat(database): add prisma schema for notes"

# Push regularly
git push origin feature/sprint-14-backend-migration
```

**Commit Frequently:**
- Minimum 1 commit per day
- Follow [Conventional Commits](#commit-conventions)
- Use meaningful commit messages

#### 3️⃣ Mid-Sprint Integration (Day 5-7)

```bash
# Keep feature branch updated with develop
git checkout feature/sprint-14-backend-migration
git fetch origin
git rebase origin/develop

# Or merge if rebase is problematic
git merge origin/develop

# Force push if rebased (only on feature branch!)
git push --force-with-lease origin feature/sprint-14-backend-migration
```

#### 4️⃣ Sprint End - Merge to Develop (Day 11)

```bash
# Create Pull Request to develop
gh pr create \
  --base develop \
  --head feature/sprint-14-backend-migration \
  --title "feat(sprint-14): backend migration foundation" \
  --body "$(cat <<'EOF'
## Sprint 14: Backend Migration Foundation

### Features
- ✅ Monorepo setup with Turborepo
- ✅ Prisma database schema
- ✅ Migration script (localStorage → Database)
- ✅ Sync engine implementation

### Breaking Changes
None

### Testing
- [x] All tests passing
- [x] Lint clean
- [x] Build successful
- [x] Manual testing completed

### Checklist
- [x] Conventional commits used
- [x] Documentation updated
- [x] CHANGELOG entries added
- [x] No merge conflicts

Closes #14
EOF
)"

# After PR approval and CI passes
git checkout develop
git pull origin develop
# Merge is done via GitHub (Squash or Merge commit)
```

**Develop Branch Merge triggers:**
- ✅ Automatic versioning: `v2.1.0-beta.1`
- ✅ Changelog update
- ✅ Beta deployment to staging
- ✅ GitHub Release with "pre-release" tag

#### 5️⃣ Release Candidate (Day 12)

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/2.1.0

# Final polish (only bug fixes, no features!)
git commit -m "fix(tests): adjust coverage thresholds"

# Push release branch
git push -u origin release/2.1.0

# Triggers RC versioning: v2.1.0-rc.1
```

#### 6️⃣ Production Release (Day 13-14)

```bash
# Create Pull Request to main
gh pr create \
  --base main \
  --head release/2.1.0 \
  --title "chore(release): version 2.1.0" \
  --body "$(cat <<'EOF'
## Release 2.1.0

### Features
[Auto-generated from commits]

### Bug Fixes
[Auto-generated from commits]

### BREAKING CHANGES
[If any]

### Deployment Checklist
- [x] All RC tests passed
- [x] Manual QA completed
- [x] Database migrations ready
- [x] Rollback plan documented
- [x] Monitoring alerts configured

### Post-Deploy Tasks
- [ ] Monitor error rates
- [ ] Verify feature flags
- [ ] Update documentation
- [ ] Announce release
EOF
)"

# After PR approval
# Merge to main triggers:
# - Semantic Release: v2.1.0
# - CHANGELOG update
# - GitHub Release
# - Production deployment
```

#### 7️⃣ Cleanup

```bash
# Delete feature branch (locally and remote)
git branch -d feature/sprint-14-backend-migration
git push origin --delete feature/sprint-14-backend-migration

# Optionally delete release branch
git branch -d release/2.1.0
git push origin --delete release/2.1.0

# Sync develop with main
git checkout develop
git merge main
git push origin develop
```

---

## 📝 Commit Conventions

FlowNote uses **Conventional Commits** with strict enforcement.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Commit Types

| Type | Release | Description | Example |
|------|---------|-------------|---------|
| `feat` | **minor** | New feature | `feat(editor): add block drag-drop` |
| `fix` | **patch** | Bug fix | `fix(auth): resolve token expiration` |
| `perf` | **patch** | Performance improvement | `perf(search): optimize query` |
| `refactor` | **patch** | Code refactoring | `refactor(api): simplify handlers` |
| `docs` | No release | Documentation only | `docs(readme): update setup guide` |
| `style` | No release | Code style (formatting) | `style: fix indentation` |
| `test` | No release | Add/update tests | `test(notes): add unit tests` |
| `chore` | No release | Maintenance | `chore(deps): update packages` |
| `ci` | No release | CI/CD changes | `ci: add coverage report` |
| `build` | No release | Build system | `build: update dockerfile` |

### Scopes

Use specific scopes for clarity:

```
web          - Frontend (Next.js app)
api          - Backend API
database     - Database schema/migrations
types        - Shared TypeScript types
ui           - UI components
editor       - Block editor
note         - Note functionality
folder       - Folder functionality
workspace    - Workspace features
auth         - Authentication
sync         - Sync engine
ai           - AI features
search       - Search functionality
storage      - File storage
collaboration - Real-time collaboration
migration    - Data migration
deps         - Dependencies
config       - Configuration
test         - Test infrastructure
```

### Examples

#### ✅ Good Commits

```bash
# Feature (triggers minor version bump)
feat(editor): add notion-like slash commands
feat(sync): implement offline-first sync engine
feat(ai): add AI text completion with Ollama

# Fix (triggers patch version bump)
fix(auth): prevent token refresh race condition
fix(editor): resolve cursor position bug on paste
fix(database): handle connection pool exhaustion

# Performance (triggers patch version bump)
perf(search): add full-text search indexing
perf(api): optimize N+1 queries with dataloader

# Refactoring (triggers patch version bump)
refactor(sync): extract conflict resolution logic
refactor(ui): migrate to shadcn/ui v2

# Breaking Change (triggers MAJOR version bump)
feat(api)!: change note response format

BREAKING CHANGE: API response now returns { data, meta } format.
Old { note, status } format is no longer supported.
Migration guide: https://docs.flownote.app/migration/v3

# Chore (no version bump)
chore(deps): upgrade typescript to 5.3
chore(config): update prettier rules
```

#### ❌ Bad Commits

```bash
# No type
Fixed bug

# Vague description
feat: add feature

# Wrong case
FEAT(editor): Add feature
feat(Editor): add feature

# No scope when needed
feat: add button

# Missing colon
feat(editor) add button

# Subject starts with capital
feat(editor): Add button

# Subject ends with period
feat(editor): add button.
```

### Breaking Changes

When introducing breaking changes:

```bash
# Option 1: ! after type/scope
feat(api)!: change note structure

# Option 2: BREAKING CHANGE footer
feat(api): change note structure

BREAKING CHANGE: Note structure changed from flat to nested.
See migration guide in docs/migration/v3.md
```

Both trigger **MAJOR** version bump (v2.0.0 → v3.0.0)

---

## 🚀 Release Process

### Semantic Versioning

FlowNote follows **SemVer 2.0.0**: `MAJOR.MINOR.PATCH`

```
2.1.3
│ │ │
│ │ └─ PATCH: Bug fixes, performance, refactoring
│ └─── MINOR: New features (backward compatible)
└───── MAJOR: Breaking changes
```

### Release Channels

| Channel | Branch | Version Format | Stability | Audience |
|---------|--------|----------------|-----------|----------|
| **Production** | `main` | `2.1.0` | Stable | End users |
| **Beta** | `develop` | `2.2.0-beta.1` | Mostly stable | Early adopters |
| **RC** | `release/*` | `2.1.0-rc.1` | Pre-production | QA team |
| **Alpha** | `feature/*` | `2.2.0-alpha.sprint-14.1` | Unstable | Developers only |

### Automated Release Flow

#### On `main` branch (Production)

```yaml
Push to main
  ├─ semantic-release analyzes commits
  ├─ Determines version bump (major/minor/patch)
  ├─ Updates package.json: v2.1.0
  ├─ Generates CHANGELOG.md
  ├─ Creates Git tag: v2.1.0
  ├─ Creates GitHub Release
  ├─ Triggers production deployment
  └─ Notifies team (Slack/Discord)
```

**Commit → Version Examples:**

```bash
# Last version: v2.0.5

fix(auth): resolve login bug
# → v2.0.6 (patch)

feat(editor): add table block
# → v2.1.0 (minor)

feat(api)!: change response format
# → v3.0.0 (major)
```

#### On `develop` branch (Beta)

```yaml
Merge to develop
  ├─ semantic-release with beta preset
  ├─ Updates package.json: v2.1.0-beta.1
  ├─ Creates Git tag: v2.1.0-beta.1
  ├─ Creates GitHub Pre-Release
  ├─ Triggers staging deployment
  └─ Notifies dev team
```

#### On `release/*` branch (RC)

```yaml
Push to release/2.1.0
  ├─ semantic-release with rc preset
  ├─ Updates package.json: v2.1.0-rc.1
  ├─ Creates Git tag: v2.1.0-rc.1
  ├─ Creates GitHub Pre-Release
  └─ Triggers RC environment deployment
```

#### On `feature/*` branch (Alpha)

```yaml
Push to feature/sprint-14
  ├─ No semantic-release
  ├─ CI/CD runs (test, lint, build)
  ├─ Deploys to preview environment
  └─ Version: 2.2.0-alpha.sprint-14.1 (manual/local)
```

---

## 🔥 Hotfix Workflow

For **critical production bugs** that can't wait for the next sprint:

### Step 1: Create Hotfix Branch

```bash
# Always branch from main (production)
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/critical-auth-bug

# Fix the bug
git commit -m "fix(auth): prevent null pointer in token refresh"

# Push
git push -u origin hotfix/critical-auth-bug
```

### Step 2: Create PR to Main

```bash
gh pr create \
  --base main \
  --head hotfix/critical-auth-bug \
  --title "fix(auth): prevent null pointer in token refresh" \
  --label "hotfix,priority:critical" \
  --body "$(cat <<'EOF'
## Hotfix: Critical Auth Bug

### Problem
Users experiencing logout due to null pointer exception in token refresh.

### Solution
Added null check before accessing token payload.

### Impact
- Affects: 100% of logged-in users
- Severity: Critical
- Downtime: None (backward compatible)

### Testing
- [x] Unit tests added
- [x] Manual testing (staging)
- [x] Rollback plan documented

### Rollback Plan
Revert commit SHA: abc123

Closes #456
EOF
)"
```

### Step 3: Fast-Track Merge

```bash
# After CI passes and 1 approval
# Merge to main (triggers patch release)
# v2.1.0 → v2.1.1

# Immediately deploy
# Monitor for 30 minutes
```

### Step 4: Backport to Develop

```bash
# Ensure develop has the fix
git checkout develop
git pull origin develop

# Cherry-pick or merge from main
git merge main

git push origin develop
```

### Step 5: Cleanup

```bash
git branch -d hotfix/critical-auth-bug
git push origin --delete hotfix/critical-auth-bug
```

**Hotfix SLA:**
- Critical bugs: Fix within 4 hours
- High priority: Fix within 24 hours
- All hotfixes must have rollback plan

---

## 📊 Version Management

### Package Versioning (Monorepo)

FlowNote uses **unified versioning** across all packages:

```json
// Root package.json
{
  "name": "flownote-monorepo",
  "version": "2.1.0"
}

// apps/web/package.json
{
  "name": "@flownote/web",
  "version": "2.1.0"
}

// packages/database/package.json
{
  "name": "@flownote/database",
  "version": "2.1.0"
}
```

All packages share the same version number for simplicity.

### Version Bump Examples

```bash
# Current version: 2.1.0

# Scenario 1: Bug fix
git commit -m "fix(editor): resolve paste formatting"
# → v2.1.1

# Scenario 2: New feature
git commit -m "feat(ai): add text summarization"
# → v2.2.0

# Scenario 3: Multiple commits
git commit -m "feat(editor): add table block"
git commit -m "feat(sync): add conflict resolution"
git commit -m "fix(auth): resolve token issue"
# → v2.2.0 (minor wins, only one bump)

# Scenario 4: Breaking change
git commit -m "feat(api)!: change note structure"
# → v3.0.0
```

### Pre-release Versioning

```bash
# Beta channel (develop branch)
v2.1.0-beta.1
v2.1.0-beta.2
v2.1.0-beta.3
# → merges to main → v2.1.0

# RC channel (release/* branch)
v2.1.0-rc.1
v2.1.0-rc.2
# → merges to main → v2.1.0

# Alpha channel (feature/* branch - manual)
v2.2.0-alpha.sprint-14.1
v2.2.0-alpha.sprint-14.2
```

### Changelog Generation

Changelog is auto-generated from commits:

```markdown
# Changelog

## [2.1.0] - 2024-12-19

### 🚀 Features
- **editor:** add notion-like slash commands ([abc123])
- **sync:** implement offline-first sync engine ([def456])
- **ai:** add text completion with Ollama ([ghi789])

### 🐛 Bug Fixes
- **auth:** prevent token refresh race condition ([jkl012])
- **editor:** resolve cursor position bug ([mno345])

### ⚡ Performance
- **search:** add full-text search indexing ([pqr678])

### ♻️ Refactoring
- **sync:** extract conflict resolution logic ([stu901])

### 📚 Documentation
- **readme:** update installation guide ([vwx234])

### 🔧 Maintenance
- **deps:** upgrade typescript to 5.3 ([yza567])
```

---

## 🎯 Best Practices

### DO ✅

- ✅ Commit frequently (at least once per day)
- ✅ Use conventional commit format strictly
- ✅ Write meaningful commit messages
- ✅ Keep feature branches up to date with develop
- ✅ Test locally before pushing
- ✅ Create PR when sprint is complete
- ✅ Request reviews promptly
- ✅ Fix CI failures immediately
- ✅ Squash fixup commits before merging
- ✅ Delete merged branches

### DON'T ❌

- ❌ Commit directly to `main` or `develop`
- ❌ Force push to shared branches
- ❌ Merge without PR and review
- ❌ Use generic commit messages
- ❌ Skip tests or linting
- ❌ Leave feature branches unmerged for > 2 weeks
- ❌ Cherry-pick commits without documenting
- ❌ Create hotfix branches from develop
- ❌ Bypass CI checks
- ❌ Mix features and fixes in same commit

---

## 🔐 Branch Protection Rules

Configure GitHub branch protection:

### `main` Branch

```yaml
Required:
  - ✅ Require pull request before merging
  - ✅ Require approvals: 1
  - ✅ Require status checks to pass
    - ✅ security
    - ✅ lint
    - ✅ test
    - ✅ build
  - ✅ Require conversation resolution
  - ✅ Require linear history
  - ✅ Do not allow bypassing

Restrictions:
  - ✅ Restrict pushes (admins only)
  - ✅ Lock branch (prevent deletion)
```

### `develop` Branch

```yaml
Required:
  - ✅ Require pull request before merging
  - ✅ Require approvals: 1
  - ✅ Require status checks to pass
    - ✅ lint
    - ✅ test
  - ✅ Require conversation resolution

Restrictions:
  - ✅ Lock branch (prevent deletion)
```

### `feature/*` and `release/*` Branches

```yaml
Required:
  - ✅ Require status checks to pass
    - ✅ lint
    - ✅ test
```

---

## 📚 Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Semantic Release Docs](https://semantic-release.gitbook.io/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)

---

## 🆘 Troubleshooting

### Commit Rejected by Commitlint

```bash
⧗   input: Fixed bug
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

# Solution: Use conventional format
git commit -m "fix(auth): resolve login bug"
```

### Semantic Release Failed

```bash
# Check commit format
git log --oneline -10

# If commits are malformed, amend:
git commit --amend -m "feat(editor): add table block"

# Or interactive rebase:
git rebase -i HEAD~3
```

### Merge Conflict with Develop

```bash
# Update from develop
git fetch origin
git rebase origin/develop

# Resolve conflicts
git add .
git rebase --continue

# Force push (only on feature branch!)
git push --force-with-lease origin feature/sprint-14
```

### Accidentally Committed to Main

```bash
# If not pushed yet
git reset --soft HEAD~1
git stash
git checkout feature/my-branch
git stash pop
git commit -m "feat(scope): proper commit message"

# If already pushed (contact admin immediately!)
```

---

**Questions? Check [CONTRIBUTING.md](../CONTRIBUTING.md) or open a discussion!**
