import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DBFS } from './index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tempDir = path.join(__dirname, '..', '.test_aliases')

test('DBFS Aliases Protocol', async (t) => {
	// 1. Setup temp directory and files
	await fs.mkdir(tempDir, { recursive: true })
	await fs.writeFile(path.join(tempDir, 'root_file.md'), '# Root File Content')
	await fs.mkdir(path.join(tempDir, 'docs', 'en'), { recursive: true })
	await fs.writeFile(path.join(tempDir, 'docs', 'en', 'local.md'), '# Local Content')

	t.after(async () => {
		await fs.rm(tempDir, { recursive: true, force: true })
	})

	const db = DBFS.from({
		root: path.join(tempDir, 'docs'),
		aliases: {
			'en/root_file.md': '../root_file.md', // Relative to 'docs' root
		},
	})

	await t.test('loadDocumentAs() transparently loads aliased file', async () => {
		const result = await db.loadDocumentAs('.md', 'en/root_file.md')
		assert.equal(result.content, '# Root File Content')
	})

	await t.test('statDocument() returns correct stats for aliased file', async () => {
		const stat = await db.statDocument('en/root_file.md')
		assert.ok(stat.exists, 'Stat should show that file exists')
		assert.ok(stat.isFile, 'Stat should show that it is a file')
	})

	await t.test('loadDocumentAs() loads non-aliased local file correctly', async () => {
		const result = await db.loadDocumentAs('.md', 'en/local.md')
		assert.equal(result.content, '# Local Content')
	})
})
