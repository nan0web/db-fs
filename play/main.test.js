import { spawn } from "node:child_process"
import { describe, it } from "node:test"
import assert from "node:assert"
import Logger from "@nan0web/log"

const run = async (env) => {
	const child = spawn("node", ["play/main.js"], { env, stdio: ["ignore", "pipe", "pipe"] })

	let stdout = ""
	for await (const chunk of child.stdout) {
		stdout += chunk.toString()
	}

	let stderr = ""
	for await (const chunk of child.stderr) {
		stderr += chunk.toString()
	}

	const exitCode = await new Promise(resolve => child.on("close", resolve))
	return { stderr, stdout, exitCode }
}

/**
 * @param {string} str
 * @returns {string}
 */
const filterDebugger = (str) => {
	const words = ["debugger", "https://nodejs.org/en/docs/inspector"]
	return str.split("\n").filter(
		s => !words.some(w => s.toLowerCase().includes(w))
	).join("\n")
}

describe("play/main.js interactive demo automation", () => {
	it("should run scan demo then exit using PLAY_DEMO_SEQUENCE", async () => {
		const { stdout, stderr, exitCode } = await run({ ...process.env, PLAY_DEMO_SEQUENCE: "2,4" })

		assert.strictEqual(exitCode, 0, `Process exited with code ${exitCode}. Stderr: ${stderr}`)
		assert.equal(filterDebugger(stderr), "")
		// Verify that the scanning demo output appears
		assert.deepStrictEqual(stdout.split("\n").slice(0, 16), [
			Logger.LOGO,
			'Directory Scanning Demo',
			'Scanning play/ directory:',
			'- play/data/nested/file.txt (15 bytes)',
			'- play/data/config.yaml (106 bytes)',
			'- play/data/contacts.md (105 bytes)',
			'- play/data/index.yaml (23 bytes)',
			'- play/data/logs.txt (87 bytes)',
			'- play/data/users.json (173 bytes)',
			'- play/.gitignore (5 bytes)',
			'- play/main.js (5,229 bytes)',
			'- play/main.test.js (3,725 bytes)',
		].join("\n").split("\n"))
	})

	it("should run basic demo then exit using PLAY_DEMO_SEQUENCE 1,4", async () => {
		const { stderr, stdout, exitCode } = await run({ ...process.env, PLAY_DEMO_SEQUENCE: "1,4" })
		assert.strictEqual(exitCode, 0, `Process exited with code ${exitCode}. Stderr: ${stderr}`)
		assert.equal(filterDebugger(stderr), "")
		assert.deepStrictEqual(stdout.split("\n").slice(0, 13), [
			Logger.LOGO,
			'Basic DBFS Operations Demo',
			'✓ Saved user data',
			'✓ Loaded user data: {"name":"Alice","role":"Developer"}',
			'✓ Appended log entries',
			'✓ Log content: Demo started',
			'Operations completed',
			'✓ Dropped user document',
			'✓ Dropped logs',
		].join("\n").split("\n"))
	})

	it("should run formats demo then exit using PLAY_DEMO_SEQUENCE 3,4", async () => {
		const { stderr, stdout, exitCode } = await run({ ...process.env, PLAY_DEMO_SEQUENCE: "3,4" })
		assert.strictEqual(exitCode, 0, `Process exited with code ${exitCode}. Stderr: ${stderr}`)
		assert.equal(filterDebugger(stderr), "")
		assert.deepStrictEqual(stdout.split("\n"), [
			Logger.LOGO,
			'File Format Handling Demo',
			'✓ JSON saved',
			'✓ TXT saved',
			'CSV and other formats handled via file-system/index.js',
			'Loaded JSON: {"version":"1.0","features":["save","load","scan"]}',
			'Loaded TXT: Universal | Principles | Guide',
			'',
			'==================================================',
			'Demo completed. Returning to menu...',
			'==================================================',
			'',
			'',
		].join("\n").split("\n"))
	})

	it("should exit immediately using PLAY_DEMO_SEQUENCE 4", async () => {
		const { stderr, stdout, exitCode } = await run({ ...process.env, PLAY_DEMO_SEQUENCE: "4" })
		assert.strictEqual(exitCode, 0, `Process exited with code ${exitCode}. Stderr: ${stderr}`)
		assert.equal(filterDebugger(stderr), "")
		assert.deepStrictEqual(stdout.split("\n"), [
			Logger.LOGO,
			'',
		].join("\n").split("\n"))
	})
})
