import { suite, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import { existsSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs"
import path from "node:path"
import { loadJSON, saveJSON, toJSON, fromJSON } from "./json.js"

const cwd = path.join(process.cwd(), "__test_fs__")

/**
 * @desc Tests JSON parsing and file I/O functionality.
 */
suite("JSON Tests", () => {
	const tmpDir = path.join(cwd, ".tmp_json_test")
	const tmpJSON = path.join(tmpDir, "test.json")
	const brokenJSON = path.join(tmpDir, "broken.json")

	beforeEach(() => {
		mkdirSync(tmpDir, { recursive: true })
	})

	afterEach(() => {
		if (existsSync(tmpJSON)) unlinkSync(tmpJSON)
		if (existsSync(brokenJSON)) unlinkSync(brokenJSON)
	})

	it("should parse valid JSON correctly using fromJSON", () => {
		const jsonStr = '{"name":"John","age":30}'
		const result = fromJSON(jsonStr)
		const expected = { name: "John", age: 30 }
		assert.deepStrictEqual(result, expected)
	})

	it("should stringify object correctly using toJSON", () => {
		const obj = { name: "John", age: 30 }
		const result = toJSON(obj, null, 2)
		const expected = JSON.stringify(obj, null, 2)
		assert.strictEqual(result, expected)
	})

	it("should save JSON data to file with space indentation", () => {
		const data = { users: [{ name: "John", age: 30 }] }
		const result = saveJSON(tmpJSON, data, null, 2)
		const expected = JSON.stringify(data, null, 2)
		assert.strictEqual(result, expected)
		assert.ok(existsSync(tmpJSON))
	})

	it("should throw error for broken JSON in loadJSON when softError is false", () => {
		writeFileSync(brokenJSON, '{"broken": json}')
		assert.throws(() => {
			loadJSON(brokenJSON, false)
		}, SyntaxError)
	})

	it("should return null for broken JSON in loadJSON when softError is true", () => {
		writeFileSync(brokenJSON, '{"broken": json}')
		const result = loadJSON(brokenJSON, true)
		assert.strictEqual(result, null)
	})

	it("should handle stringified input in saveJSON", () => {
		const data = JSON.stringify({ key: "value" })
		saveJSON(tmpJSON, data)
		const savedContent = loadJSON(tmpJSON)
		assert.deepStrictEqual(savedContent, { key: "value" })
	})

	it("should handle Map instances in saveJSON", () => {
		const map = new Map([["key1", "value1"], ["key2", "value2"]])
		const result = saveJSON(tmpJSON, map)
		const expected = JSON.stringify([["key1", "value1"], ["key2", "value2"]])
		assert.strictEqual(result, expected)
	})
})
