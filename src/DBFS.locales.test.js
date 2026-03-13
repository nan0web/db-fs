import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DBFS } from './index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tempDir = path.join(__dirname, '..', '.test_locales')

test('DBFS Locale Auto-Detection Protocols', async (t) => {
	await fs.mkdir(tempDir, { recursive: true })

	// Create mock directories
	const dirs = ['en', 'uk', 'ar', 'assets', 'docs', '_hidden', '.git', 'zh-CN']
	for (const dir of dirs) {
		await fs.mkdir(path.join(tempDir, dir), { recursive: true })
	}
	// Create a file to ensure it gets ignored
	await fs.writeFile(path.join(tempDir, 'file.txt'), 'Not a directory')

	t.after(async () => {
		await fs.rm(tempDir, { recursive: true, force: true })
	})

	const db = DBFS.from({ root: tempDir })

	await t.test('detectLocales() detects standard locales and capitalizes titles', async () => {
		const locales = await db.detectLocales()
		// en, uk, ar, zh-CN should be detected

		const en = locales.find((l) => l.locale === 'en')
		assert.ok(en, 'Should detect english')
		assert.equal(en.title, 'English')
		assert.equal(en.dir, 'ltr')

		const uk = locales.find((l) => l.locale === 'uk')
		assert.ok(uk, 'Should detect ukrainian')
		assert.equal(uk.title, 'Українська')
		assert.equal(uk.dir, 'ltr')

		const zh = locales.find((l) => l.locale === 'zh-CN')
		assert.ok(zh, 'Should detect chinese')
		// We avoid asserting full string match because node versions can slightly differ
		// e.g. 中文（简体，中国） vs 中文（中国） vs 中文. But we know it's string.
		assert.ok(typeof zh.title === 'string' && zh.title.length > 0)
		assert.equal(zh.dir, 'ltr')
	})

	await t.test('detectLocales() detects rtl locales properly', async () => {
		const locales = await db.detectLocales()

		const ar = locales.find((l) => l.locale === 'ar')
		assert.ok(ar, 'Should detect arabic')
		assert.equal(ar.title, 'العربية')
		assert.equal(ar.dir, 'rtl')
	})

	await t.test('detectLocales() ignores invalid structural bcp47, special folders and files', async () => {
		const locales = await db.detectLocales()

		// Total valid: ar, en, uk, zh-CN -> 4 count
		assert.equal(locales.length, 4, 'Should contain exactly 4 valid locales')

		assert.equal(
			locales.find((l) => l.locale === 'assets'),
			undefined,
			'Should ignore structurally-valid but non-existing locale items',
		)
		assert.equal(
			locales.find((l) => l.locale === 'docs'),
			undefined,
			'Should ignore structurally invalid tag like docs',
		)
		assert.equal(
			locales.find((l) => l.locale === '_hidden'),
			undefined,
			'Should ignore underscores',
		)
		assert.equal(
			locales.find((l) => l.locale === '.git'),
			undefined,
			'Should ignore dot folders',
		)
		assert.equal(
			locales.find((l) => l.locale === 'file.txt'),
			undefined,
			'Should ignore files',
		)

		// Ensure sorted properly alphabetically
		assert.equal(locales[0].locale, 'ar')
		assert.equal(locales[1].locale, 'en')
		assert.equal(locales[2].locale, 'uk')
		assert.equal(locales[3].locale, 'zh-CN')
	})
})
