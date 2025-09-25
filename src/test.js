import { resolve, sep } from "node:path"
import { rmdirSync, mkdirSync, existsSync } from "node:fs"
import DBFSBase from "./DBFS.js"

export class DBFS extends DBFSBase {
	async disconnect() {
		await super.disconnect()
		const dirs = new Set()
		for (const [uri, stat] of this.meta.entries()) {
			if (!stat.isFile) {
				dirs.add(uri)
				continue
			}
			await this.dropDocument(uri)
		}
		const arr = Array.from(dirs).sort((a, b) => b.split("/").length - a.split("/").length)
		for (const dir of arr) {
			const path = this.location(dir)
			if (existsSync(path)) rmdirSync(path)
		}
	}
}

export default class TestDir {
	constructor(root) {
		this.root = "__test_fs__/" + root
	}
	erase() {
		const resolvedDir = resolve(this.root)
		if (existsSync(resolvedDir)) {
			rmdirSync(resolvedDir, { recursive: true })
		}
		mkdirSync(resolvedDir, { recursive: true })
	}
	join(dir) {
		return [this.root, dir].join(sep)
	}
}
