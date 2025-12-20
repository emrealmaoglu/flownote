# 📝 Changelog

All notable changes to FlowNote will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🚀 Features

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
