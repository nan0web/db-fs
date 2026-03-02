import { resolve, relative, sep, extname, dirname } from 'node:path'
import {
	appendFileSync,
	existsSync,
	mkdirSync,
	statSync,
	readdirSync,
	unlinkSync,
	rmdirSync,
	rmSync,
	readFileSync,
	writeFileSync,
} from 'node:fs'
import {
	appendFile,
	mkdir,
	stat,
	readdir,
	unlink,
	rmdir,
	readFile,
	writeFile,
	access,
} from 'node:fs/promises'
import { load, loadAsync, loadTXT, save, saveAsync } from './file-system/index.js'

/** @typedef {{ recursive?: boolean, mode?: number | string }} MakeDirectoryOptions */

/**
 * File System utility class providing synchronous file operations.
 * @class
 */
export default class FS {
	/**
	 * Path separator for the current platform.
	 * @type {string}
	 */
	static sep = sep

	/**
	 * Checks if a file or directory exists.
	 * @function
	 * @param {string} path - Path to check.
	 * @returns {boolean} True if exists.
	 */
	static existsSync(path) {
		return existsSync(path)
	}

	/**
	 * Creates directory recursively.
	 * @function
	 * @param {string} path - Directory path.
	 * @param {MakeDirectoryOptions} [options] - Creation options.
	 * @returns {string|undefined} Path of created directory.
	 */
	static mkdirSync(path, options) {
		return mkdirSync(path, options)
	}

	/**
	 * Gets file statistics.
	 * @function
	 * @param {string} path - File path.
	 * @param {object} [options] - Stat options.
	 * @returns {import("node:fs").Stats} File statistics.
	 */
	static statSync(path, options) {
		return statSync(path, options)
	}

	/**
	 * Reads directory contents.
	 * @function
	 * @param {string} path - Directory path.
	 * @param {object} [options] - Read options.
	 * @returns {import("node:fs").Dirent[]} Directory entries.
	 */
	static readdirSync(path, options) {
		// @ts-ignore The Dirent[] result is also available
		return readdirSync(path, options)
	}

	/**
	 * Return the directory name of a path. Similar to the Unix dirname command.
	 *
	 * @param {string} path the path to evaluate.
	 * @returns {string} The directory path
	 * @throws {TypeError} if `path` is not a string.
	 */
	static dirname(path) {
		return dirname(path)
	}

	/**
	 * Deletes a file.
	 * @function
	 * @param {string} path - File path.
	 * @returns {void}
	 */
	static unlinkSync(path) {
		return unlinkSync(path)
	}

	/**
	 * Removes empty directory.
	 * @function
	 * @param {string} path - Directory path.
	 * @param {object} [options] - Removal options.
	 * @returns {void}
	 */
	static rmdirSync(path, options) {
		if (options?.recursive) return rmSync(path, { recursive: true, force: true })
		return rmdirSync(path, options)
	}

	/**
	 * Resolves path segments into an absolute path.
	 * @function
	 * @param {...string} args - Path segments.
	 * @returns {string} Resolved path.
	 */
	static resolve(...args) {
		return resolve(...args)
	}

	/**
	 * Calculates relative path between two paths.
	 * @function
	 * @param {string} from - Source path.
	 * @param {string} to - Target path.
	 * @returns {string} Relative path.
	 */
	static relative(from, to) {
		return relative(from, to)
	}

	/**
	 * Loads file content based on extension.
	 * @function
	 * @param {string} file - File path.
	 * @param {Object} [opts={}] - Loading options.
	 * @param {String} [opts.format=extname(file)] - File format override.
	 * @param {boolean} [opts.softError=false] - Suppress errors.
	 * @param {string} [opts.delimiter] - Delimiter for CSV/TXT.
	 * @param {string} [opts.quote] - Quote character for CSV.
	 * @returns {*} Parsed file content.
	 */
	static load(file, opts) {
		return load(file, opts)
	}

	/**
	 * Loads text file, optionally splitting by delimiter.
	 * @function
	 * @param {string} file - Path to text file.
	 * @param {string} [delimiter="\n"] - Delimiter to split content.
	 * @param {boolean} [softError=false] - Suppress errors.
	 * @returns {string|string[]} File content as string or array.
	 */
	static loadTXT(file, delimiter, softError) {
		return loadTXT(file, delimiter, softError)
	}

	/**
	 * Saves data to file with automatic format handling.
	 * @function
	 * @param {string} file - File path.
	 * @param {*} data - Data to save.
	 * @param {...*} args - Format-specific arguments.
	 * @returns {string} File content
	 */
	static save(file, data, ...args) {
		FS.buildPath(file)
		return save(file, data, ...args)
	}

	/**
	 * Gets file extension.
	 * @function
	 * @param {string} file - File path.
	 * @returns {string} File extension including dot.
	 */
	static extname(file) {
		return extname(file)
	}

	/**
	 * Reads entire file content.
	 * @function
	 * @param {string} path - File path.
	 * @param {object} [options] - Read options.
	 * @returns {string|Buffer} File content.
	 */
	static readFileSync(path, options) {
		return readFileSync(path, options)
	}

	static buildPath(path) {
		const dir = FS.dirname(path)
		if (FS.existsSync(dir)) return
		FS.mkdirSync(dir, { recursive: true })
	}

	/**
	 * Writes data to file.
	 * @function
	 * @param {string} path - File path.
	 * @param {string} data - Data to write.
	 * @param {object} [options] - Write options.
	 * @returns {void}
	 */
	static writeFileSync(path, data, options) {
		FS.buildPath(path)
		writeFileSync(path, data, options)
	}

	/**
	 * Appends data to a file.
	 * @function
	 * @param {string} path - File path.
	 * @param {string} data - Data to append.
	 * @param {object} [options] - Write options.
	 * @returns {void}
	 */
	static appendFileSync(path, data, options) {
		FS.buildPath(path)
		appendFileSync(path, data, options)
	}

	/**
	 * Loads file content based on extension.
	 */
	static async loadAsync(file, opts) {
		return await loadAsync(file, opts)
	}

	/**
	 * Saves data to file with automatic format handling.
	 */
	static async saveAsync(file, data, ...args) {
		await FS.ensurePath(file)
		return await saveAsync(file, data, ...args)
	}

	// --- ASYNC METHODS ---

	/**
	 * Checks if a file or directory exists.
	 * @param {string} path
	 * @returns {Promise<boolean>}
	 */
	static async exists(path) {
		try {
			await access(path)
			return true
		} catch {
			return false
		}
	}

	/**
	 * Creates directory recursively.
	 */
	static async mkdir(path, options) {
		return await mkdir(path, options)
	}

	/**
	 * Gets file statistics.
	 */
	static async stat(path, options) {
		return await stat(path, options)
	}

	/**
	 * Reads directory contents.
	 */
	static async readdir(path, options) {
		return await readdir(path, options)
	}

	/**
	 * Deletes a file.
	 */
	static async unlink(path) {
		return await unlink(path)
	}

	/**
	 * Removes directory.
	 */
	static async rmdir(path, options) {
		if (options?.recursive) {
			// node:fs/promises rm doesn't exist in all node versions as such, but rmdir with recursive is deprecated.
			// however, we use it for now as it's common.
			const { rm } = await import('node:fs/promises')
			return await rm(path, { recursive: true, force: true })
		}
		return await rmdir(path, options)
	}

	/**
	 * Reads file content.
	 */
	static async readFile(path, options) {
		return await readFile(path, options)
	}

	/**
	 * Writes data to file.
	 */
	static async writeFile(path, data, options) {
		await FS.ensurePath(path)
		return await writeFile(path, data, options)
	}

	/**
	 * Appends data to a file.
	 */
	static async appendFile(path, data, options) {
		await FS.ensurePath(path)
		return await appendFile(path, data, options)
	}

	static async ensurePath(path) {
		const dir = FS.dirname(path)
		if (await FS.exists(dir)) return
		await FS.mkdir(dir, { recursive: true })
	}
}
