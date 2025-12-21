# 🏃 Sprint Workflow - Quick Reference

**2-Week Sprint Cycle** | **Feature Branch Strategy** | **Semantic Versioning**

---

## 📅 Sprint Timeline

```
┌─ Week 1: Development ────────────────────────────────┐
│ Day 1-2   │ Planning + Branch Creation               │
│ Day 3-7   │ Active Development + Daily Commits       │
├─ Week 2: Testing & Release ─────────────────────────┤
│ Day 8-10  │ Testing + Bug Fixes + Integration        │
│ Day 11    │ Merge to Develop (Beta Release)          │
│ Day 12    │ Create Release Branch (RC)               │
│ Day 13-14 │ Final Testing + Merge to Main (Prod)     │
└──────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Commands

### Day 1: Sprint Start

```bash
# 1. Sync with develop
git checkout develop
git pull origin develop

# 2. Create sprint branch
git checkout -b feature/sprint-14-backend-migration

# 3. Push to remote
git push -u origin feature/sprint-14-backend-migration

# 4. Start development!
```

---

### Day 2-10: Daily Development

```bash
# Morning: Update from develop
git fetch origin
git rebase origin/develop  # Keep feature branch up-to-date

# During day: Make commits (follow conventional commits!)
git add .
git commit -m "feat(database): add prisma schema for notes"
git push origin feature/sprint-14-backend-migration

# Commit examples:
git commit -m "feat(editor): add block drag-drop support"
git commit -m "fix(auth): prevent token refresh race condition"
git commit -m "refactor(sync): extract conflict resolution logic"
git commit -m "test(notes): add unit tests for note service"
```

---

### Day 11: Merge to Develop (Beta)

```bash
# 1. Final sync with develop
git fetch origin
git rebase origin/develop

# 2. Push feature branch
git push --force-with-lease origin feature/sprint-14-backend-migration

# 3. Create PR to develop
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

# 4. Wait for approval + CI checks
# 5. Merge PR (via GitHub UI - Squash and Merge)
# 6. Automatic beta release: v2.1.0-beta.1
```

---

### Day 12: Create Release Branch (RC)

```bash
# 1. Checkout develop
git checkout develop
git pull origin develop

# 2. Create release branch
git checkout -b release/2.1.0

# 3. Final polish (only bug fixes!)
git commit -m "fix(tests): adjust coverage thresholds"
git commit -m "docs(readme): update changelog"

# 4. Push release branch
git push -u origin release/2.1.0

# 5. Automatic RC release: v2.1.0-rc.1
```

---

### Day 13-14: Production Release

```bash
# 1. Create PR to main
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
- [ ] Monitor error rates (first 30min)
- [ ] Verify feature flags
- [ ] Update documentation
- [ ] Announce release
EOF
)"

# 2. Wait for approval + final checks
# 3. Merge PR (via GitHub UI)
# 4. Automatic production release: v2.1.0
# 5. Monitor deployment!
```

---

### Day 14: Cleanup

```bash
# 1. Delete feature branch
git branch -d feature/sprint-14-backend-migration
git push origin --delete feature/sprint-14-backend-migration

# 2. Delete release branch (optional)
git branch -d release/2.1.0
git push origin --delete release/2.1.0

# 3. Sync develop with main
git checkout develop
git merge main
git push origin develop

# 4. Ready for next sprint!
```

---

## 📝 Conventional Commits Cheat Sheet

### Format

```
<type>(<scope>): <subject>
```

### Types (affects versioning!)

| Type | Version Bump | Example |
|------|--------------|---------|
| `feat` | **MINOR** (2.0.0 → 2.1.0) | `feat(editor): add table block` |
| `fix` | **PATCH** (2.1.0 → 2.1.1) | `fix(auth): resolve login bug` |
| `perf` | **PATCH** | `perf(search): optimize query` |
| `refactor` | **PATCH** | `refactor(api): simplify handlers` |
| `feat!` | **MAJOR** (2.1.0 → 3.0.0) | `feat(api)!: change response format` |
| `docs` | No bump | `docs(readme): update guide` |
| `test` | No bump | `test(notes): add unit tests` |
| `chore` | No bump | `chore(deps): update packages` |

### Scopes

```
web, api, database, types, ui, config,
editor, note, folder, workspace, auth, sync,
ai, search, storage, collaboration, template,
migration, deps, test, docker, release
```

### Examples

```bash
# Feature (minor bump)
git commit -m "feat(editor): add notion-like slash commands"
git commit -m "feat(sync): implement offline-first sync engine"

# Fix (patch bump)
git commit -m "fix(auth): prevent token refresh race condition"
git commit -m "fix(editor): resolve cursor position bug on paste"

# Breaking change (major bump)
git commit -m "feat(api)!: change note response format

BREAKING CHANGE: API response now returns { data, meta } format.
Old { note, status } format is no longer supported.
Migration guide: docs/migration/v3.md"

# Refactor (patch bump)
git commit -m "refactor(sync): extract conflict resolution logic"

# Chore (no bump)
git commit -m "chore(deps): upgrade typescript to 5.3"
git commit -m "chore(config): update prettier rules"
```

---

## 🔥 Hotfix Workflow (Emergency Only!)

When critical production bug can't wait for next sprint:

```bash
# 1. Branch from main (NOT develop!)
git checkout main
git pull origin main
git checkout -b hotfix/critical-auth-bug

# 2. Fix the bug
git commit -m "fix(auth): prevent null pointer in token refresh"

# 3. Push
git push -u origin hotfix/critical-auth-bug

# 4. Create PR to main
gh pr create \
  --base main \
  --head hotfix/critical-auth-bug \
  --title "fix(auth): prevent null pointer in token refresh" \
  --label "hotfix,priority:critical"

# 5. Fast-track approval → Merge → Auto release (patch bump)
# 6. Backport to develop
git checkout develop
git merge main
git push origin develop

# 7. Cleanup
git branch -d hotfix/critical-auth-bug
git push origin --delete hotfix/critical-auth-bug
```

**Hotfix SLA:** Critical bugs must be fixed within 4 hours.

---

## 🎯 Best Practices Checklist

### Daily ✅

- [ ] Pull latest from `develop` before starting work
- [ ] Commit at least once per day
- [ ] Follow conventional commit format strictly
- [ ] Push commits to remote regularly
- [ ] Review CI/CD status

### Weekly ✅

- [ ] Sync feature branch with `develop` (mid-sprint)
- [ ] Participate in sprint review
- [ ] Update sprint board (if using)

### Before Creating PR ✅

- [ ] All tests passing (`npm test`)
- [ ] Lint clean (`npm run lint`)
- [ ] Build successful (`npm run build`)
- [ ] No merge conflicts with target branch
- [ ] Conventional commits used
- [ ] PR description filled out
- [ ] Related issues linked

### Before Merging ✅

- [ ] At least 1 approval
- [ ] All CI checks green
- [ ] All conversations resolved
- [ ] Documentation updated (if needed)
- [ ] Changelog impact considered

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T

```bash
# Bad: Direct push to main/develop
git push origin main  # 🚫 BLOCKED by branch protection

# Bad: Generic commit messages
git commit -m "fixed bug"  # 🚫 REJECTED by commitlint
git commit -m "WIP"  # 🚫 REJECTED

# Bad: Mixing features and fixes
git commit -m "feat(editor): add table and fix bug"  # 🚫 Split into 2 commits

# Bad: Force push to shared branch
git push --force origin develop  # 🚫 NEVER on shared branches

# Bad: Commit directly to main
git commit -m "quick fix"
git push origin main  # 🚫 Always use PR

# Bad: Skip tests
git commit -m "test: skip flaky test" --no-verify  # 🚫 Fix the test!
```

### ✅ DO

```bash
# Good: Work on feature branch
git checkout -b feature/sprint-14
git commit -m "feat(editor): add table block"

# Good: Specific commit messages
git commit -m "fix(auth): prevent token refresh race condition"

# Good: Separate commits
git commit -m "feat(editor): add table block"
git commit -m "fix(editor): resolve paste bug"

# Good: Force push only on YOUR feature branch
git push --force-with-lease origin feature/sprint-14

# Good: Always use PR
gh pr create --base develop

# Good: Fix failing tests
npm test  # Fix failures before committing
```

---

## 🔍 Troubleshooting

### Issue: Commitlint Rejected My Commit

```bash
⧗   input: Fixed bug
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

# Solution: Use conventional format
git commit --amend -m "fix(auth): resolve login bug"
```

### Issue: Merge Conflict

```bash
# Solution 1: Rebase
git fetch origin
git rebase origin/develop
# Resolve conflicts
git add .
git rebase --continue
git push --force-with-lease

# Solution 2: Merge
git fetch origin
git merge origin/develop
# Resolve conflicts
git add .
git commit -m "chore(merge): resolve conflicts with develop"
git push
```

### Issue: CI Failing

```bash
# Check status
gh pr checks

# Re-run failed checks
gh run rerun <run-id>

# Run locally first
npm run lint
npm test
npm run build
```

### Issue: PR Blocked by Branch Protection

```
Required status check "test" is not passing
```

**Solution**: Fix the test, don't bypass!

```bash
npm test  # Fix failures
git add .
git commit -m "test(notes): fix flaky test"
git push
```

---

## 📊 Release Channels

| Channel | Branch | Version Example | Audience |
|---------|--------|-----------------|----------|
| **Production** | `main` | `2.1.0` | End users |
| **Beta** | `develop` | `2.2.0-beta.1` | Early adopters |
| **RC** | `release/*` | `2.1.0-rc.1` | QA team |
| **Alpha** | `feature/*` | Local only | Developers |

---

## 🆘 Need Help?

- 📖 [Full Git Workflow Documentation](./GIT_WORKFLOW.md)
- 🔐 [Branch Protection Rules](./BRANCH_PROTECTION.md)
- 🤝 [Contributing Guide](../CONTRIBUTING.md)
- 💬 [GitHub Discussions](https://github.com/emrealmaoglu/flownote/discussions)

---

## 📋 Useful Git Aliases

Add to `~/.gitconfig`:

```ini
[alias]
  # Sprint shortcuts
  sprint = "!f() { git checkout develop && git pull && git checkout -b feature/sprint-$1; }; f"
  sync = "!git fetch origin && git rebase origin/develop"
  cleanup = "!git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d"

  # Commit shortcuts
  feat = "!f() { git commit -m \"feat($1): $2\"; }; f"
  fix = "!f() { git commit -m \"fix($1): $2\"; }; f"
  docs = "!f() { git commit -m \"docs($1): $2\"; }; f"

  # PR shortcuts
  pr-develop = "!gh pr create --base develop"
  pr-main = "!gh pr create --base main"

  # Status shortcuts
  st = status -sb
  lg = log --graph --oneline --decorate --all -20
  last = log -1 HEAD --stat
```

**Usage:**

```bash
git sprint 14                                    # Create feature/sprint-14
git sync                                         # Sync with develop
git feat editor "add table block"                # Commit: feat(editor): add table block
git pr-develop                                   # Create PR to develop
git cleanup                                      # Delete merged branches
```

---

**Last Updated**: 2024-12-19
**Sprint Duration**: 2 weeks
**Next Sprint Start**: [Check project board]
