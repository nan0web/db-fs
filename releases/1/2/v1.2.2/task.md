---
version: 1.2.2
type: bugfix
status: done
locale: uk
models: []
---

[English version](./task.en.md)

# 🚀 Mission: Fix DBFS Path Resolution for Relative Roots

## 🏁 Overview
Виправлення критичної помилки резолвінгу шляхів у `DBFS.location()`, де віртуальні абсолютні шляхи (з початковим `/`) некоректно сприймалися як системні абсолютні, що призводило до `ENOENT` при роботі з релятивними коренями.

## 👥 User Stories
> Як розробник, я хочу використовувати релятивні шляхи для `root` у DBFS (наприклад, `public/data`), щоб база даних розгорталася відносно поточної робочої директорії, а не намагалася створити папки в корені диска `/`.

## 🏗 Data-Driven Architecture
- Уніфікація `DBFS.location()` як єдиного джерела істини для системних шляхів
- Smart Prefix Stripping: очищення віртуальних `/` у `root` та `file`, збереження у `cwd`
- Відновлення та стабілізація синхронного аліас-резолвінгу
- Коректна типізація `loadTXT` / `loadTXTAsync` у `txt.js` та `FSAdapter.js`

## 🎯 Scope
- [x] Уніфікувати `location()` для всіх file-операцій (stat, load, save, write, drop, listDir)
- [x] Забезпечити коректну обробку віртуальних абсолютних URI (`/cards/doc.json`)
- [x] Відновити підтримку аліасів у синхронному резолвінгу
- [x] Виправити типізацію `loadTXT` (прибрати `@ts-ignore`, додати JSDoc)

## ✅ Acceptance Criteria (DoD)
- [x] Контрактні тести (`task.spec.js`) написані і успішно проходять (Green)
- [x] `npm run test:all` — 200/200 pass, 0 fail, tsc clean, knip clean
- [x] Зворотна сумісність: жоден існуючий тест не зламаний
