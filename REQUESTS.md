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

## Request #2026-03-10-01: Aliases (Virtual File Projection)

- **From:** nan0web.app (Documentation Engine)
- **Priority:** 🟠 High
- **Status:** ✅ DONE (11.03.2026)

### Problem

`nan0web.app` потребує механізму, де запит до `docs/en/README.md` повертає вміст кореневого `./README.md` без фізичного копіювання. Це зберігає єдине джерело правди та запобігає розмноженню файлів.

### API

```js
const db = DBFS.from({
  root: 'docs/',
  aliases: {
    'en/README.md': '../../README.md', // відносно root
    'en/project.md': '../../project.md',
  },
})

// Запит до 'en/README.md' прозоро повертає вміст кореневого README.md
const doc = await db.getDocument('en/README.md')
```

### Implementation

В `DBFS.js`:

- Наслідується підтримка `resolverAlias(uri)` з `DB.resolve()`.
- У `DBFS.ensureAccess` додано виключення для `path.startsWith('..')`, якщо запитаний `uri` явно вказано у реєстрі `this.aliases` (`uri !== this.resolveAlias(uri)`). Це дозволяє alias-ам легально виходити за межі "віртуального контейнера" DB.

### Tasks

- [x] Додати поле `aliases` (Map<string, string>) у конструктор `DBFS`. (Наслідується від `DB`)
- [x] У `loadDocumentAs()` — резолвити URI через aliases перед побудовою шляху. (Безкоштовно через `DB.resolve`)
- [x] У `statDocument()` — аналогічна перевірка aliases. (Безкоштовно через `DB.resolve`)
- [x] У `ensureAccess()` — дозволити доступ за межі root для алиасованих шляхів.
- [x] Тести: `DBFS.aliases.test.js` — мінімум 4 кейси:
  - Читання через alias повертає коректний вміст
  - Stat через alias повертає валідний DocumentStat
  - Fallback на звичайний шлях якщо alias не задано

## Request #2026-03-10-02: Locale Auto-Detection

- **From:** nan0web.app (Documentation Engine)
- **Priority:** 🟡 Medium
- **Status:** ✅ DONE (14.03.2026)
- **Depends on:** Request #2026-03-10-01

### Problem

При ініціалізації з `root: 'docs/'` рушій має автоматично визначити доступні локалі зі структури тек (`docs/en/`, `docs/uk/`), зіставивши їх із вбудованим словником мов (ISO 639-1 / BCP 47).

### API

```js
const db = DBFS.from({ root: 'docs/' })
const langs = await db.detectLocales()
// → [{ locale: 'en', title: 'English', dir: 'ltr' }, { locale: 'uk', title: 'Українська', dir: 'ltr' }]
```

### Tasks

- [x] Реалізувати `detectLocales()` метод в `DBFS`.
- [x] Зіставляти імена тек першого рівня з реєстром мов (`data/langs.yaml` — живе у `nan0web.app`).
- [x] Повертати масив `LocaleEntry[]`.
- [x] Тести: `DBFS.locales.test.js` — мінімум 3 кейси.

## Request #2026-03-13-01: saveDocumentAs API

- **From:** @nan0web/0hcnai.framework
- **Priority:** 🟠 High
- **Goal:** Add `saveDocumentAs(ext, uri, data)` to DBFS to bypass native formatters and save raw data directly.
- **Status:** ✅ DONE (13.03.2026)
