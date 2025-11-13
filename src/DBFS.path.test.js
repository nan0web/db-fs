import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { sep, resolve as pathResolve, relative as pathRelative } from "node:path"
import TestDir from "./test.js"
import DBFS from "./DBFS.js"

const testDir = new TestDir("dbfs-path-test-js")

/**
 * @desc Tests the path-related functionality of DBFS.
 */
describe("DBFS path tests", () => {
	/** @type {DBFS} */
	let db

	beforeEach(() => {
		db = new DBFS({ root: testDir.root, cwd: "." })
	})

	it("should resolve async paths correctly", async () => {
		const resolved = await db.resolve("file1.txt")
		assert.strictEqual(resolved, "file1.txt")

		const resolvedNested = await db.resolve("dir/file2.txt")
		assert.strictEqual(resolvedNested, "dir/file2.txt")

		const resolvedAbsolute = await db.resolve("/absolute/file.txt")
		assert.strictEqual(resolvedAbsolute, "/absolute/file.txt")
	})

	it("should resolve sync paths correctly", () => {
		const resolved = db.resolveSync("file1.txt")
		assert.strictEqual(resolved, "file1.txt")

		const resolvedNested = db.resolveSync("dir/file2.txt")
		assert.strictEqual(resolvedNested, "dir/file2.txt")

		const resolvedAbsolute = db.resolveSync("/absolute/file.txt")
		assert.strictEqual(resolvedAbsolute, "/absolute/file.txt")
	})

	it("should generate correct location paths", () => {
		const location = db.location("file1.txt")
		assert.strictEqual(location, pathResolve(db.cwd, db.root, "file1.txt"))

		const nestedLocation = db.location("dir/file2.txt")
		assert.strictEqual(nestedLocation, pathResolve(db.cwd, db.root, "dir/file2.txt"))

		const absoluteLocation = db.location("/absolute/file.txt")
		assert.strictEqual(absoluteLocation, pathResolve(db.cwd, db.root, "absolute/file.txt"))
	})

	it("should compute absolute URIs correctly for relative input", () => {
		const abs = db.absolute("index.js")
		const expected = pathResolve(db.root, "index.js")
		assert.strictEqual(abs, expected)
	})

	it("should compute absolute URIs correctly for nested relative input", () => {
		const abs = db.absolute("dir/index.js")
		const expected = pathResolve(db.root, "dir/index.js")
		assert.strictEqual(abs, expected)
	})

	it("should return unchanged absolute URI when input is already absolute", () => {
		const absAlreadyAbsolute = db.absolute("/already/absolute")
		assert.strictEqual(absAlreadyAbsolute, "/already/absolute")
	})

	it("should compute relative URIs correctly for files in root", () => {
		const fullPath = pathResolve(db.root, "index.js")
		const rel = db.relative(fullPath)
		assert.strictEqual(rel, "index.js")
	})

	it("should compute relative URIs correctly for nested files", () => {
		const fullPath = pathResolve(db.root, "dir/index.js")
		const rel = db.relative(fullPath)
		assert.strictEqual(rel, "dir/index.js")
	})

	it("should compute relative URIs correctly for files outside root", () => {
		const fullPath = pathResolve(db.root, "../outside/file.js")
		const rel = db.relative(fullPath)
		const expected = pathRelative(db.root, fullPath)
		assert.strictEqual(rel, expected)
	})
})
