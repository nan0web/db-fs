#!/usr/bin/env node

import process from "node:process"
import Logger from "@nan0web/log"
import { select } from "@nan0web/ui-cli"
import DBFS from "../src/index.js"

/**
 * Logger instance with info level.
 */
const console = new Logger({ level: "info" })
const format = new Intl.NumberFormat("en-US").format

console.clear()
console.info(Logger.style(Logger.LOGO, { color: Logger.MAGENTA }))

// Sequence of demo choices for non‑interactive runs, e.g., "2,4".
// Values are 1‑based indices matching the menu order.
const demoSequence = process.env.PLAY_DEMO_SEQUENCE?.split(',').map(s => Number(s.trim())) ?? []
let demoCursor = 0

/**
 * Prompt the user to select a demo.
 * If a predefined sequence exists (via PLAY_DEMO_SEQUENCE), it is used automatically.
 *
 * @returns {Promise<string>} The selected demo value.
 */
async function chooseDemo() {
	const demos = [
		{ name: "Basic Operations", value: "basic" },
		{ name: "Directory Scanning", value: "scan" },
		{ name: "File Formats", value: "formats" },
		{ name: "← Exit", value: "exit" }
	]

	// Use predefined answer when available
	if (demoCursor < demoSequence.length) {
		const idx = demoSequence[demoCursor++] - 1 // convert to zero‑based
		const menuValues = demos.map(el => el.value)
		if (menuValues[idx]) {
			return menuValues[idx]
		}
		throw new Error(`Incorrect PLAY_DEMO_SEQUENCE ${demoSequence[demoCursor]}, max: ${menuValues.length}`)
	}

	const choice = await select({
		title: "Select DBFS demo to run:",
		prompt: "[me]: ",
		invalidPrompt: Logger.style("[me invalid]", { color: "red" }) + ": ",
		options: demos.map(d => d.name),
		console
	})

	return demos[choice.index].value
}

/**
 * Run the basic operations demo.
 */
async function runBasicDemo() {
	console.clear()
	console.success("Basic DBFS Operations Demo")

	const db = new DBFS({ root: "play/db/basic" })
	await db.connect()

	try {
		// Save
		const userData = { name: "Alice", role: "Developer" }
		await db.saveDocument("users/alice.json", userData)
		console.info("✓ Saved user data")

		// Load
		const loadedUser = await db.loadDocument("users/alice.json")
		console.info("✓ Loaded user data:", JSON.stringify(loadedUser))

		// Append
		await db.writeDocument("logs/demo.txt", "Demo started\n")
		await db.writeDocument("logs/demo.txt", "Operations completed\n")
		console.info("✓ Appended log entries")

		// Load logs
		const logs = await db.loadDocument("logs/demo.txt")
		console.info("✓ Log content:", logs.trim())

		// Drop
		await db.dropDocument("users/alice.json")
		console.info("✓ Dropped user document")
		await db.dropDocument("logs/demo.txt")
		console.info("✓ Dropped logs")

	} catch (err) {
		console.error("Error:", err.message)
	} finally {
		await db.disconnect()
	}
}

/**
 * Run the directory scanning demo.
 */
async function runScanDemo() {
	console.clear()
	console.success("Directory Scanning Demo")

	const db = new DBFS({ root: "." })
	await db.connect()

	console.info("Scanning play/ directory:")

	try {
		for await (const entry of db.findStream("play", { sort: "name", order: "asc" })) {
			console.info(`- ${entry.file.path} (${format(entry.file.stat.size)} bytes)`)
		}
	} catch (err) {
		console.error("Error scanning directory:", err.message)
	}

	await db.disconnect()
}

/**
 * Run the file format handling demo.
 */
async function runFormatsDemo() {
	console.clear()
	console.success("File Format Handling Demo")

	const db = new DBFS({ root: "play/db/formats" })
	await db.connect()

	try {
		// JSON
		const data = { version: "1.0", features: ["save", "load", "scan"] }
		await db.saveDocument("config.json", data)
		console.info("✓ JSON saved")

		// TXT
		const text = "Universal\nPrinciples\nGuide"
		await db.saveDocument("guide.txt", text)
		console.info("✓ TXT saved")

		// CSV (mock)
		console.info("CSV and other formats handled via file-system/index.js")

		// Load examples
		const config = await db.loadDocument("config.json")
		console.info("Loaded JSON:", JSON.stringify(config))

		const guide = await db.loadDocument("guide.txt")
		console.info("Loaded TXT:", guide.split("\n").join(" | "))

		await db.dropDocument("config.json")
		await db.dropDocument("guide.txt")

	} catch (err) {
		console.error("Error:", err.message)
	} finally {
		await db.disconnect()
	}
}

/**
 * Display a visual separation after demo completion.
 */
async function showMenu() {
	console.info("\n" + "=".repeat(50))
	console.info("Demo completed. Returning to menu...")
	console.info("=".repeat(50) + "\n")
}

/**
 * Main loop handling demo selection.
 */
async function main() {
	while (true) {
		try {
			const demo = await chooseDemo()

			switch (demo) {
				case "basic":
					await runBasicDemo()
					break
				case "scan":
					await runScanDemo()
					break
				case "formats":
					await runFormatsDemo()
					break
				case "exit":
					process.exit(0)
			}

			await showMenu()
		} catch (error) {
			if (error.message && error.message.includes("cancel")) {
				console.warn("\nDemo selection cancelled. Returning to menu...")
				await showMenu()
			} else {
				console.error("Unexpected error:", error)
				process.exit(1)
			}
		}
	}
}

main().catch(err => {
	console.error(err)
	process.exit(1)
})
