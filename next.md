# @nan0web/db-fs — Roadmap

## Done ✅

- ~~FSDriver як чистий I/O бекенд~~ — `FSAdapter.js` стабільний
- ~~Markdown-as-Data~~ — frontmatter + content parsing в `loadDocumentAs`
- ~~`extract()` override~~ — DBFS-specific subset creation

## ✅ UDA 2.0 Integration (from `@nan0web/db` v1.3.0) — DONE 25.02.2026

Base `DB` тепер емітить `change` events з `set()`, `saveDocument()`, `dropDocument()`.
DBFS **override'ить** `saveDocument()` і `dropDocument()` — тепер з `this.emit('change')`.

- [x] Task 1: `emit('change')` в `saveDocument()` — `{ uri, type: 'save', data }`
- [x] Task 2: `emit('change')` в `dropDocument()` — `{ uri, type: 'drop' }` (dir + file)
- [x] Task 3: Тести `src/DBFS.watch.test.js` — 2/2 pass
- [x] Task 4: `knip` + `audit` scripts додані до `test:all` pipeline
- [x] `@nan0web/db` оновлено до `^1.3.0` (peerDependencies + devDependencies)
- [x] `yaml` додано до `dependencies` (fix standalone ERR_MODULE_NOT_FOUND)
- [x] Version bumped to `1.1.2`

#.
