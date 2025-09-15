import { suite, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import { existsSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs"
import path from "node:path"
import { loadYAML, saveYAML } from "./yaml.js"

const cwd = path.join(process.cwd(), "__test_fs__")

/**
 * @desc Tests YAML parsing and file I/O functionality.
 */
suite("YAML Tests", () => {
	const tmpDir = path.join(cwd, ".tmp_yaml_test")
	const tmpYAML = path.join(tmpDir, "test.yaml")
	const brokenYAML = path.join(tmpDir, "broken.yaml")

	beforeEach(() => {
		mkdirSync(tmpDir, { recursive: true })
	})

	afterEach(() => {
		if (existsSync(tmpYAML)) unlinkSync(tmpYAML)
		if (existsSync(brokenYAML)) unlinkSync(brokenYAML)
	})

	it("should parse valid YAML correctly using loadYAML", () => {
		const yamlStr = "name: John\nage: 30\n"
		writeFileSync(tmpYAML, yamlStr)
		const result = loadYAML(tmpYAML)
		const expected = { name: "John", age: 30 }
		assert.deepStrictEqual(result, expected)
	})

	it("should stringify object correctly using saveYAML", () => {
		const obj = { name: "John", age: 30 }
		const result = saveYAML(tmpYAML, obj)
		const expected = "name: John\nage: 30\n"
		assert.strictEqual(result, expected)
		assert.ok(existsSync(tmpYAML))
	})

	it("should throw error for broken YAML in loadYAML when softError is false", () => {
		writeFileSync(brokenYAML, "name: John\n  age: 30")
		assert.throws(() => {
			loadYAML(brokenYAML, false)
		}, /YAMLParseError/)
	})

	it("should return null for broken YAML in loadYAML when softError is true", () => {
		writeFileSync(brokenYAML, "name: John\n  age: 30")
		const result = loadYAML(brokenYAML, true)
		assert.strictEqual(result, null)
	})
})