---
version: 1.2.2
type: bugfix
status: done
locale: en
models: []
---

[Українська версія](./task.md)

# 🚀 Mission: Fix DBFS Path Resolution for Relative Roots

## 🏁 Overview
Fixed a critical path resolution bug in `DBFS.location()` where virtual absolute paths (starting with `/`) were incorrectly treated as host filesystem absolutes, leading to `ENOENT` errors when working with relative roots.

## 👥 User Stories
> As a developer, I want to use relative paths for `root` in DBFS (e.g., `public/data`) so that the database deploys relative to the current working directory, rather than attempting to create folders at the disk root `/`.

## 🏗 Data-Driven Architecture
- Unified `DBFS.location()` as the single source of truth for system paths.
- Smart Prefix Stripping: clears virtual `/` in `root` and `file` segments, while preserving it in `cwd`.
- Restored and stabilized synchronous alias resolution.
- Corrected typization for `loadTXT` / `loadTXTAsync` in `txt.js` and `FSAdapter.js`.

## 🎯 Scope
- [x] Unify `location()` for all file operations (stat, load, save, write, drop, listDir).
- [x] Ensure correct handling of virtual absolute URIs (`/cards/doc.json`).
- [x] Restore alias support in synchronous resolution.
- [x] Fix `loadTXT` typization (remove `@ts-ignore`, add JSDoc).

## ✅ Acceptance Criteria (DoD)
- [x] Contract tests (`task.spec.js` / `task.test.js`) passed.
- [x] `npm run test:all` — 200/200 pass, 0 fail, tsc clean, knip clean.
- [x] Backward compatibility: no existing tests broken.
