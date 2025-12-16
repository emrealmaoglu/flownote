---
description: Pre-push QA checklist - run before every git push
---

# Pre-Push QA Workflow

// turbo-all

Bu workflow'u her `git push` öncesinde uygula. CI hataları minimize edilir.

## Full QA Checklist

```bash
# 1. Backend TypeScript Check
cd backend && npx tsc --noEmit

# 2. Backend Lint
npm run lint --workspace=backend

# 3. Backend Tests (CRITICAL!)
npm test --workspace=backend

# 4. Frontend TypeScript Check
cd frontend && npx tsc --noEmit

# 5. Frontend Lint
npm run lint --workspace=frontend

# 6. Frontend Build Test (optional but recommended)
npm run build --workspace=frontend
```

## Quick Check (Minimum)

```bash
# Backend tests + Frontend lint (en kritik kontroller)
npm test --workspace=backend && npm run lint --workspace=frontend
```

## Common Issues & Fixes

| Hata | Çözüm |
|------|-------|
| `Cannot resolve dependency` | Test dosyasına mock repository ekle |
| `react-refresh/only-export-components` | Hook ve component'i ayrı dosyalara böl |
| `exhaustive-deps` | useCallback kullan |
| `subject-case` | Commit subject küçük harfle başlamalı |

## When to Use

- [ ] Yeni feature branch push ederken
- [ ] PR açmadan önce
- [ ] CI fix commit'i yaparken

---

> **@QA Note:** Bu workflow izlenmezse CI hataları kaçınılmaz.
