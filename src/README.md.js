import { describe, it, after, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import FS from './index.js'
import { NoConsole } from "@nan0web/log"
import { DocsParser, DatasetParser } from "@nan0web/test"
import { rmdirSync } from 'node:fs'
import { resolve } from "node:path"

class DBFS extends FS {
	constructor(input) {
		super({ ...input, cwd: resolve(process.cwd(), "__test_fs__") })
	}
}

const rootFs = new FS()

let pkg
const fs = new DBFS({ root: "." })

// Load package.json once before tests
before(async () => {
	const doc = await rootFs.loadDocument('package.json', {})
	pkg = doc || {}
	const testDir = fs.absolute()
	rmdirSync(testDir, { recursive: true })
})

let console

beforeEach(() => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the documentation tested ensures it's correct.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/db-fs
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * Database provider for nan•web with node:fs.
	 * Allows saving, loading, writing, and scanning files with async support,
	 * ideal for lightweight monorepo tooling.
	 *
	 * ## Installation
	 */
	it("How to install with npm?", () => {
		/**
		 * ```bash
		 * npm install @nan0web/db-fs
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/db-fs")
	})
	/**
	 * @docs
	 */
	it("How to install with pnpm?", () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/db-fs
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/db-fs")
	})
	/**
	 * @docs
	 */
	it("How to install with yarn?", () => {
		/**
		 * ```bash
		 * yarn add @nan0web/db-fs
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/db-fs")
	})

	/**
	 * @docs
	 * ## Quick Start
	 */
	it('How to save and load a JSON file?', async () => {
		//import DBFS from "@nan0web/db-fs"
		const db = new DBFS({ root: "__test_quick_start__" })
		await db.connect()

		const data = { name: "Test", value: 42 }
		await db.saveDocument("test.json", data)
		const loaded = await db.loadDocument("test.json")
		console.info(loaded) // ← { name: "Test", value: 42 }

		assert.deepStrictEqual(loaded, data)
		await db.disconnect()
	})

	/**
	 * @docs
	 */
	it('How to append content to a TXT file?', async () => {
		//import DBFS from "@nan0web/db-fs"
		const db = new DBFS({ root: "__test_append__" })
		await db.connect()

		await db.writeDocument("log.txt", "First line\n")
		await db.writeDocument("log.txt", "Second line")
		const content = await db.loadDocument("log.txt")
		console.info(content) // ← "First line\nSecond line"

		assert.equal(console.output()[0][1], "First line\nSecond line")
		await db.disconnect()
	})

	/**
	 * @docs
	 * ## Directory Scanning
	 *
	 * ### `findStream(uri, { limit = -1, sort = "name", order = "asc", skipStat = false, skipSymbolicLink = true })`
	 *
	 * Asynchronously scans directories with configurable limits and sorting.
	 *
	 * - **Parameters**
	 *   - `uri` (string) – Path to scan
	 *   - `options.limit` (number) – Max entries to return (-1 for all)
	 *   - `options.sort` (string) – Sort by "name", "mtime", or "size"
	 *   - `options.order` (string) – Sort order "asc" or "desc"
	 *   - `options.skipStat` (boolean) – Skip file stats for faster scan
	 *   - `options.skipSymbolicLink` (boolean) – Ignore symbolic links
	 */
	it("How to scan directory with findStream?", async () => {
		//import FS from "@nan0web/db-fs"
		const db = new FS()
		await db.connect()

		const files = []
		for await (const entry of db.findStream("src", { limit: 99, sort: "name", order: "asc" })) {
			files.push(entry.file.path)
		}
		console.info(files) // ← ['file-system', 'DBFS.js', 'DBFS.test.js']

		assert.ok(files.length <= 99)
		assert.ok(files.includes("src/DBFS.js"))
		await db.disconnect()
	})

	/**
	 * @docs
	 * ## File Formats
	 *
	 * Supports automatic handling of:
	 * - `.json` – Pretty-printed
	 * - `.jsonl` – Array of JSON lines
	 * - `.csv`, `.tsv` – Delimited tables
	 * - `.txt` – Plain text
	 */
	it("How to save and load CSV file?", async () => {
		//import DBFS from "@nan0web/db-fs"
		const db = new DBFS({ root: "__test_csv__" })
		await db.connect()

		const data = [
			{ Name: "John", Age: 30 },
			{ Name: "Jane", Age: 25 }
		]
		await db.saveDocument("people.csv", data)
		const loaded = await db.loadDocument("people.csv")
		console.info(loaded) // ← [ { Name: "John", Age: 30 }, { Name: "Jane", Age: 25 } ]

		assert.deepStrictEqual(loaded, data)
		await db.disconnect()
	})

	/**
	 * @docs
	 * ## Playground
	 *
	 * Try examples safely with CLI sandbox:
	 */
	it("How to run CLI sandbox?", () => {
		/**
		 * ```bash
		 * git clone https://github.com/nan0web/db-fs.git
		 * cd db-fs
		 * npm install
		 * npm run play
		 * ```
		 */
		assert.ok(String(pkg.scripts?.play).includes("node play"))
	})

	/**
	 * @docs
	 * ## API Reference
	 *
	 * ### `saveDocument(uri, data)`
	 *
	 * Saves data to a file with auto-formatting.
	 *
	 * - **Parameters**
	 *   - `uri` (string) – File path
	 *   - `data` (any) – Data to save, formatted by extension
	 *
	 * - **Returns**
	 *   - Promise<boolean> – Success status
	 */
	it("How to test saveDocument API?", async () => {
		//import DBFS from "@nan0web/db-fs"
		const db = new DBFS({ root: "__test_save_api__" })
		await db.connect()

		const result = await db.saveDocument("test.json", { a: 1 })
		console.info(result) // ← true
		assert.ok(result)
		await db.disconnect()
	})

	/**
	 * @docs
	 * ### `loadDocument(uri, defaultValue?)`
	 *
	 * Loads file content parsed by extension.
	 *
	 * - **Parameters**
	 *   - `uri` (string) – File path
	 *   - `defaultValue` (any) – Fallback if not found
	 *
	 * - **Returns**
	 *   - Promise<any> – Parsed content or default
	 */
	it("How to test loadDocument API?", async () => {
		//import DBFS from "@nan0web/db-fs"
		const db = new DBFS({ root: "__test_load_api__" })
		await db.connect()

		const empty = await db.loadDocument("missing.json", {})
		console.info(empty) // ← {}

		await db.saveDocument("data.json", { b: 2 })
		const loaded = await db.loadDocument("data.json")
		console.info(loaded) // ← { b: 2 }

		assert.deepStrictEqual(empty, {})
		assert.deepStrictEqual(loaded, { b: 2 })
		await db.disconnect()
	})

	/**
	 * @docs
	 * ### `writeDocument(uri, chunk)`
	 *
	 * Appends raw string chunk to file.
	 *
	 * - **Parameters**
	 *   - `uri` (string) – File path
	 *   - `chunk` (string) – Text to append
	 *
	 * - **Returns**
	 *   - Promise<boolean> – Success status
	 */
	it("How to test writeDocument API?", async () => {
		//import DBFS from "@nan0web/db-fs"
		const db = new DBFS({ root: "__test_write_api__" })
		await db.connect()

		await db.writeDocument("log.txt", "start\n")
		await db.writeDocument("log.txt", "done")
		const result = await db.loadDocument("log.txt")
		console.info(result) // ← "start\ndone"

		assert.equal(console.output()[0][1], "start\ndone")
		await db.disconnect()
	})

	/**
	 * @docs
	 * ### `dropDocument(uri)`
	 *
	 * Deletes a file or directory.
	 *
	 * - **Parameters**
	 *   - `uri` (string) – Path to delete
	 *
	 * - **Returns**
	 *   - Promise<boolean> – Success status
	 *
	 * - **Throws**
	 *   - Error if access violation or non-empty directory
	 */
	it("How to test dropDocument API?", async () => {
		//import DBFS from "@nan0web/db-fs"
		const db = new DBFS({ root: "__test_drop_api__" })
		await db.connect()

		await db.saveDocument("temp.txt", "Delete me")
		const existsBefore = await db.loadDocument("temp.txt")
		console.info(existsBefore) // ← "Delete me"

		await db.dropDocument("temp.txt")
		const missingAfter = await db.loadDocument("temp.txt", null)
		console.info(missingAfter) // ← null

		assert.ok(existsBefore)
		assert.equal(missingAfter, null)
		await db.disconnect()
	})

	/**
	 * @docs
	 * ## Java•Script
	 *
	 * Fully typed with TypeScript declaration files and JSdoc:
	 */
	it("How many d.ts files cover it?", async () => {
		assert.equal(pkg.types, "types/index.d.ts")
		assert.ok(String(pkg.scripts?.build).split(" ").includes("tsc"))
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it("How to contribute? - [check CONTRIBUTING.md](./CONTRIBUTING.md)", async () => {
		/** @docs */
		const text = await rootFs.loadDocument("CONTRIBUTING.md")
		assert.ok(String(text).includes("# Contributing"))
	})

	/**
	 * @docs
	 * ## License
	 */
	it("How to license? – see [LICENSE](./LICENSE)", async () => {
		/** @docs */
		const text = await rootFs.loadDocument("LICENSE")
		assert.ok(String(text).includes("ISC"))
	})
}

describe("README.md testing", testRender)

describe("Rendering README.md", async () => {
	let text = ""
	const parser = new DocsParser()
	const format = new Intl.NumberFormat("en-US").format

	text = String(parser.decode(testRender))
	await rootFs.saveDocument("README.md", text)

	const dataset = DatasetParser.parse(text, pkg.name)
	await rootFs.saveDocument(".datasets/README.dataset.jsonl", dataset)

	it(`document is rendered in README.md [${format(Buffer.byteLength(text))}b]`, async () => {
		const text = await rootFs.loadDocument("README.md")
		assert.ok(text.includes("## License"))
	})
})
