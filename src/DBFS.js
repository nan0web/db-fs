import DB, { DocumentStat, DocumentEntry } from "@nan0web/db"
import FS from "./FS.js"

class DBFS extends DB {
	static FS = FS
	/**
	 * Array of loader functions that attempt to load data from a file path.
	 * Each loader returns false if it cannot handle the data format.
	 * @type {((file: string, data: any, ext: string) => any)[]}
	 */
	loaders = [
		/** @param {string} file @param {any} data @param {string} ext */
		(file, data, ext) => ".txt" === ext ? this.FS.loadTXT(file, "", true) : false,
		/** @param {string} file @param {any} data @param {string} ext */
		(file, data, ext) => this.FS.load(file),
	]
	/**
	 * Array of saver functions that attempt to save data to a file path.
	 * Each saver returns false if it cannot handle the data format.
	 * @type {((file: string, data: any, ext: string) => any)[]}
	 */
	savers = [
		/** @param {string} file @param {any} data @param {string} ext */
		(file, data, ext) => this.FS.save(file, data),
	]

	/**
	 * @returns {typeof FS}
	 */
	get FS() {
		return /** @type {typeof DBFS} */ (this.constructor).FS
	}

	/**
	 * Creates a new DB instance with a subset of the data and meta.
	 * @param {string} uri The URI to extract from the current DB.
	 * @returns {DBFS}
	 */
	extract(uri) {
		return DBFS.from(super.extract(uri))
	}

	location(...args) {
		const abs = super.absolute(...args)
		return this.FS.resolve(this.cwd, abs.startsWith("/") ? abs.slice(1) : abs)
	}

	/**
	 * Returns the stat of the document without meta (cache) check.
	 * ```
	 * NO ACCESS CHECK!
	 * ```
	 * @param {string} uri The URI to stat the document from.
	 * @returns {Promise<DocumentStat>} The document stat.
	 */
	async statDocument(uri) {
		this.console.debug("Getting document statistics", { uri })
		const file = await this.resolve(uri)
		const path = this.FS.resolve(this.cwd, this.root, file)
		try {
			if (!this.FS.existsSync(path)) {
				return new DocumentStat({
					error: new Error("Document not found")
				})
			}
			return DBFS.createDocumentStatFrom(this.FS.statSync(path))
		} catch (/** @type {any} */ err) {
			return new DocumentStat({
				error: err
			})
		}
	}
	/**
	 * Loads a document from the given URI.
	 * @param {string} uri The URI to load the document from.
	 * @param {any} defaultValue The default value to return if the document does not exist.
	 * @returns {Promise<any>} The loaded document or the default value.
	 */
	async loadDocument(uri, defaultValue = "") {
		this.console.debug("Loading document", { uri, defaultValue })
		const ext = this.extname(uri)
		return await this.loadDocumentAs(ext, uri, defaultValue)
	}
	/**
	 * Loads a document using a specific extension handler.
	 * @param {string} ext The extension of the document.
	 * @param {string} uri The URI to load the document from.
	 * @param {any} defaultValue The default value to return if the document does not exist.
	 * @returns {Promise<any>} The loaded document or the default value.
	 */
	async loadDocumentAs(ext, uri, defaultValue = "") {
		this.console.debug("Loading document as", { uri, ext, defaultValue })
		await this.ensureAccess(uri, "r")
		const file = await this.resolve(uri)
		const path = this.FS.resolve(this.cwd, this.root, file)
		if (!this.FS.existsSync(path)) return defaultValue
		for (const loader of this.loaders) {
			const res = loader(path, null, ext)
			if (false !== res) {
				return res
			}
		}
		return false
	}
	/**
	 * Ensures the directory path for a given URI exists, creating it if necessary.
	 * @param {string} uri The URI to build the path for.
	 * @returns {Promise<void>}
	 */
	async _buildPath(uri) {
		const dir = await this.resolve(uri, "..")
		const path = this.FS.resolve(this.cwd, this.root, dir)
		this.FS.mkdirSync(path, { recursive: true })
	}
	/**
	 * Saves a document to the given URI.
	 * @throws {Error} If the document cannot be saved.
	 * @param {string} uri The URI to save the document to.
	 * @param {any} document The document to save.
	 * @returns {Promise<boolean>} True if saved successfully, false otherwise.
	 */
	async saveDocument(uri, document) {
		this.console.debug("Saving document", { uri, document })
		await this.ensureAccess(uri, "w")
		await this._buildPath(uri)
		const file = await this.resolve(uri)
		const path = this.FS.resolve(this.cwd, this.root, file)
		const ext = this.extname(uri)
		for (const saver of this.savers) {
			if (false !== saver(path, document, ext)) {
				const stat = await this.statDocument(uri)
				this.meta.set(uri, stat)
				this.data.set(uri, false)
				return true
			}
		}
		return false
	}
	/**
	 * Appends a chunk of data to a document at the given URI.
	 * @throws {Error} If the document cannot be written.
	 * @param {string} uri The URI to write the document to.
	 * @param {string} chunk The chunk to write.
	 * @returns {Promise<boolean>} True if written successfully, false otherwise.
	 */
	async writeDocument(uri, chunk) {
		this.console.debug("Writing document", { uri, chunk })
		await this.ensureAccess(uri, "w")
		await this._buildPath(uri)
		const file = await this.resolve(uri)
		const path = this.FS.resolve(this.cwd, this.root, file)
		this.FS.appendFileSync(path, chunk, {
			encoding: /** @type {BufferEncoding} */ (this.encoding)
		})
		return true
	}
	/**
	 * Deletes a document at the given URI.
	 * @throws {Error} If the document cannot be dropped.
	 * @param {string} uri The URI to drop the document from.
	 * @returns {Promise<boolean>} True if dropped successfully, false otherwise.
	 */
	async dropDocument(uri) {
		this.console.debug("Deleting document", { uri })
		await this.ensureAccess(uri, "d")
		const file = await this.resolve(uri)
		let stat = await this.statDocument(uri)
		if (!stat.exists) return false
		const path = this.FS.resolve(this.cwd, this.root, file)
		if (stat.isDirectory) {
			const nested = Array.from(this.meta.keys()).filter(u => u.startsWith(file + "/")).length
			if (nested > 0) {
				throw new Error("Directory has children, delete them first")
			}
			this.FS.rmdirSync(path)
			this.meta.delete(file)
			this.data.delete(file)
			return true
		}
		this.FS.unlinkSync(path)
		stat = await this.statDocument(uri)
		if (!stat.exists) {
			this.data.delete(file)
			this.meta.delete(file)
		}
		return !stat.exists
	}

	/**
	 * Ensures the current operation has proper access rights.
	 * @param {string} uri The URI to check access for.
	 * @param {"r"|"w"|"d"} [level="r"] The access level: read, write, or delete.
	 * @returns {Promise<void>} True if access is granted.
	 */
	async ensureAccess(uri, level = "r") {
		await super.ensureAccess(uri, level)
		const path = await this.resolve(uri)
		if (uri.endsWith("/llm.config.js")) {
			/** @note load config file from anywhere */
			return
		}
		if (path.startsWith("..")) {
			throw new Error("No access outside of the db container")
		}
	}

	/**
	 * Lists the contents of a directory.
	 * @param {string} uri The directory URI to list.
	 * @param {{depth?: number, skipStat?: boolean}} options Options for listing.
	 * @returns {Promise<DocumentEntry[]>} The list of directory entries.
	 */
	async listDir(uri, { depth = 0, skipStat = false } = {}) {
		const path = this.FS.resolve(this.cwd, this.root, uri)
		const entries = this.FS.readdirSync(path, { withFileTypes: true })
		const files = entries.map((entry) => {
			let stat = new DocumentStat()
			if (!skipStat) {
				try {
					const entryPath = this.FS.resolve(path, entry.name)
					stat = DBFS.createDocumentStatFrom(this.FS.statSync(entryPath))
				} catch (err) {
					stat = new DocumentStat({
						error: /** @type {Error} */ (err)
					})
				}
			}
			return new DocumentEntry({
				stat,
				name: entry.name,
				path: this.FS.relative(this.cwd, this.FS.resolve(this.cwd, path, entry.name)),
				depth,
			})
		})
		files.sort((a, b) => Number(b.stat.isDirectory) - Number(a.stat.isDirectory))
		return files
	}

	/**
	 * Fixes path separators for Windows systems.
	 * @param {string} path The path to fix.
	 * @returns {string} The path with forward slashes.
	 */
	static winFix(path) {
		return "/" === this.FS.sep ? path : path.replaceAll(this.FS.sep, "/")
	}
	/**
	 * Creates a DocumentStat instance from fs.Stats.
	 * @param {import("node:fs").Stats} stats The fs.Stats object.
	 * @returns {DocumentStat} A new DocumentStat instance.
	 */
	static createDocumentStatFrom(stats) {
		return new DocumentStat({
			atimeMs: stats.atimeMs,
			btimeMs: stats.birthtimeMs,
			blksize: stats.blksize,
			blocks: stats.blocks,
			ctimeMs: stats.ctimeMs,
			dev: stats.dev,
			gid: stats.gid,
			ino: stats.ino,
			mode: stats.mode,
			mtimeMs: stats.mtimeMs,
			nlink: stats.nlink,
			rdev: stats.rdev,
			size: stats.size,
			uid: stats.uid,
			isDirectory: stats.isDirectory(),
			isFile: stats.isFile(),
			isBlockDevice: stats.isBlockDevice(),
			isFIFO: stats.isFIFO(),
			isSocket: stats.isSocket(),
			isSymbolicLink: stats.isSymbolicLink(),
		})
	}
	/**
	 * Creates a DBFS instance from input parameters.
	 * @param {object} input The input parameters for DBFS.
	 * @returns {DBFS} A new or existing DBFS instance.
	 */
	static from(input) {
		if (input instanceof DBFS) return input
		return new DBFS(input)
	}
}

export default DBFS
