import { suite, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import FS from "./FS.js"
import DBFS from "./DBFS.js"
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmdirSync } from "node:fs"
import path from "node:path"

/**
 * @desc Tests for FS utility class methods
 */
suite("FS utility tests", () => {
	/** @type {DBFS} */
	let db
	const mockRoot = "__test_fs__/fs-class"

	const testDir = path.join(process.cwd(), mockRoot)
	const testFile = path.join(testDir, "test.txt")
	const testData = "test content"

	beforeEach(() => {
		if (existsSync(testDir)) {
			rmdirSync(testDir, { recursive: true })
		}
		mkdirSync(testDir, { recursive: true })
		db = new DBFS({ root: "__test_fs__", cwd: process.cwd() })
	})

	afterEach(() => {
		if (existsSync(testFile)) unlinkSync(testFile)
		if (existsSync(testDir)) rmdirSync(testDir, { recursive: true })
		try {
			if (typeof db.disconnect === "function") db.disconnect()
		} catch (err) {
			console.error("Error in disconnect:", err.message)
		}
	})

	it("should return correct path separator", () => {
		assert.strictEqual(FS.sep, path.sep)
	})

	it("should resolve paths correctly", () => {
		const resolved = FS.resolve(testDir, "sub", "file.txt")
		const expected = path.resolve(testDir, "sub", "file.txt")
		assert.strictEqual(resolved, expected)
	})

	it("should calculate relative paths correctly", () => {
		const from = testDir
		const to = path.join(testDir, "sub", "file.txt")
		const relativePath = FS.relative(from, to)
		const expected = path.relative(from, to)
		assert.strictEqual(relativePath, expected)
	})

	it("should check if file exists", () => {
		writeFileSync(testFile, testData)
		assert.ok(FS.existsSync(testFile))
		assert.ok(!FS.existsSync(testFile + "_missing"))
	})

	it("should get file stats", () => {
		writeFileSync(testFile, testData)
		const stat = FS.statSync(testFile)
		assert.ok(stat.isFile())
		assert.ok(stat.size > 0)
	})

	it("should read directory contents", () => {
		writeFileSync(testFile, testData)
		const entries = FS.readdirSync(testDir, { withFileTypes: true })
		assert.ok(entries.length > 0)
		assert.ok(entries.some(entry => entry.name === "test.txt"))
	})

	it("should load and save text files", () => {
		FS.save(testFile, testData)
		const loaded = FS.loadTXT(testFile, false)
		assert.strictEqual(loaded, testData)
	})

	it("should load and save JSON files", () => {
		const jsonFile = path.join(testDir, "test.json")
		const jsonData = { test: true, value: 42 }

		FS.save(jsonFile, jsonData)
		const loaded = FS.load(jsonFile)
		assert.deepStrictEqual(loaded, jsonData)

		if (existsSync(jsonFile)) unlinkSync(jsonFile)
	})

	it("should append data to file", () => {
		FS.writeFileSync(testFile, "initial\n")
		FS.appendFileSync(testFile, "appended")
		const content = FS.readFileSync(testFile, "utf8")
		assert.strictEqual(content, "initial\nappended")
	})

	it("should get file extension", () => {
		const ext = FS.extname("file.txt")
		assert.strictEqual(ext, ".txt")

		const jsExt = FS.extname("script.js")
		assert.strictEqual(jsExt, ".js")
	})

	it("should resolve relative file within root boundary", () => {
		db.cwd = mockRoot
		db.root = path.join("private")

		const resolved = db.resolveSync("test.txt")
		assert.strictEqual(resolved, "test.txt", "Should resolve file within root without duplication")
	})

	it("should create and read files with correct formatting", async () => {
		const data = { name: "Alice", age: 30 }
		const expectedOutput = JSON.stringify(data, null, 2)

		await db.saveDocument("users/user1.json", data)
		await db.writeDocument("logs/greet.txt", "Hello World\n")
		await db.writeDocument("logs/greet.txt", "Goodbye")

		const user = await db.loadDocument("users/user1.json")
		const greet = await db.loadDocument("logs/greet.txt")
		await db.dropDocument("users/user1.json")
		await db.dropDocument("logs/greet.txt")

		assert.strictEqual(JSON.stringify(user, null, 2), expectedOutput)
		assert.strictEqual(greet, "Hello World\nGoodbye")
	})

	it("should build directory structure automatically", async () => {
		await db.saveDocument("modules/utils/handlers/validator.js", "const a = 'dummy content'")

		const files = Array.from(db.meta.keys()).sort()
		assert.deepStrictEqual(
			files,
			[
				DBFS.winFix(path.join(testDir, "modules", "utils", "handlers", "validator.js"))
			].map(file => DBFS.winFix(file.replace(testDir + FS.sep, "")))
		)
	})

	const expected = [
		[["private/test.txt"], "private/test.txt"],
		[["private", "test.txt"], "private/test.txt"],
		[["a", "b", "c.txt"], "a/b/c.txt"],
		[["../../", "var", "www"], "var/www"],
		[["."], "."],
		[["/", "404.json"], "404.json"]
	]

	for (const [args, exp] of expected) {
		it(`should resolve [${args}] => ${exp}`, async () => {
			const db = new DBFS()
			const resolved = await db.resolve(...args)
			assert.equal(resolved, exp)
		})
	}

	it("should properly handle root as subdirectory", async () => {
		db.cwd = mockRoot
		db.root = "testfs/"
		const abs = db.absolute("data/file.json")
		assert.ok(abs.endsWith("/testfs/data/file.json"))
	})

	it("should properly remove the directory", async () => {
		const db = new DBFS({
			root: mockRoot + "/rmdir",
			predefined: [
				["1.txt", "Text file"],
				["2.json", { value: 1 }]
			]
		})
		await db.connect()
		await db.dump()
		const stat1 = FS.statSync(db.location("1.txt"))
		const stat2 = FS.statSync(db.location("2.json"))
		assert.ok(stat1.mtimeMs)
		assert.ok(stat2.mtimeMs)
		const dir = db.location(".")
		await db.dropDocument("1.txt")
		await db.dropDocument("2.json")
		FS.rmdirSync(dir, { recursive: true })
		assert.ok(!FS.existsSync(dir))
	})
})
