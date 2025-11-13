// Base protocol import (must be available)
import { constants } from 'node:fs'
import { AuthContext, DBDriverProtocol, DocumentStat } from '@nan0web/db'
import { mkdir, unlink, stat, appendFile, readdir, access } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { load, save } from "./file-system/index.js"

/**
 * File System Driver for Node.js environments.
 * Provides persistent storage using fs/promises with automatic format handling.
 */
export default class FSDriver extends DBDriverProtocol {
	/**
	 * Connects to the file system.
	 * @returns {Promise<void>}
	 * @throws {Error} - If root directory is inaccessible
	 */
	async connect() {
		const root = resolve(this.cwd, this.root)
		try {
			await mkdir(root, { recursive: true })
		} catch (/** @type {any} */ err) {
			throw new Error(`Failed to create root directory: ${root}\n${err.stack ?? err.message}`)
		}
		this.connected = true
	}

	/**
	 * Ensures access to the resource.
	 * @param {string} absoluteURI - URI path
	 * @param {'r'|'w'|'d'} [level="r"]
	 * @param {AuthContext} [context=new AuthContext()]
	 * @returns {Promise<boolean | void>} - TRUE if allowed, FALSE if denied, undefined if not realized.
	 * @throws {Error} - Access denied (e.g., no write permission)
	 */
	async access(absoluteURI, level = "r", context = new AuthContext()) {
		try {
			switch (level) {
				case 'r':
					await access(absoluteURI, constants.R_OK)
					break
				case 'w':
					await access(absoluteURI, constants.W_OK)
					break
				case 'd':
					await access(absoluteURI, constants.R_OK | constants.W_OK)
					break
				default:
					throw new Error(`Unsupported access level: ${level}`)
			}
			return true
		} catch (error) {
			throw new Error(`Access denied to ${absoluteURI} (level: ${level})`)
		}
		return false
	}

	/**
	 * Reads document from file with automatic format handling.
	 * @param {string} absoluteURI - File URI
	 * @param {any} [defaultValue] - Default if not found
	 * @returns {Promise<any>}
	 */
	async read(absoluteURI, defaultValue = undefined) {
		try {
			const ext = extname(absoluteURI)
			return load(absoluteURI, { format: ext, softError: true }) || defaultValue
		} catch (error) {
			if (this.driver) {
				return await this.driver.read(absoluteURI, defaultValue)
			}
			return defaultValue
		}
	}

	/**
	 * Ensures directory exists.
	 * @param {string} dirPath
	 * @throws {Error}
	 */
	async ensureDir(dirPath) {
		await mkdir(dirPath, { recursive: true })
	}

	/**
	 * Writes document to file with automatic format handling.
	 * @param {string} absoluteURI - File URI
	 * @param {any} document - Document to write
	 * @returns {Promise<boolean | void>} - TRUE on success, FALSE on failure, undefined if not realized.
	 */
	async write(absoluteURI, document) {
		try {
			await this.ensureDir(dirname(absoluteURI))
			save(absoluteURI, document)
			return true
		} catch (/** @type {any} */ err) {
			if (this.driver) {
				const result = await this.driver.write(absoluteURI, document)
				if (undefined !== result) {
					return result
				}
			}
			throw new Error(`Failed to write document to ${absoluteURI}: ${err.message}`)
		}
	}

	/**
	 * Appends data to a file.
	 * @param {string} absoluteURI - File URI
	 * @param {string} chunk - Data to append
	 * @returns {Promise<boolean | void>} - TRUE on success, FALSE on failure, undefined if not realized.
	 */
	async append(absoluteURI, chunk) {
		try {
			await this.ensureDir(dirname(absoluteURI))
			await appendFile(absoluteURI, chunk, 'utf8')
			return true
		} catch (/** @type {any} */ err) {
			if (this.driver) {
				const result = await this.driver.append(absoluteURI, chunk)
				if (undefined !== result) return result
			}
			throw new Error(`Failed to append data to ${absoluteURI}: ${err.message}`)
		}
	}

	/**
	 * Deletes a file.
	 * @param {string} absoluteURI - File URI
	 * @returns {Promise<boolean | void>}
	 */
	async delete(absoluteURI) {
		try {
			await unlink(absoluteURI)
			return true
		} catch (/** @type {any} */ err) {
			if (err.code !== 'ENOENT') {
				throw new Error(`Failed to delete document at ${absoluteURI}: ${err.message}`)
			}
		}
		return false
	}

	/**
	 * Gets file statistics.
	 * @param {string} absoluteURI - File URI
	 * @returns {Promise<DocumentStat>}
	 */
	async stat(absoluteURI) {
		try {
			const stats = await stat(absoluteURI)
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
		} catch {
			if (this.driver) {
				const result = await this.driver.stat(absoluteURI)
				if (result) {
					return result
				}
			}
			return new DocumentStat()
		}
	}

	/**
	 * Lists directory contents.
	 * @param {string} absoluteURI - Directory URI
	 * @returns {Promise<Array<string>>}
	 */
	async listDir(absoluteURI) {
		try {
			const entries = await readdir(absoluteURI, { withFileTypes: true })
			return entries.map(entry => entry.name)
		} catch {
			if (this.driver) {
				return await this.driver.listDir(absoluteURI)
			}
			return []
		}
	}

	/**
	 * @param {any} input
	 * @returns {FSDriver}
	 */
	static from(input) {
		if (input instanceof FSDriver) return input
		return new FSDriver(input)
	}
}
