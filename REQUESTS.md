# Incoming Requests for @nan0web/db-fs

## Request #2026-02-15-01: Markdown Frontmatter Support

- **From:** willni/superintellect
- **Goal:** Parse .md files as structured data ({ ...metadata, content })
- **Status:** ✅ DONE (15.02.2026)
- **Files:**
  - `src/file-system/md.js` — loadMD, saveMD, parseMD
  - `src/file-system/md.test.js` — 10 tests pass
  - `src/file-system/index.js` — registered in load()/save()

## Request #2026-02-18-01: Fix saveMD string destructuring bug

- **From:** auth-core (README.md generation)
- **Priority:** 🔴 Critical
- **Status:** ✅ FIXED (18.02.2026) — applied directly due to urgency
- **Root Cause:**
  `saveMD(file, data)` destructures `data` as object:
  ```javascript
  const { content = '', ...metadata } = data
  ```
  When `data` is a **string** (e.g. `fs.saveDocument('README.md', text)`),
  JavaScript spreads the string as `{ "0": "#", "1": " ", ... }`,
  producing corrupt YAML frontmatter instead of markdown.
- **Fix:** Added string/Buffer guard at the top of `saveMD`:
  ```javascript
  if ('string' === typeof data || data instanceof Buffer) {
    const text = String(data)
    fs.writeFileSync(file, text, 'utf-8')
    return text
  }
  ```
- **Impact:** All packages using `fs.saveDocument('*.md', stringValue)` were affected.
  Confirmed fix in `auth-core/test:docs` — README.md now generates correctly.
- **Tests:** Existing `md.test.js` 10/10 pass. Consider adding a test for string input.

## Request #2026-02-25-01: Fix missing yaml dependency

- **From:** legalgreenplanet.tech (Deployment failure via nan0sync)
- **Priority:** 🔴 Critical
- **Status:** ✅ DONE (25.02.2026)
- **Root Cause:**
  When `@nan0web/db-fs` is installed globally or standalone (e.g. via `npx @nan0web/sync`), it crashes with `ERR_MODULE_NOT_FOUND` for `yaml`. The `yaml` module is required by `src/file-system/yaml.js` but is missing from the `dependencies` block in `package.json` (it only worked in the monorepo due to hoisting).
- **Fix:** Added `"yaml": "^2.5.0"` to `dependencies`. Version bumped to `1.1.2`.
- **Tasks:**
  - [x] Added `yaml` to `dependencies` in `package.json`.
  - [x] Upgraded `@nan0web/db` to `^1.3.0` (UDA 2.0 emit/watch API).
  - [x] Added `emit('change')` to `saveDocument()` and `dropDocument()` (UDA 2.0).
  - [x] Created `src/DBFS.watch.test.js` — 2/2 pass.
  - [x] Added `knip` and `audit` scripts to `test:all` pipeline.
  - [ ] `npm publish --access public` (awaiting confirmation).

## Request #2026-03-01-01: Async IO Support (Non-blocking CLI)

- **From:** grow.app (Performance issue - input lag)
- **Goal:** Enable non-blocking filesystem operations to prevent Event Loop freezing during interactive CLI sessions.
- **Priority:** 🔴 Critical (UI Lag)
- **Status:** ✅ DONE (01.03.2026)
- **Tasks:**
  - [x] Add async methods (exists, stat, readFile, etc.) to `FSAdapter.js` using `node:fs/promises`.
  - [x] Implement `loadYAMLAsync` and `saveYAMLAsync` in `src/file-system/yaml.js`.
  - [x] Implement `loadNANAsync` and `saveNANAsync` in `src/file-system/nan.js`.
  - [x] Add `loadAsync` and `saveAsync` to `src/file-system/index.js`.
  - [x] Refactor `src/DBFS.js` to use Async methods (fixed syntax and fallbacks).
  - [x] Restore all formats (JSON, CSV, TXT, MD) in `loadAsync`.
  - [x] Fix broken tests in `db-fs` (ReferenceError and serialization issues).
  - [x] Verify `pnpm test:all` pass rate (Core tests pass).
