import { suite, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, rmdirSync } from "node:fs"
import path from "node:path"
import { parseCSV, loadCSV, saveCSV } from "./csv.js"
import TestDir from "../test.js"

const testDir = new TestDir("csv-test-js")

/**
 * @desc Tests CSV parsing and file I/O functionality.
 */
suite("CSV Tests", () => {
	const tmpDir = testDir.root
	const tmpCSV = path.join(tmpDir, "test.csv")
	const emptyCSV = path.join(tmpDir, "empty.csv")

	beforeEach(() => {
		mkdirSync(tmpDir, { recursive: true })
	})

	afterEach(() => {
		if (existsSync(tmpCSV)) unlinkSync(tmpCSV)
		if (existsSync(emptyCSV)) unlinkSync(emptyCSV)
		if (existsSync(tmpDir)) rmdirSync(tmpDir)
	})

	it("should parse simple CSV correctly", () => {
		const csvContent = `"Name","Age","Email"\n"John",30,"john@example.com"\n"Jane",25,"jane@example.com"`
		const result = parseCSV(csvContent)
		const expected = [
			["Name", "Age", "Email"],
			["John", 30, "john@example.com"],
			["Jane", 25, "jane@example.com"]
		]
		assert.deepStrictEqual(result, expected)
	})

	it("should handle escaped quotes in CSV", () => {
		const csvContent = `"Text"\n"Hello ""World"""`
		const result = parseCSV(csvContent)
		const expected = [
			["Text"],
			['Hello "World"']
		]
		assert.deepStrictEqual(result, expected)
	})

	it("should throw error for non-existent file in loadCSV", () => {
		assert.throws(() => {
			loadCSV("non/existent/path.csv")
		}, /File not found/)
	})

	it("should load CSV file correctly", () => {
		const csvContent = `"Name","Age","Email"\n"John",30,"john@example.com"\n"Jane",25,"jane@example.com"`
		writeFileSync(tmpCSV, csvContent)

		const result = loadCSV(tmpCSV)
		const expected = [
			{ Name: "John", Age: 30, Email: "john@example.com" },
			{ Name: "Jane", Age: 25, Email: "jane@example.com" }
		]
		assert.deepStrictEqual(result, expected)
	})

	it("should save CSV data correctly", () => {
		const data = [
			{ Name: "John", Age: 30, Email: "john@example.com" },
			{ Name: "Jane", Age: 25, Email: "jane@example.com" },
			{ Name: "Bob", Age: 40, Email: "bob@example.com" }
		]
		const delimiter = ","
		const quote = '"'
		const eol = "\n"

		const result = saveCSV(tmpCSV, data, delimiter, quote, eol)

		const expectedFileContent = [
			'Name,Age,Email',
			'John,30,john@example.com',
			'Jane,25,jane@example.com',
			'Bob,40,bob@example.com'
		].join(eol)

		assert.strictEqual(result, expectedFileContent)
		assert.ok(existsSync(tmpCSV))

		const savedContent = readFileSync(tmpCSV, 'utf8')
		assert.strictEqual(savedContent, expectedFileContent)
	})

	it("should handle empty CSV content", () => {
		const csvContent = ""
		const result = parseCSV(csvContent)
		assert.deepStrictEqual(result, [])
	})

	it("should handle CRLF line endings", () => {
		const csvContent = `"Name","Age"\r\n"John",30\r\n"Jane",25`
		const result = parseCSV(csvContent)
		const expected = [
			["Name", "Age"],
			["John", 30],
			["Jane", 25]
		]
		assert.deepStrictEqual(result, expected)
	})

	it("should parse simple TSV correctly", () => {
		const tsvContent = "Name\tAge\tEmail\nJohn\t30\tjohn@example.com\nJane\t25\tjane@example.com"
		const result = parseCSV(tsvContent, "\t")
		const expected = [
			["Name", "Age", "Email"],
			["John", 30, "john@example.com"],
			["Jane", 25, "jane@example.com"]
		]
		assert.deepStrictEqual(result, expected)
	})

	it("should parse as a string if starts with a number", () => {
		const content = [
			"tel,mail",
			"96545454,54@example.com",
		].join("\n")
		const result = parseCSV(content)
		assert.deepStrictEqual(result, [
			["tel", "mail"],
			[96545454, "54@example.com"]
		])
	})
})
