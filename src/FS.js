import { resolve, relative, sep, extname } from "node:path"
import { appendFileSync, existsSync, mkdirSync, statSync, readdirSync, unlinkSync, rmdirSync, readFileSync, writeFileSync } from "node:fs"
import { load, loadTXT, save } from "./file-system/index.js"

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
	 * Appends data to a file.
	 * @function
	 * @param {string} path - File path.
	 * @param {string} data - Data to append.
	 * @param {object} [options] - Write options.
	 * @returns {void}
	 */
	static appendFileSync(path, data, options) {
		appendFileSync(path, data, options)
	}

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
	 * @param {object} [options] - Creation options.
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

	/**
	 * Writes data to file.
	 * @function
	 * @param {string} path - File path.
	 * @param {string} data - Data to write.
	 * @param {object} [options] - Write options.
	 * @returns {void}
	 */
	static writeFileSync(path, data, options) {
		writeFileSync(path, data, options)
	}
}
