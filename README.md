# @nan0web/db-fs

<!-- %PACKAGE_STATUS% -->

Database provider for nan•web with node:fs.
Allows saving, loading, writing, and scanning files with async support,
ideal for lightweight monorepo tooling.

## Installation

How to install with npm?
```bash
npm install @nan0web/db-fs
```

How to install with pnpm?
```bash
pnpm add @nan0web/db-fs
```

How to install with yarn?
```bash
yarn add @nan0web/db-fs
```

## Quick Start

How to save and load a JSON file?
```js
import DBFS from "@nan0web/db-fs"
const db = new DBFS({ root: "__test_quick_start__" })
await db.connect()

const data = { name: "Test", value: 42 }
await db.saveDocument("test.json", data)
const loaded = await db.loadDocument("test.json")
console.info(loaded) // ← { name: "Test", value: 42 }

```

How to append content to a TXT file?
```js
import DBFS from "@nan0web/db-fs"
const db = new DBFS({ root: "__test_append__" })
await db.connect()

await db.writeDocument("log.txt", "First line\n")
await db.writeDocument("log.txt", "Second line")
const content = await db.loadDocument("log.txt")
console.info(content) // ← "First line\nSecond line"

```
## Directory Scanning

### `findStream(uri, { limit = -1, sort = "name", order = "asc", skipStat = false, skipSymbolicLink = true })`

Asynchronously scans directories with configurable limits and sorting.

- **Parameters**
  - `uri` (string) – Path to scan
  - `options.limit` (number) – Max entries to return (-1 for all)
  - `options.sort` (string) – Sort by "name", "mtime", or "size"
  - `options.order` (string) – Sort order "asc" or "desc"
  - `options.skipStat` (boolean) – Skip file stats for faster scan
  - `options.skipSymbolicLink` (boolean) – Ignore symbolic links

How to scan directory with findStream?
```js
import FS from "@nan0web/db-fs"
const db = new FS()
await db.connect()

const files = []
for await (const entry of db.findStream("src", { limit: 3, sort: "name", order: "asc" })) {
	files.push(entry.file.name)
}
console.info(files) // ← ['file-system', 'DBFS.js', 'DBFS.test.js']

```
## File Formats

Supports automatic handling of:
- `.json` – Pretty-printed
- `.jsonl` – Array of JSON lines
- `.csv`, `.tsv` – Delimited tables
- `.txt` – Plain text

How to save and load CSV file?
```js
import DBFS from "@nan0web/db-fs"
const db = new DBFS({ root: "__test_csv__" })
await db.connect()

const data = [
	{ Name: "John", Age: 30 },
	{ Name: "Jane", Age: 25 }
]
await db.saveDocument("people.csv", data)
const loaded = await db.loadDocument("people.csv")
console.info(loaded) // ← [ { Name: "John", Age: 30 }, { Name: "Jane", Age: 25 } ]

```
## Playground

Try examples safely with CLI sandbox:

How to run CLI sandbox?
```bash
git clone https://github.com/nan0web/db-fs.git
cd db-fs
npm install
npm run playground
```

## API Reference

### `saveDocument(uri, data)`

Saves data to a file with auto-formatting.

- **Parameters**
  - `uri` (string) – File path
  - `data` (any) – Data to save, formatted by extension

- **Returns**
  - Promise<boolean> – Success status

How to test saveDocument API?
```js
import DBFS from "@nan0web/db-fs"
const db = new DBFS({ root: "__test_save_api__" })
await db.connect()

const result = await db.saveDocument("test.json", { a: 1 })
console.info(result) // ← true
```
### `loadDocument(uri, defaultValue?)`

Loads file content parsed by extension.

- **Parameters**
  - `uri` (string) – File path
  - `defaultValue` (any) – Fallback if not found

- **Returns**
  - Promise<any> – Parsed content or default

How to test loadDocument API?
```js
import DBFS from "@nan0web/db-fs"
const db = new DBFS({ root: "__test_load_api__" })
await db.connect()

const empty = await db.loadDocument("missing.json", {})
console.info(empty) // ← {}

await db.saveDocument("data.json", { b: 2 })
const loaded = await db.loadDocument("data.json")
console.info(loaded) // ← { b: 2 }

```
### `writeDocument(uri, chunk)`

Appends raw string chunk to file.

- **Parameters**
  - `uri` (string) – File path
  - `chunk` (string) – Text to append

- **Returns**
  - Promise<boolean> – Success status

How to test writeDocument API?
```js
import DBFS from "@nan0web/db-fs"
const db = new DBFS({ root: "__test_write_api__" })
await db.connect()

await db.writeDocument("log.txt", "start\n")
await db.writeDocument("log.txt", "done")
const result = await db.loadDocument("log.txt")
console.info(result) // ← "start\ndone"

```
### `dropDocument(uri)`

Deletes a file or directory.

- **Parameters**
  - `uri` (string) – Path to delete

- **Returns**
  - Promise<boolean> – Success status

- **Throws**
  - Error if access violation or non-empty directory

How to test dropDocument API?
```js
import DBFS from "@nan0web/db-fs"
const db = new DBFS({ root: "__test_drop_api__" })
await db.connect()

await db.saveDocument("temp.txt", "Delete me")
const existsBefore = await db.loadDocument("temp.txt")
console.info(existsBefore) // ← "Delete me"

await db.dropDocument("temp.txt")
const missingAfter = await db.loadDocument("temp.txt", null)
console.info(missingAfter) // ← null

```
## Java•Script

Fully typed with TypeScript declaration files and JSdoc:

How many d.ts files cover it?

## Contributing

How to contribute? - [check CONTRIBUTING.md](./CONTRIBUTING.md)

## License

How to license? – see [LICENSE](./LICENSE)
