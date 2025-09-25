import { suite, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import { existsSync, writeFileSync, unlinkSync, mkdirSync, exists, rmdirSync } from "node:fs"
import path, { dirname } from "node:path"
import { loadYAML, saveYAML } from "./yaml.js"
import TestDir from "../test.js"

const testDir = new TestDir("yaml-test-js")

const ensureDir = (dir) => {
	mkdirSync(dir, { recursive: true })
}

/**
 * @desc Tests YAML parsing and file I/O functionality.
 */
suite("YAML Tests", () => {
	const tmpDir = testDir.root
	const tmpYAML = path.join(tmpDir, "test.yaml")
	const brokenYAML = path.join(tmpDir, "broken.yaml")

	beforeEach(() => {
		ensureDir(tmpDir)
	})

	afterEach(() => {
		if (existsSync(tmpYAML)) unlinkSync(tmpYAML)
		if (existsSync(brokenYAML)) unlinkSync(brokenYAML)
		if (existsSync(tmpDir)) rmdirSync(tmpDir)
	})

	it("should parse valid YAML correctly using loadYAML", () => {
		const yamlStr = "name: John\nage: 30\n"
		ensureDir(dirname(tmpYAML))
		writeFileSync(tmpYAML, yamlStr)
		const result = loadYAML(tmpYAML)
		const expected = { name: "John", age: 30 }
		assert.deepStrictEqual(result, expected)
	})

	it("should stringify object correctly using saveYAML", () => {
		const obj = { name: "John", age: 30 }
		ensureDir(dirname(tmpYAML))
		const result = saveYAML(tmpYAML, obj)
		const expected = "name: John\nage: 30\n"
		assert.strictEqual(result, expected)
		assert.ok(existsSync(tmpYAML))
		unlinkSync(tmpYAML)
	})

	it("should throw error for broken YAML in loadYAML when softError is false", () => {
		ensureDir(dirname(brokenYAML))
		writeFileSync(brokenYAML, "name: John\n  age: 30")
		assert.throws(() => {
			loadYAML(brokenYAML, false)
		}, /YAMLParseError/)
	})

	it("should return null for broken YAML in loadYAML when softError is true", () => {
		ensureDir(dirname(brokenYAML))
		writeFileSync(brokenYAML, "name: John\n  age: 30")
		const result = loadYAML(brokenYAML, true)
		assert.strictEqual(result, null)
	})
})
