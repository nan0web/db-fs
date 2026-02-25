import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { loadMD, saveMD } from './md.js'

describe('md (Markdown with frontmatter)', () => {
	const tmpDir = path.join(os.tmpdir(), 'db-fs-md-test-' + Date.now())

	// Setup temp dir
	fs.mkdirSync(tmpDir, { recursive: true })

	describe('loadMD', () => {
		it('should parse frontmatter and content', () => {
			const file = path.join(tmpDir, 'basic.md')
			fs.writeFileSync(
				file,
				[
					'---',
					'title: Серія 1',
					'tags: [truth, activation]',
					'order: 1',
					'---',
					'',
					'# Заголовок',
					'',
					'Текст контенту.',
				].join('\n'),
			)

			const result = loadMD(file)

			assert.equal(result.title, 'Серія 1')
			assert.deepStrictEqual(result.tags, ['truth', 'activation'])
			assert.equal(result.order, 1)
			assert.ok(result.content.includes('# Заголовок'))
			assert.ok(result.content.includes('Текст контенту.'))
		})

		it('should handle markdown without frontmatter', () => {
			const file = path.join(tmpDir, 'no-frontmatter.md')
			fs.writeFileSync(file, '# Just a heading\n\nSome text.')

			const result = loadMD(file)

			assert.equal(result.title, undefined)
			assert.ok(result.content.includes('# Just a heading'))
			assert.ok(result.content.includes('Some text.'))
		})

		it('should handle empty frontmatter', () => {
			const file = path.join(tmpDir, 'empty-fm.md')
			fs.writeFileSync(file, '---\n---\n\nContent only.')

			const result = loadMD(file)

			assert.ok(result.content.includes('Content only.'))
		})

		it('should preserve complex YAML metadata', () => {
			const file = path.join(tmpDir, 'complex.md')
			fs.writeFileSync(
				file,
				[
					'---',
					'title: "Анатомія Тривоги"',
					'series: 1',
					'date: 2026-02-01',
					'author: ЯRаСлав',
					'tags:',
					'  - superintellect',
					'  - activation',
					'  - truth',
					'---',
					'',
					'# Серія 1: Анатомія Тривоги',
					'',
					'> "Врятуй себе, і врятуєш тисячі."',
				].join('\n'),
			)

			const result = loadMD(file)

			assert.equal(result.title, 'Анатомія Тривоги')
			assert.equal(result.series, 1)
			assert.equal(result.author, 'ЯRаСлав')
			assert.equal(result.tags.length, 3)
			assert.ok(result.content.includes('Врятуй себе'))
		})

		it('should return null on softError for missing file', () => {
			const result = loadMD('/nonexistent/file.md', true)
			assert.equal(result, null)
		})

		it('should throw for missing file without softError', () => {
			assert.throws(() => loadMD('/nonexistent/file.md', false))
		})

		it('should handle frontmatter with --- inside content', () => {
			const file = path.join(tmpDir, 'triple-dash.md')
			fs.writeFileSync(
				file,
				[
					'---',
					'title: Test',
					'---',
					'',
					'Some content.',
					'',
					'---',
					'',
					'This is a horizontal rule, not frontmatter.',
				].join('\n'),
			)

			const result = loadMD(file)

			assert.equal(result.title, 'Test')
			assert.ok(result.content.includes('---'))
			assert.ok(result.content.includes('horizontal rule'))
		})
	})

	describe('saveMD', () => {
		it('should save metadata + content as frontmatter markdown', () => {
			const file = path.join(tmpDir, 'saved.md')
			saveMD(file, {
				title: 'Збережена стаття',
				tags: ['test'],
				content: '# Заголовок\n\nТекст.',
			})

			const raw = fs.readFileSync(file, 'utf8')
			assert.ok(raw.startsWith('---'))
			assert.ok(raw.includes('title: Збережена стаття'))
			assert.ok(raw.includes('# Заголовок'))

			// Round-trip
			const loaded = loadMD(file)
			assert.equal(loaded.title, 'Збережена стаття')
			assert.ok(loaded.content.includes('# Заголовок'))
		})

		it('should save content-only if no metadata', () => {
			const file = path.join(tmpDir, 'content-only.md')
			saveMD(file, { content: '# Just content' })

			const raw = fs.readFileSync(file, 'utf8')
			assert.ok(!raw.startsWith('---'))
			assert.ok(raw.includes('# Just content'))
		})
	})

	// Cleanup
	it('cleanup temp dir', () => {
		fs.rmSync(tmpDir, { recursive: true, force: true })
	})
})
