import DB, { DocumentStat, DocumentEntry } from '@nan0web/db'
import FS from './FSAdapter.js'
import FSDriver from './FSDriver.js'

class DBFS extends DB {
	static FS = FS
	static Driver = FSDriver
	/**
	 * Array of loader functions that attempt to load data from a file path.
	 * Each loader returns false if it cannot handle the data format.
	 * @type {((file: string, data: any, ext: string) => any)[]}
	 */
	loaders = [
		/** @param {string} file @param {any} data @param {string} ext */
		(file, data, ext) => ('.txt' === ext ? this.FS.loadTXT(file, '', true) : false),
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
		(file, data, ext) => this.FS.saveAsync(file, data),
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

	/**
	 * Returns location for the provided uris.
	 * @param  {...any} args
	 * @returns {string} Absolute location on the drive.
	 */
	location(...args) {
		const uri = this.resolveAlias(args[0])

		if (
			uri?.startsWith('/Users/') ||
			uri?.startsWith('/home/') ||
			uri?.startsWith('/tmp/') ||
			uri?.startsWith('/var/') ||
			(this.FS.sep === '\\' && uri?.includes(':'))
		) {
			return uri
		}

		let rel = uri !== args[0] && uri.startsWith('..') ? uri : this.resolveSync(uri, ...args.slice(1))

		const parts = [this.cwd, this.root, rel].map((p, i) => {
			if (typeof p !== 'string') return p
			// If it starts with / but is not a real host root, and it is NOT the cwd segment,
			// make it relative to allow FS.resolve to join it with preceding segments.
			if (
				i > 0 &&
				p.startsWith('/') &&
				!p.startsWith('/Users/') &&
				!p.startsWith('/home/') &&
				!p.startsWith('/tmp/') &&
				!p.startsWith('/var/')
			) {
				return p.slice(1)
			}
			return p
		})

		return this.FS.resolve(...parts)
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
		this.console.debug('Getting document statistics', { uri })
		const path = this.location(uri)
		try {
			if (!(await this.FS.exists(path))) {
				return new DocumentStat({
					error: new Error('Document not found'),
				})
			}
			return DBFS.createDocumentStatFrom(await this.FS.stat(path))
		} catch (/** @type {any} */ err) {
			return new DocumentStat({
				error: err,
			})
		}
	}

	/**
	 * Loads a document using a specific extension handler.
	 * @param {string} ext The extension of the document.
	 * @param {string} uri The URI to load the document from.
	 * @param {any} defaultValue The default value to return if the document does not exist.
	 * @returns {Promise<any>} The loaded document or the default value.
	 */
	async loadDocumentAs(ext, uri, defaultValue = undefined) {
		this.console.debug('Loading document as', { uri, ext, defaultValue })
		await this.ensureAccess(uri, 'r')
		const file = this.resolveSync(this.resolveAlias(uri))
		const path = this.location(uri)
		if (!(await this.FS.exists(path))) {
			if (!ext) {
				for (const fallbackExt of this.Directory.DATA_EXTNAMES) {
					const stats = await this.statDocument(uri + fallbackExt)
					if (stats.exists && stats.isFile) {
						const data = await this.loadDocument(uri + fallbackExt, null)
						if (null !== data) {
							return data
						}
					}
				}
			}
			return this.data.has(file) ? this.data.get(file) : defaultValue
		}

		// Optimization: Use FS.loadAsync directly if not using custom loaders
		// But only if we are't explicitly asking for .txt or other raw format
		const isText = ['.txt', '.md', '.csv'].includes(ext)
		if (!isText) {
			const res = await this.FS.loadAsync(path, { format: ext, softError: true })
			this.console.debug('DBFS.loadDocumentAs FS.loadAsync result:', {
				uri,
				ext,
				res,
				type: typeof res,
			})
			if (res !== false && res !== undefined) return res
		}

		for (const loader of this.loaders) {
			try {
				const res = loader(path, null, ext)
				if (false !== res) {
					return res
				}
			} catch (/** @type {any} */ err) {
				this.console.error(['Could not load', path].join(': '))
				this.console.error(err.stack ?? err.message)
			}
		}
		
		// Final fallback for any unknown extensions - try to load as text if explicitly requested
		// or if we have no other options and it's not a known binary format
		if (isText || !ext) {
			try {
				const text = this.FS.loadTXT(path, '', true)
				if (text) return text
			} catch (e) {}
		}

		return defaultValue
	}
	/**
	 * Ensures the directory path for a given URI exists, creating it if necessary.
	 * @param {string} uri The URI to build the path for.
	 * @returns {Promise<void>}
	 */
	async _buildPath(uri) {
		const dir = await this.resolve(uri, '..')
		const path = this.location(dir)
		await this.FS.mkdir(path, { recursive: true })
	}
	/**
	 * Saves a document to the given URI, forcing a specific extension / format wrapper.
	 * @throws {Error} If the document cannot be saved.
	 * @param {string} ext The extension/format of the document (e.g. '.txt').
	 * @param {string} uri The URI to save the document to.
	 * @param {any} document The document to save.
	 * @returns {Promise<boolean>} True if saved successfully, false otherwise.
	 */
	async saveDocumentAs(ext, uri, document) {
		this.console.debug('Saving document as', { uri, ext, document })
		await this.ensureAccess(uri, 'w')
		await this._buildPath(uri)
		const file = await this.resolve(uri)
		const cleanFile = file.startsWith('/') ? file.slice(1) : file
		const path = this.FS.resolve(this.cwd, this.root, cleanFile)
		const res = await this.FS.saveAsync(path, document, ext)
		if (false !== res) {
			const stat = await this.statDocument(uri)
			this.meta.set(uri, stat)
			this.data.set(uri, false)
			this.emit('change', { uri, type: 'save', data: document })
			return true
		}
		return false
	}

	/**
	 * Saves a document to the given URI.
	 * @throws {Error} If the document cannot be saved.
	 * @param {string} uri The URI to save the document to.
	 * @param {any} document The document to save.
	 * @returns {Promise<boolean>} True if saved successfully, false otherwise.
	 */
	async saveDocument(uri, document) {
		this.console.debug('Saving document', { uri, document })
		await this.ensureAccess(uri, 'w')
		await this._buildPath(uri)
		const file = this.resolveSync(uri)
		const path = this.location(uri)
		const ext = this.extname(uri)
		const res = await this.FS.saveAsync(path, document, ext)
		if (false !== res) {
			const stat = await this.statDocument(uri)
			this.meta.set(uri, stat)
			this.data.set(uri, false)
			this.emit('change', { uri, type: 'save', data: document })
			return true
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
		this.console.debug('Writing document', { uri, chunk })
		await this.ensureAccess(uri, 'w')
		await this._buildPath(uri)
		const file = this.resolveSync(uri)
		const path = this.location(uri)
		await this.FS.appendFile(path, chunk, {
			encoding: /** @type {BufferEncoding} */ (this.encoding),
		})
		return true
	}
	/**
	 * Creates a read stream for a document at the given URI.
	 * @throws {Error} If the document cannot be read.
	 * @param {string} uri The URI to read from.
	 * @returns {Promise<any>} An asynchronous iterator or stream.
	 */
	async stream(uri) {
		this.console.debug('Streaming document', { uri })
		await this.ensureAccess(uri, 'r')
		const abs = this.location(uri)
		if (this.driver && typeof this.driver.stream === 'function') {
			return this.driver.stream(abs)
		}
		return super.stream(uri)
	}

	/**
	 * Deletes a document at the given URI.
	 * @throws {Error} If the document cannot be dropped.
	 * @param {string} uri The URI(s) of the document(s) to drop.
	 * @returns {Promise<boolean>} True if dropped successfully, false otherwise.
	 */
	async dropDocument(uri) {
		this.console.debug('Deleting document', { uri })
		await this.ensureAccess(uri, 'd')
		const file = this.resolveSync(uri)
		let stat = await this.statDocument(uri)
		if (!stat.exists) return false
		const path = this.location(uri)
		if (stat.isDirectory) {
			const nested = Array.from(this.meta.keys()).filter((u) => u.startsWith(file + '/')).length
			if (nested > 0) {
				throw new Error('Directory has children, delete them first')
			}
			await this.FS.rmdir(path)
			this.meta.delete(file)
			this.data.delete(file)
			this.emit('change', { uri, type: 'drop' })
			return true
		}
		await this.FS.unlink(path)
		stat = await this.statDocument(uri)
		if (!stat.exists) {
			this.data.delete(file)
			this.meta.delete(file)
			this.emit('change', { uri, type: 'drop' })
		}
		return !stat.exists
	}

	/**
	 * Deletes a document or documents at the given URI(s).
	 * @throws {Error} If the document cannot be dropped.
	 * @param {string | string[]} uri The URI(s) of the document(s) to drop.
	 * @returns {Promise<boolean | boolean[]>} True if dropped successfully, false otherwise.
	 */
	async drop(uri) {
		if (Array.isArray(uri)) {
			const result = []
			for (const u of uri) {
				result.push(await this.dropDocument(u))
			}
			return result
		}
		return await this.dropDocument(uri)
	}

	/**
	 * Ensures the current operation has proper access rights.
	 * @param {string} uri The URI to check access for.
	 * @param {"r"|"w"|"d"} [level="r"] The access level: read, write, or delete.
	 * @returns {Promise<void>} True if access is granted.
	 */
	async ensureAccess(uri, level = 'r') {
		await super.ensureAccess(uri, level)
		const file = this.resolveSync(uri)
		if (uri.endsWith('/llm.config.js') || uri !== this.resolveAlias(uri)) {
			/** @note load config file or explicit aliases from anywhere */
			return
		}
		if (file.startsWith('..')) {
			throw new Error('No access outside of the db container')
		}
	}

	/**
	 * Lists the contents of a directory.
	 * @param {string} uri The directory URI to list.
	 * @param {{depth?: number, skipStat?: boolean}} options Options for listing.
	 * @returns {Promise<DocumentEntry[]>} The list of directory entries.
	 */
	async listDir(uri, { depth = 0, skipStat = false } = {}) {
		this.console.debug('Listing directory', { uri, depth, skipStat })
		const path = this.location(uri)
		const entries = /** @type {import("node:fs").Dirent[]} */ (
			/** @type {unknown} */ (await this.FS.readdir(path, { withFileTypes: true }))
		)
		const files = await Promise.all(
			entries.map(async (entry) => {
				let stat = new DocumentStat({
					isDirectory: entry.isDirectory(),
					isFile: entry.isFile(),
				})
				if (!skipStat) {
					try {
						const entryPath = this.FS.resolve(path, entry.name)
						Object.assign(stat, DBFS.createDocumentStatFrom(await this.FS.stat(entryPath)))
					} catch (err) {
						stat.error = /** @type {Error} */ (err)
					}
				}
				const file = this.FS.relative(
					this.location(''),
					this.FS.resolve(path, entry.name),
				)
				return new DocumentEntry({
					stat,
					name: entry.name,
					path: file,
					depth,
				})
			}),
		)
		files.sort((a, b) => Number(b.stat.isDirectory) - Number(a.stat.isDirectory))
		return files
	}

	/**
	 * Detects auto-locales based on first level directory names.
	 * Matches against built-in Intl language list.
	 * @returns {Promise<{locale: string, title: string, dir: string}[]>}
	 */
	async detectLocales() {
		const entries = await this.listDir('', { depth: 0, skipStat: false })
		const locales = []

		for (const entry of entries) {
			if (!entry.stat.isDirectory || entry.name.startsWith('_') || entry.name.startsWith('.')) continue
			try {
				const loc = new Intl.Locale(entry.name)
				const display = new Intl.DisplayNames([entry.name], {
					type: 'language',
					fallback: 'none',
				})
				// Get language name natively, capitalize first letter
				const name = display.of(entry.name)
				if (!name) continue
				const title = name.charAt(0).toUpperCase() + name.slice(1)
				/** @ts-ignore — Intl.Locale.textInfo is Stage 3, supported in Node 21+ */
				const dir = loc.textInfo?.direction === 'rtl' ? 'rtl' : 'ltr'
				locales.push({
					locale: entry.name,
					title,
					dir,
				})
			} catch (err) {
				// Not a valid BCP 47 locale tag, skip
			}
		}

		// Sort alphabetically by locale
		locales.sort((a, b) => a.locale.localeCompare(b.locale))

		return locales
	}

	/**
	 * Computes absolute URI for the path segments.
	 * @param {...string} args - Path segments
	 * @returns {string} Absolute URI
	 */
	absolute(...args) {
		return this.location(...args)
	}

	/**
	 * Computes relative URI for the given path.
	 * @param {string} from - Base path
	 * @param {string} [to=from] - Target path (defaults to this.root)
	 * @returns {string} Relative URI
	 */
	relative(from, to) {
		// If both paths are absolute filesystem paths, compute relative path
		if (from.startsWith('/') && to?.startsWith('/')) {
			if (!to.endsWith('/')) to += '/'
			return from.startsWith(to) ? from.substring(to.length) : from
		}

		// Default to root if to is not provided
		if (to === undefined) {
			return this.FS.relative(this.root, from)
		}

		return to
	}

	/**
	 * Fixes path separators for Windows systems.
	 * @param {string} path The path to fix.
	 * @returns {string} The path with forward slashes.
	 */
	static winFix(path) {
		return '/' === this.FS.sep ? path : path.replaceAll(this.FS.sep, '/')
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
