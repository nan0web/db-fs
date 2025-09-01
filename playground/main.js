#!/usr/bin/env node

import process from "node:process"
import Logger from "@nan0web/log"
import { select } from "@nan0web/ui-cli"
import DBFS from "../src/index.js"

const console = new Logger({ level: "info" })

console.clear()
console.info(Logger.style(Logger.LOGO, { color: "cyan" }))

async function chooseDemo() {
	const demos = [
		{ name: "Basic Operations", value: "basic" },
		{ name: "Directory Scanning", value: "scan" },
		{ name: "File Formats", value: "formats" },
		{ name: "← Exit", value: "exit" }
	]

	const choice = await select({
		title: "Select DBFS demo to run:",
		prompt: "[me]: ",
		invalidPrompt: Logger.style("[me invalid]", { color: "red" }) + ": ",
		options: demos.map(d => d.name),
		console
	})

	return demos[choice.index].value
}

async function runBasicDemo() {
	console.clear()
	console.success("Basic DBFS Operations Demo")

	const db = new DBFS({ root: "__playground_db__" })
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

	} catch (err) {
		console.error("Error:", err.message)
	} finally {
		await db.disconnect()
	}
}

async function runScanDemo() {
	console.clear()
	console.success("Directory Scanning Demo")

	const db = new DBFS({ root: "." })
	await db.connect()

	console.info("Scanning current directory (limit 5):")
	let count = 0

	try {
		for await (const entry of db.findStream(".", { limit: 5, sort: "name", order: "asc" })) {
			if (count < 5) {
				console.info(`${entry.file.name} (${entry.file.stat.isDirectory ? "dir" : "file"})`)
				count++
			}
		}
	} catch (err) {
		console.error("Error scanning directory:", err.message)
	}

	await db.disconnect()
}

async function runFormatsDemo() {
	console.clear()
	console.success("File Format Handling Demo")

	const db = new DBFS({ root: "__playground_formats__" })
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

	} catch (err) {
		console.error("Error:", err.message)
	} finally {
		await db.disconnect()
	}
}

async function showMenu() {
	console.info("\n" + "=".repeat(50))
	console.info("Demo completed. Returning to menu...")
	console.info("=".repeat(50) + "\n")
}

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