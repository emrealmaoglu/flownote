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

* **db:** add performance indexes for common queries ([a06d9b2](https://github.com/emrealmaoglu/flownote/commit/a06d9b231d8f6271f46b90474a549d858c1cc9a6))

## [1.7.1](https://github.com/emrealmaoglu/flownote/compare/v1.7.0...v1.7.1) (2025-12-18)


### 🐛 Bug Fixes

* **test:** remove unused variable assignments and adjust coverage thresholds ([c43a923](https://github.com/emrealmaoglu/flownote/commit/c43a9237459c847cc35e4e800b9ffa7ba177de1b))
* **test:** remove unused variables in auth.service.spec.ts ([14f9c2a](https://github.com/emrealmaoglu/flownote/commit/14f9c2a7a686d990a5c4cafb08648db3fa5332d9))


### 📚 Documentation

* add CONTRIBUTING.md with commit and PR guidelines ([b9981c2](https://github.com/emrealmaoglu/flownote/commit/b9981c2d1a06ea3080a2967ba2f74948c01b6fa9))
* **adr:** add ADR-003 release strategy and versioning ([0b2fde8](https://github.com/emrealmaoglu/flownote/commit/0b2fde8d01ca9bcb77ecd13afb93bbcb2503ce11))

## [1.7.0](https://github.com/emrealmaoglu/flownote/compare/v1.6.2...v1.7.0) (2025-12-17)


### 🚀 Features

* **frontend:** sprint 7.5 inline edit and focus mode ([8bec2df](https://github.com/emrealmaoglu/flownote/commit/8bec2df8a1dd89cbf816ee3bd36b82ec9e7513fb))
* **sprint-7.5:** complete focus mode, delete flow, and incident fixes ([36df078](https://github.com/emrealmaoglu/flownote/commit/36df0781090fc19b65a04aa93a760f3066585582))
* **sprint-8:** Trust & Identity MVP+ (DB Safety, Note Icons/Covers, Quality Gates) ([64b9c90](https://github.com/emrealmaoglu/flownote/commit/64b9c90ba00a6f1d135939f716103425771af538))


### 🐛 Bug Fixes

* **backend,frontend:** resolve note save and sidebar refresh issues ([458bee0](https://github.com/emrealmaoglu/flownote/commit/458bee032c1c7cd6bc0f434cf04c33c03b91a1ac))
* **backend:** disable validationpipe whitelist for zod compatibility ([c4d534c](https://github.com/emrealmaoglu/flownote/commit/c4d534c006d23b0410e8851eaecd13ff6371775c))
* **backend:** relax validation schemas for heading and image blocks ([9115d67](https://github.com/emrealmaoglu/flownote/commit/9115d675811bdd6cb102d326f9e03694a0d79cf2))
* **backend:** remove unused UpdateDateColumn import ([54d149c](https://github.com/emrealmaoglu/flownote/commit/54d149cdfbec91ee4086cbb833894401a726b77f))
* **backend:** resolve data loss and save failures ([a33f898](https://github.com/emrealmaoglu/flownote/commit/a33f898f693e2a9fdd492dd1912f1c9f1976f3e9))
* **frontend:** enable auth token injection in api client interceptor ([e4eabf9](https://github.com/emrealmaoglu/flownote/commit/e4eabf933a4b2838fac0fc6211a585707a864363))
* **frontend:** exclude auth endpoints from token injection logic ([b0e9d30](https://github.com/emrealmaoglu/flownote/commit/b0e9d30d6e1dfd02a06b35d8309988987eef4403))
* resolve cors blockage on delete & improve focus mode ux ([210a173](https://github.com/emrealmaoglu/flownote/commit/210a1730e5f6b7a3ea3c73160aaef8ae21924499))
* resolve lint, test, and build issues for sprint 8 ([4c88e90](https://github.com/emrealmaoglu/flownote/commit/4c88e90cff175129f9ef9a5717456378084355dd))

## [1.6.2](https://github.com/emrealmaoglu/flownote/compare/v1.6.1...v1.6.2) (2025-12-16)


### 🐛 Bug Fixes

* sprint 7 critical bug fixes ([2a4c6c2](https://github.com/emrealmaoglu/flownote/commit/2a4c6c26e968651129fa69d915517d860d7b7f29))

## [1.6.1](https://github.com/emrealmaoglu/flownote/compare/v1.6.0...v1.6.1) (2025-12-15)


### 🐛 Bug Fixes

* **test:** exclude e2e folder from vitest ([5ca2d3c](https://github.com/emrealmaoglu/flownote/commit/5ca2d3c6c74d02bd4603d93f15039c03cdf28b26))


### 📚 Documentation

* add roadmap and lessons learned ([e000e7b](https://github.com/emrealmaoglu/flownote/commit/e000e7bde74f0665293dc4111554f469c7079129))

## [1.6.0](https://github.com/emrealmaoglu/flownote/compare/v1.5.0...v1.6.0) (2025-12-15)


### 🚀 Features

* **security:** add helmet security headers and rate limiting ([b94e3af](https://github.com/emrealmaoglu/flownote/commit/b94e3afc5a01571ca82d0f116c27d37b16eeae90))


### 🐛 Bug Fixes

* **ui:** use import.meta.env for vite compatibility ([85cf93c](https://github.com/emrealmaoglu/flownote/commit/85cf93cd317dac09402a03623ee8e1dca15973aa))

## [1.5.0](https://github.com/emrealmaoglu/flownote/compare/v1.4.0...v1.5.0) (2025-12-14)


### 🚀 Features

* **admin:** add admin module and user management page ([c742e12](https://github.com/emrealmaoglu/flownote/commit/c742e1232d5516610e91119d72ab658da3521a7b))
* **auth:** add username, role and identifier-based login ([942671c](https://github.com/emrealmaoglu/flownote/commit/942671c581298ff8100786db8f625257b9182553))
* **config:** add sqlite support for local development ([e2728f4](https://github.com/emrealmaoglu/flownote/commit/e2728f4f522d6b91fbc03e600de2464112a238a9))
* **ui:** update auth pages with username and role support ([8a6e48b](https://github.com/emrealmaoglu/flownote/commit/8a6e48b8c4d8438a3a7434b2c121b07efdaf10dd))

## [1.4.0](https://github.com/emrealmaoglu/flownote/compare/v1.3.0...v1.4.0) (2025-12-14)


### 🚀 Features

* **templates:** implement templates system with builtin templates ([7b1c695](https://github.com/emrealmaoglu/flownote/commit/7b1c695990aa9e57852288973bbd40ddbf579e2f))


### 🐛 Bug Fixes

* **ci:** configure git remote with pat for semantic-release push ([709a24d](https://github.com/emrealmaoglu/flownote/commit/709a24d209cd07d6d86f22fcf56e638d96d0b0a4))
* **ci:** use persist-credentials with pat for semantic-release ([54fe320](https://github.com/emrealmaoglu/flownote/commit/54fe320f2ffcae60785bcd1237ef14f46398fce4))


### 📚 Documentation

* **roadmap:** add sprint 1-2 features and v1.3.0 release info ([38b8007](https://github.com/emrealmaoglu/flownote/commit/38b8007b424eab62ab5d0adcc2ddb233756720f4))

## [1.3.0](https://github.com/emrealmaoglu/flownote/compare/v1.2.0...v1.3.0) (2025-12-14)


### 🚀 Features

* add bi-directional linking feature ([05ede59](https://github.com/emrealmaoglu/flownote/commit/05ede59e79139f64e3c72383e59ccf7793f31a38))


### 🐛 Bug Fixes

* **backend:** add notelink repository mock to service tests ([6550cd7](https://github.com/emrealmaoglu/flownote/commit/6550cd76c6e4c97fe3c1eea96c072137d1171db1))

## [1.2.0](https://github.com/emrealmaoglu/flownote/compare/v1.1.0...v1.2.0) (2025-12-13)


### 🚀 Features

* complete drag and drop block management feature ([ebbcca3](https://github.com/emrealmaoglu/flownote/commit/ebbcca39d3461851770ec463f2855332ffcdff00))
* **frontend:** add drag and drop block management components ([23131d6](https://github.com/emrealmaoglu/flownote/commit/23131d6afdd4082e96fbceb7c1e17478042c8f14))

## [1.1.0](https://github.com/emrealmaoglu/flownote/compare/v1.0.0...v1.1.0) (2025-12-13)


### 🚀 Features

* **backend:** add pg_trgm migration and codeblock schema ([a4b200f](https://github.com/emrealmaoglu/flownote/commit/a4b200fc48dc91f3795e0ce27950823265ebc1e3))
* **backend:** add pg_trgm search indexes and code block schema ([f2aa7aa](https://github.com/emrealmaoglu/flownote/commit/f2aa7aabc23bdec979eccaa0c25aad0a0f8e450a))
* **backend:** add search service and endpoint for command palette ([087bc40](https://github.com/emrealmaoglu/flownote/commit/087bc40292075f2063eee8d5003f077e04fcbcd9))
* **frontend:** add code block renderer with syntax highlighting ([43c2f01](https://github.com/emrealmaoglu/flownote/commit/43c2f01b37b6f19c7a6e47cfdd15f9d072992232))
* **frontend:** add command palette with global search ([cb21470](https://github.com/emrealmaoglu/flownote/commit/cb21470125c6c43050a836bedc648f5d42406e79))
* **frontend:** add focus mode for distraction-free writing ([4d5a032](https://github.com/emrealmaoglu/flownote/commit/4d5a032f66359f9206372cd599ca18840e965043))
* **notes:** add codeblock support and pg_trgm search indexes ([8e2a132](https://github.com/emrealmaoglu/flownote/commit/8e2a1323adf9a766bed76a4d4d649eaee2df12b7))
* **notes:** add search service and endpoint for command palette ([507c241](https://github.com/emrealmaoglu/flownote/commit/507c241a255f65100bafad8a639efec7490007ff))


### 🐛 Bug Fixes

* **frontend:** separate focus mode context files for react-refresh ([df75383](https://github.com/emrealmaoglu/flownote/commit/df75383576bad12eba5533bc782e8c01f25691a6))

## 1.0.0 (2025-12-12)


### 🚀 Features

* **auth:** implement jwt authentication and protected routes ([1c89da0](https://github.com/emrealmaoglu/flownote/commit/1c89da053ac095fc23d9426ca2fdcf9081379784))
* **backend:** implement notes module with jsonb and tests ([6f0315f](https://github.com/emrealmaoglu/flownote/commit/6f0315f2881cc7296bf69ac5da2b4df3bc4f565e))
* **setup:** initialize project structure, docker, and ci/cd pipeline ([7a4c63d](https://github.com/emrealmaoglu/flownote/commit/7a4c63d88213ff6c68595b30915446d62e460ff1))
* **ui:** implement block renderer, routing and api integration ([8b509ea](https://github.com/emrealmaoglu/flownote/commit/8b509ea7c4986c417ba5908c280aad4b32b28328))


### 🐛 Bug Fixes

* **ci:** add eslint config to backend ([2658a69](https://github.com/emrealmaoglu/flownote/commit/2658a69c32f5a109e6ca72c53f62496df60412e5))
* **ci:** add eslint config to frontend ([3acc475](https://github.com/emrealmaoglu/flownote/commit/3acc475e49af6492998246f2883d4cfc9ff8890a))
* **ci:** disable body-max-line-length for semantic-release commits ([50997a0](https://github.com/emrealmaoglu/flownote/commit/50997a09ebe03f645b18b5b2c00c58f91744fa8a))
* **docker:** use npm install instead of npm ci for workspace packages ([5969643](https://github.com/emrealmaoglu/flownote/commit/5969643124a76e87f446764ac75e91c0ba5c7415))
* **frontend:** resolve lint warnings for react hooks and fast refresh ([13d865c](https://github.com/emrealmaoglu/flownote/commit/13d865c6e4a865279a5c45510bec74ba7de478f4))
* **release:** add semantic-release changelog and git plugins ([c34eff4](https://github.com/emrealmaoglu/flownote/commit/c34eff47e50597ad56b3764a66c6a5e76df72d02))
* **release:** update repository url to actual github repo ([d4da23a](https://github.com/emrealmaoglu/flownote/commit/d4da23a1b3e191ec47c80d42adabf6c14c8f3d36))


### 📚 Documentation

* **readme:** prepare final documentation and polish for v1.0.0 release ([7fae86f](https://github.com/emrealmaoglu/flownote/commit/7fae86ff4072dab67657066af9a7dc709c556d7d))
* **roadmap:** mark all phases complete ([6856cb7](https://github.com/emrealmaoglu/flownote/commit/6856cb76e49675e13b860fd5daf78acc993816f2))
