import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DBFS from '../../../../../../src/DBFS.js'
import FS from '../../../../../../src/FSAdapter.js'

describe('DBFS v1.2.2: Path Resolution for Relative Roots', () => {
	it('should resolve correctly with relative root and cwd="."', () => {
		const db = new DBFS({ cwd: '.', root: 'public/data' })
		const path = db.location('cards/doc.json')

		const expected = FS.resolve(process.cwd(), 'public/data/cards/doc.json')
		assert.strictEqual(path, expected)

		// Must NOT point to system root
		if (process.cwd() !== '/') {
			assert.notStrictEqual(path, '/public/data/cards/doc.json')
		}
	})

	it('should resolve correctly with nested relative root', () => {
		const db = new DBFS({ cwd: 'apps/web', root: 'public/data' })
		const path = db.location('cards/doc.json')

		const expected = FS.resolve(process.cwd(), 'apps/web/public/data/cards/doc.json')
		assert.strictEqual(path, expected)
	})

	it('should handle virtual absolute URIs correctly', () => {
		const db = new DBFS({ cwd: '.', root: 'data' })
		const path = db.location('/cards/doc.json')

		const expected = FS.resolve(process.cwd(), 'data/cards/doc.json')
		assert.strictEqual(path, expected)
	})

	it('should delegate absolute() to location()', () => {
		const db = new DBFS({ cwd: '.', root: 'data' })
		const loc = db.location('file.json')
		const abs = db.absolute('file.json')

		assert.strictEqual(abs, loc)
	})
})
