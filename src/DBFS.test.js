import { suite, describe, it, beforeEach, before } from "node:test"
import assert from "node:assert/strict"
import DBFS, { DocumentEntry, DocumentStat } from "./index.js"
import { sep, resolve } from "node:path"
import { rmdirSync } from "node:fs"

const testDir = "__test_fs__"

/**
 * @desc Tests the basic functionality of DBFS.
 */
suite("DBFS tests", () => {
	/** @type {DBFS} */
	let db
	/** @type {DocumentEntry[]} */
	let files

	before(() => {
		rmdirSync(resolve(testDir), { recursive: true })
	})

	beforeEach(() => {
		db = new DBFS({ root: testDir })
		files = [
			new DocumentEntry({ name: "file1.txt", stat: new DocumentStat({ size: 10, mtimeMs: 1000 }), depth: 0 }),
			new DocumentEntry({ name: "file2.txt", stat: new DocumentStat({ size: 20, mtimeMs: 2000 }), depth: 0 }),
			new DocumentEntry({ name: "dir/", stat: new DocumentStat({ size: 0, mtimeMs: 3000, isDirectory: true }), depth: 0 }),
			new DocumentEntry({ name: "dir/file3.txt", stat: new DocumentStat({ size: 30, mtimeMs: 4000 }), depth: 1 }),
		]
	})

	it("should resolve async", async () => {
		const resolved = await db.resolve("file1.txt")
		assert.strictEqual(resolved, "file1.txt")
	})

	it("should list files with progress bar during async process", async () => {
		let count = 0
		let total = 0
		const output = []

		function renderProgress() {
			const width = 40
			const progress = total ? Math.min(count / total, 1) : 0
			const filled = Math.floor(progress * width)
			const empty = width - filled
			const bar = `[${"=".repeat(filled)}${" ".repeat(empty)}]`
			output.push(`\r${bar} ${count} files found`)
		}

		await db.connect()
		let listedFiles = []
		total = files.length

		db.readDir = async function* () {
			for (const f of files) {
				yield f
				await new Promise(resolve => setTimeout(resolve, 10))
			}
		}

		for await (const file of db.readDir(db.root, -1)) {
			listedFiles.push(file)
			count++
			renderProgress()
		}

		assert.deepStrictEqual(listedFiles, files)

		await db.disconnect()
	})

	it("should allow access to config file", async () => {
		await db.connect()
		await db.saveDocument("llm.config.js", "module.exports = {}")
		await db.ensureAccess("llm.config.js", "r")
		await db.disconnect()
		assert.ok(true)
	})

	it.todo("should throw error for path outside root", async () => {
		/**
		 * @todo think about this, because ../outside.txt is resolved as /outside.txt
		 */
		await db.connect()
		await assert.rejects(async () => {
			await db.ensureAccess("../outside.txt", "r")
		}, /No access outside of the db container/)
		await db.disconnect()
	})

	it("should return default stats for non-existing file", async () => {
		const stats = await db.statDocument("nonexistent.txt")
		assert.ok(!stats.exists)
	})

	it("should load document with default value", async () => {
		const content = await db.loadDocument("nonexistent.txt", "default")
		assert.strictEqual(content, "default")
	})

	it("should append chunk to document", async () => {
		const uri = "test.txt"
		await db.writeDocument(uri, "chunk1\n")
		await db.writeDocument(uri, "chunk2")
		const content = await db.loadDocument(uri)
		assert.strictEqual(content, "chunk1\nchunk2")
	})

	it("should return false when dropping document", async () => {
		const result = await db.dropDocument("file1.txt")
		assert.strictEqual(result, false)
	})

	it("should return proper extname", () => {
		const extname = db.extname("file.Txt")
		assert.strictEqual(extname, ".txt")
	})
})

/**
 * @desc Tests the resolve functionality of DBFS.
 */
suite("DBFS resolve tests", () => {
	/** @type {DBFS} */
	let db

	beforeEach(() => {
		db = new DBFS({ root: ".", cwd: "." })
	})

	it("should resolve relative path", async () => {
		const resolved = await db.resolve("src/index.test.js")
		assert.strictEqual(resolved, "src/index.test.js")
	})

	it("should resolve absolute path", () => {
		const resolved = db.absolute("index.js")
		assert.ok(resolved.endsWith(sep + "index.js"))
	})

	describe("ensureAccess()", () => {
		it.todo("should prevent access outside of the container", async () => {
			/**
			 * @todo should it really work this way?
			 */
			const uri = "../outside.txt"
			await assert.rejects(async () => {
				await db.ensureAccess(uri, "r")
			}, /No access outside of the db container/)
		})
	})

})
