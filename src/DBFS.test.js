import { describe, it, beforeEach, afterEach, before } from "node:test"
import assert from "node:assert/strict"
import { DocumentEntry, DocumentStat } from "./index.js"
import { sep, resolve } from "node:path"
import { existsSync, readFileSync } from "node:fs"
import { NoConsole } from "@nan0web/log"
import TestDir, { DBFS } from "./test.js"

const testDir = new TestDir("dbfs-test-js")

/**
 * @desc Tests the basic functionality of DBFS.
 */
describe("DBFS tests", () => {
	/** @type {DBFS} */
	let db
	/** @type {DocumentEntry[]} */
	let files

	before(() => {
	})

	beforeEach(async () => {
		testDir.erase()
		db = new DBFS({ root: testDir.root })
		await db.connect()
		files = [
			new DocumentEntry({ name: "file1.txt", stat: new DocumentStat({ size: 10, mtimeMs: 1000 }), depth: 0 }),
			new DocumentEntry({ name: "file2.txt", stat: new DocumentStat({ size: 20, mtimeMs: 2000 }), depth: 0 }),
			new DocumentEntry({ name: "dir/", stat: new DocumentStat({ size: 0, mtimeMs: 3000, isDirectory: true }), depth: 0 }),
			new DocumentEntry({ name: "dir/file3.txt", stat: new DocumentStat({ size: 30, mtimeMs: 4000 }), depth: 1 }),
		]
	})

	afterEach(async () => {
		await db.disconnect()
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
	})

	it("should allow access to config file", async () => {
		await db.saveDocument("llm.config.js", "module.exports = {}")
		await db.ensureAccess("llm.config.js", "r")
		assert.ok(true)
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

	it("should create dump with indexes and list dumped dir", async () => {
		// Create test data
		const root = testDir.join("dump")
		const predefined = [
			["test1.txt", "content1"],
			["test2.json", { key: "value" }],
			["test3.csv", [
				{ name: "John", age: 30 },
				{ name: "Jane", age: 25 },
			]],
		]
		const db = new DBFS({
			root,
			predefined,
			console: new NoConsole(),
		})
		await db.connect()

		const fs = new DBFS({ root })
		await fs.connect()
		await db.dump(fs)
		const txt = await fs.loadDocument("test1.txt")
		const json = await fs.loadDocument("test2.json")
		const csv = await fs.loadDocument("test3.csv")

		assert.equal(txt, predefined[0][1])
		assert.deepStrictEqual(json, predefined[1][1])
		assert.deepStrictEqual(csv, predefined[2][1])

		const content = await fs.listDir(".")
		assert.equal(content.length, 3)

		await db.disconnect()
	})
})

/**
 * @desc Tests the resolve functionality of DBFS.
 */
describe("DBFS resolve tests", () => {
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
})

describe("DBFS.extract", () => {
	it("should extract into DBFS", async () => {
		const db = new DBFS({
			predefined: [
				["dir/index.txt", "F index.html 0 0"],
				["dir/index.html", ""],
				["index.html", ""]
			]
		})
		await db.connect()
		const extracted = db.extract("dir")
		assert.ok(extracted instanceof DBFS)
		assert.equal(extracted.meta.size, 3)
	})
})

/**
 * @desc Tests for saveDocument and indexing
 */
describe("DBFS saveDocument and indexing tests", () => {
	/** @type {DBFS} */
	let db
	const root = testDir.join("indexes")

	beforeEach(async () => {
		db = new DBFS({ root })
		await db.connect()
	})

	afterEach(async () => {
		await db.disconnect()
	})

	it("should create indexes when saving documents", async () => {
		// Save a document
		const result = await db.saveDocument("index-test.txt", "test content")
		assert.ok(result)

		// Check that indexes were created
		assert.ok(db.meta.has("index-test.txt"))
		assert.ok(db.data.has("index-test.txt"))

		// Check that data was marked as not loaded (false)
		assert.strictEqual(db.data.get("index-test.txt"), false)

		// Check that stat was saved in meta
		const stat = db.meta.get("index-test.txt")
		assert.ok(stat.exists)
		assert.ok(stat.isFile)
	})

	it("should update indexes when saving existing documents", async () => {
		// Save initial document
		await db.saveDocument("update-test.json", { version: 1 })

		// Get initial stat
		const initialStat = db.meta.get("update-test.json")
		assert.ok(initialStat.exists)
		assert.ok(initialStat.isFile)

		// Save updated document
		await db.saveDocument("update-test.json", { version: 2 })

		// Get updated stat
		const updatedStat = db.meta.get("update-test.json")
		assert.ok(updatedStat.exists)
		assert.ok(updatedStat.isFile)

		// Check that the stat was updated (mtime should be different)
		assert.ok(updatedStat.mtimeMs >= initialStat.mtimeMs)
	})
})

/**
 * @desc Test cases for directory index saving and loading
 */
describe("DBFS directory index handling", () => {
	/** @type {DBFS} */
	let db
	const root = testDir.join("indexes")

	beforeEach(async () => {
		testDir.erase()
		db = new DBFS({ root })
		await db.connect()
	})

	afterEach(async () => {
		await db.disconnect()
	})

	it("should save index.txt with directory entries", async () => {
		const db = new DBFS({
			root,
			predefined: [
				["file1.txt", "text content"],
				["file2.json", { text: "content" }],
				["subdir/index.html", "<html></html>"],
			]
		})
		await db.connect()
		await db.dump()

		// Execute: Save index for root directory
		await db.saveIndex(".")

		// Verify: Check that index.txt was created
		const indexPath = db.location("index.txt")
		assert.ok(existsSync(indexPath), "index.txt should exist")

		// Verify: Check content of index.txt
		const content = readFileSync(indexPath, "utf-8")
		assert.ok(content.includes("file1.txt"), "index.txt should contain file1.txt")
		assert.ok(content.includes("file2.json"), "index.txt should contain file2.json")
		assert.ok(content.includes("subdir/"), "index.txt should contain subdir/")

		await db.disconnect()
	})

	it("should load index.txt and populate meta", async () => {
		// Setup: Create an index.txt file manually
		const indexContent = [
			"file1.txt 2s 99",
			"file2.json 3s 999",
			"subdir/ 1s 9999"
		].join("\n")
		await db.saveDocument("index.txt", indexContent)

		// Execute: Load the index
		const index = await db.loadIndex(".")

		// Verify: Index should have correct entries
		assert.ok(index.entries.length > 0, "Index should have entries")
		const file1Entry = index.entries.find(([name]) => name === "file1.txt")
		const file2Entry = index.entries.find(([name]) => name === "file2.json")
		const subdirEntry = index.entries.find(([name]) => name === "subdir/")

		assert.ok(file1Entry, "file1.txt should be in index")
		assert.ok(file2Entry, "file2.json should be in index")
		assert.ok(subdirEntry, "subdir/ should be in index")

		// Verify: Stats should be correctly parsed
		assert.strictEqual(file1Entry[1].size, 333)
		assert.strictEqual(file1Entry[1].mtimeMs, 100)
		assert.ok(file1Entry[1].isFile)

		assert.strictEqual(file2Entry[1].size, 11997)
		assert.strictEqual(file2Entry[1].mtimeMs, 136)
		assert.ok(file2Entry[1].isFile)

		assert.ok(subdirEntry[1].isDirectory)
	})

	it.skip("should save index.jsonl with full directory structure", async () => {
		// Setup: Add nested files and directories
		db.meta.set("root-file.txt", new DocumentStat({ size: 10, mtimeMs: 100, isFile: true }))
		db.meta.set("level1/", new DocumentStat({ size: 0, mtimeMs: 200, isDirectory: true }))
		db.meta.set("level1/level2/", new DocumentStat({ size: 0, mtimeMs: 300, isDirectory: true }))
		db.meta.set("level1/level2/nested-file.yaml", new DocumentStat({ size: 50, mtimeMs: 400, isFile: true }))

		// Execute: Save full index
		await db.saveIndex(".", Array.from(db.meta.entries()))

		// Verify: Check that index.jsonl was created
		const jsonlIndexPath = resolve(testDir, "index.jsonl")
		assert.ok(existsSync(jsonlIndexPath), "index.jsonl should exist")

		// Verify: Check content of index.jsonl
		const content = readFileSync(jsonlIndexPath, "utf-8")
		const lines = content.trim().split("\n")
		assert.strictEqual(lines.length, 4, "index.jsonl should have 4 entries")

		const entries = lines.map(line => JSON.parse(line))
		const rootFileEntry = entries.find(entry => entry.name === "root-file.txt")
		const level1Entry = entries.find(entry => entry.name === "level1/")
		const level2Entry = entries.find(entry => entry.name === "level1/level2/")
		const nestedFileEntry = entries.find(entry => entry.name === "level1/level2/nested-file.yaml")

		assert.ok(rootFileEntry, "root-file.txt should be in index.jsonl")
		assert.ok(level1Entry, "level1/ should be in index.jsonl")
		assert.ok(level2Entry, "level1/level2/ should be in index.jsonl")
		assert.ok(nestedFileEntry, "level1/level2/nested-file.yaml should be in index.jsonl")

		assert.strictEqual(rootFileEntry.type, "F")
		assert.strictEqual(level1Entry.type, "D")
		assert.strictEqual(level2Entry.type, "D")
		assert.strictEqual(nestedFileEntry.type, "F")
	})

	it.skip("should automatically update indexes when saving documents", async () => {
		// Save multiple documents
		await db.saveDocument("doc1.md", "# Document 1")
		await db.saveDocument("doc2.xml", "<doc>Document 2</doc>")
		await db.saveDocument("folder/doc3.json", { title: "Document 3" })

		// Verify index.txt was updated in each directory
		const rootIndexPath = resolve(testDir, "index.txt")
		const folderIndexPath = resolve(testDir, "folder/index.txt")

		assert.ok(existsSync(rootIndexPath), "Root index.txt should exist")
		assert.ok(existsSync(folderIndexPath), "Folder index.txt should exist")

		// Check root index content
		const rootContent = readFileSync(rootIndexPath, "utf-8")
		assert.ok(rootContent.includes("doc1.md"))
		assert.ok(rootContent.includes("doc2.xml"))
		assert.ok(rootContent.includes("folder/"))

		// Check folder index content
		const folderContent = readFileSync(folderIndexPath, "utf-8")
		assert.ok(folderContent.includes("doc3.json"))

		// Verify index.jsonl was also created/updated
		const jsonlIndexPath = resolve(testDir, "index.jsonl")
		assert.ok(existsSync(jsonlIndexPath), "index.jsonl should exist")

		const jsonlContent = readFileSync(jsonlIndexPath, "utf-8")
		const lines = jsonlContent.trim().split("\n")
		assert.ok(lines.length >= 3, "index.jsonl should contain at least 3 entries")
	})
})
