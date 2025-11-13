import { suite, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import path from "node:path"
import { existsSync, mkdirSync, rmdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs"
import FSDriver from "./FSDriver.js"

/**
 * @desc Tests for FSDriver functionality including multi-format handling.
 */
suite("FSDriver Tests", () => {
	const testRoot = path.join(process.cwd(), "__fdriver_test__")
	/** @type {FSDriver}  */
	let driver

	beforeEach(async () => {
		mkdirSync(testRoot, { recursive: true })
		driver = new FSDriver({ root: testRoot })
		await driver.connect()
	})

	afterEach(async () => {
		// Cleanup files
		const files = ["test.json", "test.csv", "test.yaml", "test.txt", "test.jsonl"]
		for (const file of files) {
			const filePath = path.join(testRoot, file)
			if (existsSync(filePath)) unlinkSync(filePath)
		}
		rmdirSync(testRoot, { recursive: true })
	})

	it("should connect successfully", async () => {
		assert.ok(driver.connected)
	})

	it("should read JSON file correctly", async () => {
		const filePath = path.join(testRoot, "test.json")
		const data = { name: "John", age: 30 }
		writeFileSync(filePath, JSON.stringify(data))
		const loaded = await driver.read(filePath)
		assert.deepStrictEqual(loaded, data)
	})

	it("should read CSV file correctly", async () => {
		const filePath = path.join(testRoot, "test.csv")
		const csvContent = "Name,Age\nJohn,30\nJane,25"
		writeFileSync(filePath, csvContent)
		const loaded = await driver.read(filePath)
		const expected = [
			{ Name: "John", Age: 30 },
			{ Name: "Jane", Age: 25 }
		]
		assert.deepStrictEqual(loaded, expected)
	})

	it("should read YAML file correctly", async () => {
		const filePath = path.join(testRoot, "test.yaml")
		const yamlContent = "name: John\nage: 30"
		writeFileSync(filePath, yamlContent)
		const loaded = await driver.read(filePath)
		const expected = { name: "John", age: 30 }
		assert.deepStrictEqual(loaded, expected)
	})

	it("should read TXT file correctly", async () => {
		const filePath = path.join(testRoot, "test.txt")
		const txtContent = "Hello, World!"
		writeFileSync(filePath, txtContent)
		const loaded = await driver.read(filePath)
		assert.strictEqual(loaded, txtContent)
	})

	it("should read JSONL file correctly", async () => {
		const filePath = path.join(testRoot, "test.jsonl")
		const jsonlContent = '{"name":"John"}\n{"name":"Jane"}'
		writeFileSync(filePath, jsonlContent)
		const loaded = await driver.read(filePath)
		const expected = [
			{ name: "John" },
			{ name: "Jane" }
		]
		assert.deepStrictEqual(loaded, expected)
	})

	it("should write JSON file correctly", async () => {
		const filePath = path.join(testRoot, "test.json")
		const data = { name: "John", age: 30 }
		await driver.write(filePath, data)
		const loaded = await driver.read(filePath)
		assert.deepStrictEqual(loaded, data)
		const content = readFileSync(filePath, "utf8")
		assert.ok(content.includes('"name": "John"'))
	})

	it("should write CSV file correctly", async () => {
		const filePath = path.join(testRoot, "test.csv")
		const data = [
			{ Name: "John", Age: 30 },
			{ Name: "Jane", Age: 25 }
		]
		await driver.write(filePath, data)
		const loaded = await driver.read(filePath)
		assert.deepStrictEqual(loaded, data)
		const content = readFileSync(filePath, "utf8")
		assert.ok(content.includes("Name,Age"))
		assert.ok(content.includes("John,30"))
	})

	it("should write YAML file correctly", async () => {
		const filePath = path.join(testRoot, "test.yaml")
		const data = { name: "John", age: 30 }
		await driver.write(filePath, data)
		const loaded = await driver.read(filePath)
		assert.deepStrictEqual(loaded, data)
		const content = readFileSync(filePath, "utf8")
		assert.ok(content.includes("name: John"))
		assert.ok(content.includes("age: 30"))
	})

	it("should write TXT file correctly", async () => {
		const filePath = path.join(testRoot, "test.txt")
		const data = "Hello, World!"
		await driver.write(filePath, data)
		const loaded = await driver.read(filePath)
		assert.strictEqual(loaded, data)
		const content = readFileSync(filePath, "utf8")
		assert.strictEqual(content.trim(), data)
	})

	it("should write JSONL file correctly", async () => {
		const filePath = path.join(testRoot, "test.jsonl")
		const data = [
			{ name: "John" },
			{ name: "Jane" }
		]
		await driver.write(filePath, data)
		const loaded = await driver.read(filePath)
		assert.deepStrictEqual(loaded, data)
		const content = readFileSync(filePath, "utf8")
		assert.ok(content.includes('{"name":"John"}\n{"name":"Jane"}\n'))
	})

	it("should append to TXT file correctly", async () => {
		const filePath = path.join(testRoot, "log.txt")
		await driver.append(filePath, "First line\n")
		await driver.append(filePath, "Second line")
		const loaded = await driver.read(filePath)
		assert.deepStrictEqual(loaded, "First line\nSecond line")
	})

	it("should append to JSONL file correctly", async () => {
		const filePath = path.join(testRoot, "events.jsonl")
		await driver.write(filePath, [{ event: "start" }])
		await driver.append(filePath, JSON.stringify({ event: "end" }) + "\n")
		const loaded = await driver.read(filePath)
		assert.deepStrictEqual(loaded, [
			{ event: "start" },
			{ event: "end" }
		])
	})

	it("should delete file correctly", async () => {
		const filePath = path.join(testRoot, "to-delete.txt")
		writeFileSync(filePath, "content")
		const result = await driver.delete(filePath)
		assert.strictEqual(existsSync(filePath), false)
		assert.ok(result)
	})

	it("should return default for non-existent file", async () => {
		const filePath = path.join(testRoot, "missing.json")
		const loaded = await driver.read(filePath, "fallback")
		assert.strictEqual(loaded, "fallback")
	})

	it("should get file stats correctly", async () => {
		const filePath = path.join(testRoot, "stats.json")
		const data = { test: true }
		await driver.write(filePath, data)
		const stats = await driver.stat(filePath)
		assert.ok(stats.isFile)
		assert.ok(stats.size > 0)
		assert.ok(stats.mtimeMs > 0)
	})

	it("should list directory contents", async () => {
		const files = ["file1.txt", "file2.json", "dir"]
		for (const file of files) {
			const filePath = path.join(testRoot, file)
			if (file !== "dir") {
				writeFileSync(filePath, "content")
			} else {
				mkdirSync(filePath)
			}
		}
		const entries = await driver.listDir(testRoot)
		assert.ok(entries.includes("file1.txt"))
		assert.ok(entries.includes("file2.json"))
		assert.ok(entries.includes("dir"))
		assert.strictEqual(entries.length, 3)
	})

	it("should handle access correctly for read", async () => {
		const filePath = path.join(testRoot, "access.txt")
		writeFileSync(filePath, "content")
		await driver.access(filePath, "r")
		assert.ok(true) // No throw
	})

	it("should throw on write access denial", async () => {
		const filePath = path.join(testRoot, "no-write.txt")
		writeFileSync(filePath, "content", { mode: 0o444 }) // Read-only
		await assert.rejects(
			() => driver.access(filePath, "w"),
			/Access denied/
		)
	})
})
