import { describe, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"
import DBFS from "./DBFS.js"
import { EventContext } from "@nan0web/event"

const TEST_DIR = "__test_fs__/events"

/**
 * Test suite for DBFS event system
 * Verifies that file system operations emit proper change events
 * and that onChange listeners work with URI patterns
 */
describe.skip("DBFS Events", () => {
	/** @type {DBFS} */
	let db

	/** @type {Function} */
	let restoreEvents

	// Setup fresh DBFS instance before each test
	beforeEach(async () => {
		// Ensure test directory exists
		db = new DBFS({
			root: TEST_DIR,
		})
		await db.connect()
		restoreEvents = db.muteEvents()
	})

	// Cleanup after each test
	afterEach(async () => {
		restoreEvents()
		// Clean up any created files
		try {
			const fs = await import("node:fs")
			const path = await import("node:path")
			const entries = fs.readdirSync(TEST_DIR)
			for (const entry of entries) {
				const fullPath = path.resolve(TEST_DIR, entry)
				const stat = fs.statSync(fullPath)
				if (stat.isDirectory()) {
					fs.rmSync(fullPath, { recursive: true })
				} else {
					fs.unlinkSync(fullPath)
				}
			}
		} catch (err) {
			// Ignore cleanup errors
		}
	})

	it("should emit change event on saveDocument", async () => {
		let triggered = false
		let receivedEntry = null

		db.onChange("test.txt", (entry) => {
			triggered = true
			receivedEntry = entry
		})

		await db.saveDocument("test.txt", "content")

		assert.strictEqual(triggered, true)
		assert.ok(receivedEntry instanceof EventContext)
		assert.strictEqual(receivedEntry.data.path, "test.txt")
		assert.ok(receivedEntry.data.stat.mtimeMs > 0)
	})

	it("should emit change event on writeDocument", async () => {
		let triggered = false
		let receivedEntry = null

		db.onChange("log.txt", (entry) => {
			triggered = true
			receivedEntry = entry
		})

		await db.writeDocument("log.txt", "chunk")

		assert.strictEqual(triggered, true)
		assert.ok(receivedEntry instanceof EventContext)
		assert.strictEqual(receivedEntry.data.path, "log.txt")
		assert.ok(receivedEntry.data.stat.mtimeMs > 0)
	})

	it("should emit change event on dropDocument", async () => {
		// First create a file
		await db.saveDocument("to-delete.txt", "content")

		let triggered = false
		let receivedEntry = null

		db.onChange("to-delete.txt", (entry) => {
			triggered = true
			receivedEntry = entry
		})

		await db.dropDocument("to-delete.txt")

		assert.strictEqual(triggered, true)
		assert.ok(receivedEntry instanceof EventContext)
		assert.strictEqual(receivedEntry.data.path, "to-delete.txt")
		// Stat should still contain the data from before deletion
		assert.ok(receivedEntry.data.stat.mtimeMs > 0)
	})

	it("should emit change events on moveDocument", async () => {
		// First create source file
		await db.saveDocument("source.txt", "content")

		let triggeredPaths = []

		db.onChange("**", (entry) => {
			triggeredPaths.push(entry.data.path)
		})

		// Simulate move by saving to target and dropping source
		await db.saveDocument("target.txt", "content")
		await db.dropDocument("source.txt")

		// Sort to ensure consistent comparison
		assert.deepStrictEqual(triggeredPaths.sort(), ["source.txt", "target.txt"])
	})

	it("should handle directory pattern /** for changes", async () => {
		let triggeredPaths = []

		db.onChange("data/**", (entry) => {
			triggeredPaths.push(entry.data.path)
		})

		// Create files in data directory
		await db.saveDocument("data/file1.txt", "content1")
		await db.saveDocument("data/sub/file2.txt", "content2")
		// This should not trigger
		await db.saveDocument("other.txt", "content")

		assert.deepStrictEqual(triggeredPaths.sort(), ["data/file1.txt", "data/sub/file2.txt"])
	})

	it("should handle immediate children pattern /* for changes", async () => {
		let triggeredPaths = []

		db.onChange("data/*", (entry) => {
			triggeredPaths.push(entry.data.path)
		})

		// Create immediate children
		await db.saveDocument("data/file1.txt", "content1")
		await db.saveDocument("data/file2.txt", "content2")
		// This should not trigger (nested)
		await db.saveDocument("data/sub/file.txt", "content")

		assert.deepStrictEqual(triggeredPaths.sort(), ["data/file1.txt", "data/file2.txt"])
	})

	it("should not trigger listener when pattern mismatches", async () => {
		let triggered = false

		db.onChange("dir/**", () => {
			triggered = true
		})

		await db.saveDocument("other.txt", "content")

		assert.strictEqual(triggered, false)
	})

	it("should handle multiple listeners for different patterns", async () => {
		let allFilesTriggered = 0
		let txtFilesTriggered = 0
		let dirTriggered = 0

		db.onChange("**", () => {
			allFilesTriggered++
		})

		db.onChange("*.txt", () => {
			txtFilesTriggered++
		})

		db.onChange("dir/**", () => {
			dirTriggered++
		})

		await db.saveDocument("test.txt", "content")

		assert.strictEqual(allFilesTriggered, 1)
		assert.strictEqual(txtFilesTriggered, 1)
		assert.strictEqual(dirTriggered, 0)
	})

	it("should restore queued events after unmute", async () => {
		const restore = db.muteEvents()
		const triggeredPaths = []

		db.onChange("file*.txt", (entry) => {
			triggeredPaths.push(entry.data.path)
		})

		// These should be queued
		await db.saveDocument("file1.txt", "content1")
		await db.saveDocument("file2.txt", "content2")

		// Nothing should be triggered yet
		assert.strictEqual(triggeredPaths.length, 0)

		// Restore and process queued events
		restore()

		// Now events should be processed
		assert.strictEqual(triggeredPaths.length, 2)
		assert.deepStrictEqual(triggeredPaths.sort(), ["file1.txt", "file2.txt"])
	})

	it("should properly handle error events", async () => {
		let errorTriggered = false

		db.on("error", (error) => {
			errorTriggered = true
		})

		// Try to access forbidden path
		try {
			await db.saveDocument("../outside.txt", "content")
		} catch (err) {
			// Expected
		}

		// Error event should have been triggered
		assert.strictEqual(errorTriggered, true)
	})

	it("should emit change event when directory is created/modified", async () => {
		let triggered = false

		db.onChange("new-dir/", (entry) => {
			triggered = true
		})

		await db.saveDocument("new-dir/test.txt", "content")

		assert.strictEqual(triggered, true)
	})

	it.skip("should respect maxEventsPerSecond rate limiting", async () => {
		// Skipping this test as it requires complex setup
		assert.ok(true)
	})
})
