import { suite, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import { existsSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs"
import path from "node:path"
import { loadTXT, saveTXT } from "./txt.js"

const cwd = path.join(process.cwd(), "__test_fs__")

/**
 * @desc Tests TXT file parsing and file I/O functionality.
 */
suite("TXT Tests", () => {
	const tmpDir = path.join(cwd, ".tmp_txt_test")
	const tmpTXT = path.join(tmpDir, "test.txt")

	beforeEach(() => {
		mkdirSync(tmpDir, { recursive: true })
	})

	afterEach(() => {
		if (existsSync(tmpTXT)) unlinkSync(tmpTXT)
	})

	it("should save array data as TXT with default delimiter", () => {
		const data = ["line1", "line2", "line3"]
		saveTXT(tmpTXT, data)
		const savedContent = loadTXT(tmpTXT)
		assert.deepStrictEqual(savedContent, data)
		assert.ok(existsSync(tmpTXT))
	})

	it("should save array data as TXT with custom delimiter", () => {
		const data = ["part1", "part2", "part3"]
		saveTXT(tmpTXT, data, " | ")
		const savedContent = loadTXT(tmpTXT, " | ")
		assert.deepStrictEqual(savedContent, data)
	})

	it("should load TXT file without splitting when delimiter is false", () => {
		const originalContent = "line1\nline2\nline3"
		writeFileSync(tmpTXT, originalContent)
		const result = loadTXT(tmpTXT, false)
		assert.strictEqual(result, originalContent)
	})

	it("should return empty array for missing TXT file when delimiter used", () => {
		const result = loadTXT("./non-existent.txt", "\n", true)
		assert.deepStrictEqual(result, [])
	})

	it("should return empty string for missing TXT file when no delimiter used", () => {
		const result = loadTXT("./non-existent.txt", false, true)
		assert.strictEqual(result, "")
	})

	it("should handle array input in saveTXT correctly", () => {
		const data = ["Hello", "World", "Test"]
		const delimiter = "---"
		saveTXT(tmpTXT, data, delimiter)
		const content = loadTXT(tmpTXT, delimiter)
		assert.deepStrictEqual(content, data)
	})

	it("should handle string input in saveTXT correctly", () => {
		const data = "Plain text content"
		saveTXT(tmpTXT, data)
		const content = loadTXT(tmpTXT, false)
		assert.strictEqual(content, data)
	})
})
