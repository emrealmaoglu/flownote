## [2.3.0](https://github.com/emrealmaoglu/flownote/compare/v2.2.0...v2.3.0) (2025-12-19)


### 🚀 Features

* implement user profile and seed data management ([6b3da1e](https://github.com/emrealmaoglu/flownote/commit/6b3da1e063237f76dd56fd232cc212e7eb95062f))

## [2.2.0](https://github.com/emrealmaoglu/flownote/compare/v2.1.0...v2.2.0) (2025-12-19)


### 🚀 Features

* **editor:** add inline markdown formatting support ([e4ecb68](https://github.com/emrealmaoglu/flownote/commit/e4ecb686830f73e946b15a0e0f575787f4ff0234))

## [2.1.0](https://github.com/emrealmaoglu/flownote/compare/v2.0.0...v2.1.0) (2025-12-19)


### 🚀 Features

* **api:** add favorites and recent notes endpoints ([1e2bec2](https://github.com/emrealmaoglu/flownote/commit/1e2bec2ab0831aadd11122d66ac0a4e02a037931))
* **blocks:** add bookmark block with url preview ([135d007](https://github.com/emrealmaoglu/flownote/commit/135d007fd1b6aaeb5d595c3d8d6d8eba1d03ca37))
* **blocks:** add callout block with emoji and color picker ([4dd59ad](https://github.com/emrealmaoglu/flownote/commit/4dd59ad8836e6b763efc8ef08d955e270003ba4c))
* **blocks:** add divider block component ([d5cce67](https://github.com/emrealmaoglu/flownote/commit/d5cce67d4494130d5508922d4ceffe087db746e4))
* **blocks:** add quote block with author support ([7b5064e](https://github.com/emrealmaoglu/flownote/commit/7b5064e7070342a197d097d914c1dacf694bdfdb))
* **blocks:** integrate new blocks into renderer and editor ([b959acf](https://github.com/emrealmaoglu/flownote/commit/b959acf3a2d3620702999cd238ab9d194dc85d7c))
* **sidebar:** add recent notes and favorites sections ([5c26f41](https://github.com/emrealmaoglu/flownote/commit/5c26f4127ab383ceceb6a2da43b004a3aa75cf25))
* **ui:** add block type buttons for new blocks ([9b191de](https://github.com/emrealmaoglu/flownote/commit/9b191def5cbbdba2003f4d3eabd468bf092dd103))


### 🐛 Bug Fixes

* **lint:** remove unused updatedatecolumn import ([e6cfc8d](https://github.com/emrealmaoglu/flownote/commit/e6cfc8d021df64d14fe01a41f4a19887158246af))
* **lint:** replace any type with proper error handling ([b5546bc](https://github.com/emrealmaoglu/flownote/commit/b5546bc920b1420adf7f0ca7f48ae2a325a4aaa4))
* **test:** exclude playwright tests from vitest ([b9e0f94](https://github.com/emrealmaoglu/flownote/commit/b9e0f9406c02fd704e82ff698b0c2da643f0ff84))
* **typescript:** resolve type errors in notedetailheader ([6484a62](https://github.com/emrealmaoglu/flownote/commit/6484a6219d05f7142eea5df583fa547ab3770b42))

## [2.0.0](https://github.com/emrealmaoglu/flownote/compare/v1.7.1...v2.0.0) (2025-12-18)

#### Sprint 14.2: Migration & Sync Engine (2025-12-20)

**@flownote/sync Package**
- Add comprehensive sync engine for bidirectional synchronization
- Implement SyncManager with 720+ lines of core logic
- Add ConflictResolver with 5 resolution strategies
- Implement OfflineQueue with retry mechanism
- Add LocalStorage and IndexedDB storage adapters
- Create event-driven architecture with 8 event types

**Frontend Integration**
- Add useSyncNote React hook for seamless sync
- Implement Storage wrapper with type safety
- Create SyncStatus UI component with visual indicators
- Add sync API client with pull/push endpoints
- Support auto-sync with configurable intervals
- Implement offline support with persistent queue

**Backend Integration**
- Add Prisma service for NestJS
- Create Sync module with controller and service
- Implement sync endpoints (pull/push/status)
- Add JWT authentication for sync operations
- Support batch operations and user-scoped data

**Migration Tools**
- Add LocalStorage to Database migration script
- Implement Zod schema validation
- Add topological sorting for hierarchy preservation
- Create rollback mechanism

### 📦 Packages

- Add `@flownote/sync@0.14.0` - Sync engine package
- Add `@flownote/database@2.0.0` - Prisma database package
- Add `@flownote/types@2.0.0` - Shared types package

### 🔧 Technical Details

**Files Changed:** 52 files
**Lines Added:** 11,482
**Commits:** 4 conventional commits

**Architecture:**
- Monorepo structure with Turbo
- TypeScript strict mode
- Event-driven sync system
- Modular package design

---

## [2.0.0](https://github.com/emrealmaoglu/flownote/compare/v1.7.1...v2.0.0) (2025-12-18)

### ⚠ BREAKING CHANGES

* **auth:** JWT token is no longer returned in response body.
Token is now set as HttpOnly cookie for improved security.

Changes:
- Add cookie-parser middleware to main.ts
- Update auth.controller to set HttpOnly cookie with token
- Add /auth/logout endpoint to clear cookie
- Add /auth/me endpoint for session validation
- Update JWT strategy to read token from cookie or Authorization header
- Update all auth controller tests for cookie-based authentication

Security improvements:
- HttpOnly flag prevents XSS attacks (JavaScript cannot access token)
- SameSite=strict prevents CSRF attacks
- Secure flag in production ensures HTTPS-only transmission
- 7-day cookie expiration

Sprint 11: Performance & Security - P0 Critical Fix

### security

* **auth:** migrate JWT token to HttpOnly cookie ([fd97af2](https://github.com/emrealmaoglu/flownote/commit/fd97af24828cf3d1f903a4a6bf04c88814e39461))

### ⚡ Performance Improvements

* **auth:** implement session caching ([0f8f5b3](https://github.com/emrealmaoglu/flownote/commit/0f8f5b321a9c4e7d6b5a0f8e9d4c3b2a1f0e9d8c))
