import { suite, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DocumentEntry } from "@nan0web/db"
import TestDir, { DBFS } from './test.js'

const testDir = new TestDir("db-list-test-js")

class DB extends DBFS {
	accessLevels = []
	async ensureAccess(uri, level = 'r') {
		this.accessLevels.push({ uri, level })
		if (!['r', 'w', 'd'].includes(level)) {
			throw new TypeError([
				"Access level must be one of [r, w, d]",
				"r = read",
				"w = write",
				"d = delete",
			].join("\n"))
		}
		return true
	}
}

suite("DB", () => {
	describe("listDir", () => {
		it('should list directory contents correctly', async () => {
			const db = new DB({
				root: testDir.join("dist"),
				predefined: [
					['dir1/file1.txt', 'content1'],
					['dir1/file2.txt', 'content2'],
					['dir2/index.json', '[]'],
					['dir2/subdir/config.json', '{}'],
					['other.txt', 'other']
				]
			})

			await db.connect()
			await db.dump(db)

			const r1 = (await db.listDir('dir1')).map(entry => entry.path)
			assert.deepStrictEqual(r1, ["dir1/file1.txt", "dir1/file2.txt"])
			const r2 = (await db.listDir('.')).map(entry => entry.path)
			assert.deepStrictEqual(r2, ["dir1", "dir2", "other.txt"])
			const r3 = (await db.listDir('dir2')).map(entry => entry.path)
			assert.deepStrictEqual(r3, ["dir2/subdir", "dir2/index.json"])

			await db.disconnect()
		})
	})

	describe('readDir', () => {
		it('should return empty array for no directory', async () => {
			const baseDb = new DB()
			const fn = async () => {
				const result = []
				for await (const some of baseDb.readDir('path')) {
					// consume generator
					result.push(some)
				}
				return result
			}
			const result = await fn()
			assert.equal(result.length, 0)
		})

		it('should yield directory entries', async () => {
			const db = new DB({
				root: testDir.join("dist-entries"),
				predefined: [
					['file1.txt', 'content1'],
					['file2.txt', 'content2']
				]
			})
			await db.connect()
			await db.dump(db)

			const entries = []
			for await (const entry of db.readDir('.', { depth: 0 })) {
				entries.push(entry)
			}

			assert.strictEqual(entries.length, 2)
			assert.ok(entries[0] instanceof DocumentEntry)
			assert.ok(entries[1] instanceof DocumentEntry)

			await db.disconnect()
		})

		it('should read recursively with depth > 0', async () => {
			const db = new DB({
				root: testDir.join("depth1"),
				predefined: [
					['dir1/file1.txt', 'content1'],
					['dir1/dir2/file2.txt', 'content2'],
					['dir1/dir2/dir3/file3.txt', 'content3']
				]
			})
			await db.connect()
			await db.dump(db)

			const entries = []
			for await (const entry of db.readDir('.', { depth: 3 })) {
				entries.push(entry)
			}

			assert.strictEqual(entries.length, 3)
			assert.ok(entries.find(e => e.path === 'dir1/file1.txt'))
			assert.ok(entries.find(e => e.path === 'dir1/dir2/file2.txt'))
			assert.ok(entries.find(e => e.path === 'dir1/dir2/dir3/file3.txt'))

			await db.disconnect()
		})

		it('should read index.txtl at depth 0', async () => {
			const db = new DB({
				root: testDir.join("depth0"),
				predefined: [
					['index.txtl', `columns: name, mtimeMs.36, size.36
long
---
file.json h7v37t 2s
dir/sub.json h7v37u 5k`]
				]
			})
			await db.connect()

			const entries = []
			for await (const entry of db.readDir('.')) {
				entries.push(entry)
			}

			assert.strictEqual(entries.length, 2)
			assert.ok(entries.find(e => e.path === 'file.json'))
			assert.ok(entries.find(e => e.path === 'dir/sub.json'))

			await db.disconnect()
		})

		it('should read index.txt at depth 0', async () => {
			const db = new DB({
				root: testDir.join("index-txt"),
				predefined: [
					['index.txt', 'file1.txt mecxlwg9 8x\nfile2.txt mecvlwg9 8c']
				]
			})
			await db.connect()

			const entries = []
			for await (const entry of db.readDir('.', { depth: 0 })) {
				entries.push(entry)
			}

			assert.strictEqual(entries.length, 2)
			assert.ok(entries.find(e => e.path === 'file1.txt'))
			assert.ok(entries.find(e => e.path === 'file2.txt'))

			await db.disconnect()
		})

		it('should read with depth 1 to include subdirectories', async () => {
			const db = new DB({
				root: testDir.join("depth1-sub"),
				predefined: [
					['dir1/index.txt', 'file1.txt mecxlwg9 8x\nfile2.txt mecvlwg9 8c\nsubdir/ mecvlwg9 0'],
					['dir1/subdir/index.txt', 'nested.json mecxlwg9 8x'],
					['dir1/file1.txt', 'content1'],
					['dir1/file2.txt', 'content2'],
					['dir1/subdir/nested.json', 'content3']
				]
			})
			await db.connect()

			const entries = []
			for await (const entry of db.readDir('dir1', { depth: 1 })) {
				entries.push(entry)
			}

			assert.ok(entries.length >= 3)
			assert.ok(entries.find(e => e.path === 'dir1/file1.txt'))
			assert.ok(entries.find(e => e.path === 'dir1/file2.txt'))
			assert.ok(entries.find(e => e.path === 'dir1/subdir/nested.json'))

			await db.disconnect()
		})

		it('should read with skipStat option', async () => {
			const db = new DB({
				root: testDir.join("skip-stat"),
				predefined: [
					['file1.txt', 'content1'],
					['file2.txt', 'content2']
				]
			})
			await db.connect()
			await db.dump(db)

			const entries = []
			for await (const entry of db.readDir('.', { depth: 0, skipStat: true })) {
				entries.push(entry)
			}

			assert.strictEqual(entries.length, 2)
			assert.ok(entries.find(e => e.path === 'file1.txt'))
			assert.ok(entries.find(e => e.path === 'file2.txt'))

			await db.disconnect()
		})

		it('should respect filter function', async () => {
			const db = new DB({
				root: testDir.join("filter"),
				predefined: [
					['file1.txt', 'content1'],
					['file2.json', 'content2'],
					['file3.md', 'content3']
				]
			})
			await db.connect()
			await db.dump(db)

			const entries = []
			for await (const entry of db.readDir('.', {
				depth: 0,
				filter: (entry) => entry.path.endsWith('.txt')
			})) {
				entries.push(entry)
			}

			assert.strictEqual(entries.length, 1)
			assert.ok(entries.find(e => e.path === 'file1.txt'))

			await db.disconnect()
		})

		describe('readDir with depth logic', () => {
			it('should load index.txtl when depth=0', async () => {
				const db = new DB({
					root: testDir.join("index-txtl"),
					predefined: [
						['index.txtl', `columns: name, mtimeMs.36, size.36
long
---
file.json h7v37t 2s
dir/sub.json h7v37u 5k`]
					]
				})
				await db.connect()

				const entries = []
				for await (const entry of db.readDir('.')) {
					entries.push(entry)
				}

				assert.equal(entries.length, 2)
				assert.equal(entries[0].path, 'file.json')
				assert.equal(entries[1].path, 'dir/sub.json')

				await db.disconnect()
			})

			it('should load index.txt and go deeper when depth=1-3', async () => {
				const db = new DB({
					root: testDir.join("depth13"),
					predefined: [
						['index.txt', 'file.json mecxlwg9 8x\nsubdir/ mecvlwg9 0'],
						['subdir/index.txt', 'nested.json mecxlwg9 8x']
					]
				})
				await db.connect()
				await db.dump(db)

				const entries = []
				for await (const entry of db.readDir('.', { depth: 2 })) {
					entries.push(entry.path)
				}

				assert.deepStrictEqual(entries, [
					"file.json", "subdir/", "subdir/nested.json"
				])

				await db.disconnect()
			})

			it('should read directory contents recursively without index files', async () => {
				const db = new DB({
					root: testDir.join("rec"),
					predefined: [
						['dir1/file1.txt', 'content1'],
						['dir1/dir2/file2.txt', 'content2'],
						['dir1/dir2/dir3/file3.txt', 'content3'],
						['other.txt', 'other']
					]
				})
				await db.connect()
				await db.dump(db)

				const entries = []
				for await (const entry of db.readDir('dir1', { depth: 3 })) {
					entries.push(entry.path)
				}

				assert.deepStrictEqual(entries, [
					"dir1/dir2/dir3/file3.txt",
					"dir1/dir2/file2.txt",
					"dir1/file1.txt",
				])

				await db.disconnect()
			})

			it('should read directory contents flat (depth=0) without index files', async () => {
				const db = new DB({
					root: testDir.join("flat"),
					predefined: [
						['file1.txt', 'content1'],
						['dir/file2.txt', 'content2'],
						['dir/subdir/file3.txt', 'content3']
					]
				})
				await db.connect()
				await db.dump(db)

				const entries = []
				for await (const entry of db.readDir('dir', { depth: 0, includeDirs: true })) entries.push(entry.path)

				assert.deepStrictEqual(entries, [
					"dir/subdir", "dir/file2.txt",
				])

				await db.disconnect()
			})

			it('should read directory contents limited by depth without index files', async () => {
				const db = new DB({
					root: testDir.join("without-index"),
					predefined: [
						['limited/file1.txt', 'content1'],
						['limited/dir/file2.txt', 'content2'],
						['limited/dir/subdir/file3.txt', 'content3']
					]
				})
				await db.connect()
				await db.dump(db)

				const entries = []
				for await (const entry of db.readDir('limited', { depth: 1 })) {
					entries.push(entry.path)
				}

				assert.deepStrictEqual(entries, [
					"limited/dir/file2.txt",
					"limited/file1.txt",
				])

				await db.disconnect()
			})
		})
	})

	describe('readBranch', () => {
		it('should return async generator', async () => {
			const db = new DB()
			await db.connect()
			const result = await db.readBranch('path', 1)
			assert.ok(result[Symbol.asyncIterator])
			await db.disconnect()
		})
	})
})
