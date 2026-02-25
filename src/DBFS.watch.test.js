import { describe, it } from 'node:test'
import assert from 'node:assert'
import DBFS from './DBFS.js'

describe('DBFS.watch — change events', () => {
	it('saveDocument emits change event', async () => {
		const db = new DBFS({ root: '/tmp/dbfs-watch-test' })
		await db.connect()
		const events = []
		db.watch('docs', (e) => events.push(e))

		await db.saveDocument('docs/test.json', { ok: true })

		const saveEvent = events.find((e) => e.type === 'save')
		assert.ok(saveEvent)
		assert.strictEqual(saveEvent.uri, 'docs/test.json')
		assert.deepStrictEqual(saveEvent.data, { ok: true })

		// cleanup
		await db.dropDocument('docs/test.json')
	})

	it('dropDocument emits change event', async () => {
		const db = new DBFS({ root: '/tmp/dbfs-watch-test' })
		await db.connect()
		await db.saveDocument('tmp/drop-test.json', { x: 1 })
		const events = []
		db.watch('tmp', (e) => events.push(e))

		await db.dropDocument('tmp/drop-test.json')

		const dropEvent = events.find((e) => e.type === 'drop')
		assert.ok(dropEvent)
		assert.strictEqual(dropEvent.uri, 'tmp/drop-test.json')
	})
})
