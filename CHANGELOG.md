# Changelog

## [1.1.2] — 2026-02-25

### Fixed

- **Critical:** Added `yaml` to `dependencies` — standalone/global install no longer crashes with `ERR_MODULE_NOT_FOUND` (#2026-02-25-01)
- **Node.js v25 compat:** Replaced all `rmdirSync({ recursive })` with `rmSync({ recursive, force })` in test utilities and `FSAdapter.rmdirSync()` wrapper
- **README.md.js:** `loadDocument('*.md')` now returns parsed object after `loadMD` addition — switched to `loadDocumentAs('.txt')` for raw text assertions

### Added

- **UDA 2.0 Change Events:** `saveDocument()` emits `{ uri, type: 'save', data }`, `dropDocument()` emits `{ uri, type: 'drop' }` — enables reactive `watch()` patterns from `@nan0web/db@1.3.0`
- `src/DBFS.watch.test.js` — 2 tests for change event verification
- `knip.json` — production lint config per system.md
- `knip` and `audit` scripts added to `test:all` pipeline

### Changed

- `@nan0web/db` upgraded from `^1.2.0` to `^1.3.0` (peer + dev)
- `knip` script uses `pnpm dlx knip --production`

## [1.1.1] — 2026-02-18

### Fixed

- `saveMD` string destructuring bug — string/Buffer guard added

## [1.1.0] — 2026-02-15

### Added

- Markdown frontmatter support (`loadMD`, `saveMD`, `parseMD`)

## [1.0.0] — Initial release

- FSDriver, FSAdapter, DBFS core
- File format support: JSON, YAML, CSV, TXT, JSONL, MD
- `findStream()` async directory scanning
- ProvenDoc README.md.js
