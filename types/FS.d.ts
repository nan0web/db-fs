/**
 * File System utility class providing synchronous file operations.
 * @class
 */
export default class FS {
    /**
     * Path separator for the current platform.
     * @type {string}
     */
    static sep: string;
    /**
     * Appends data to a file.
     * @function
     * @param {string} path - File path.
     * @param {string} data - Data to append.
     * @param {object} [options] - Write options.
     * @returns {void}
     */
    static appendFileSync(path: string, data: string, options?: object): void;
    /**
     * Checks if a file or directory exists.
     * @function
     * @param {string} path - Path to check.
     * @returns {boolean} True if exists.
     */
    static existsSync(path: string): boolean;
    /**
     * Creates directory recursively.
     * @function
     * @param {string} path - Directory path.
     * @param {object} [options] - Creation options.
     * @returns {string|undefined} Path of created directory.
     */
    static mkdirSync(path: string, options?: object): string | undefined;
    /**
     * Gets file statistics.
     * @function
     * @param {string} path - File path.
     * @param {object} [options] - Stat options.
     * @returns {import("node:fs").Stats} File statistics.
     */
    static statSync(path: string, options?: object): import("node:fs").Stats;
    /**
     * Reads directory contents.
     * @function
     * @param {string} path - Directory path.
     * @param {object} [options] - Read options.
     * @returns {import("node:fs").Dirent[]} Directory entries.
     */
    static readdirSync(path: string, options?: object): import("node:fs").Dirent[];
    /**
     * Deletes a file.
     * @function
     * @param {string} path - File path.
     * @returns {void}
     */
    static unlinkSync(path: string): void;
    /**
     * Removes empty directory.
     * @function
     * @param {string} path - Directory path.
     * @param {object} [options] - Removal options.
     * @returns {void}
     */
    static rmdirSync(path: string, options?: object): void;
    /**
     * Resolves path segments into an absolute path.
     * @function
     * @param {...string} args - Path segments.
     * @returns {string} Resolved path.
     */
    static resolve(...args: string[]): string;
    /**
     * Calculates relative path between two paths.
     * @function
     * @param {string} from - Source path.
     * @param {string} to - Target path.
     * @returns {string} Relative path.
     */
    static relative(from: string, to: string): string;
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
    static load(file: string, opts?: {
        format?: string | undefined;
        softError?: boolean | undefined;
        delimiter?: string | undefined;
        quote?: string | undefined;
    } | undefined): any;
    /**
     * Loads text file, optionally splitting by delimiter.
     * @function
     * @param {string} file - Path to text file.
     * @param {string} [delimiter="\n"] - Delimiter to split content.
     * @param {boolean} [softError=false] - Suppress errors.
     * @returns {string|string[]} File content as string or array.
     */
    static loadTXT(file: string, delimiter?: string | undefined, softError?: boolean | undefined): string | string[];
    /**
     * Saves data to file with automatic format handling.
     * @function
     * @param {string} file - File path.
     * @param {*} data - Data to save.
     * @param {...*} args - Format-specific arguments.
     * @returns {string} File content
     */
    static save(file: string, data: any, ...args: any[]): string;
    /**
     * Gets file extension.
     * @function
     * @param {string} file - File path.
     * @returns {string} File extension including dot.
     */
    static extname(file: string): string;
    /**
     * Reads entire file content.
     * @function
     * @param {string} path - File path.
     * @param {object} [options] - Read options.
     * @returns {string|Buffer} File content.
     */
    static readFileSync(path: string, options?: object): string | Buffer;
    /**
     * Writes data to file.
     * @function
     * @param {string} path - File path.
     * @param {string} data - Data to write.
     * @param {object} [options] - Write options.
     * @returns {void}
     */
    static writeFileSync(path: string, data: string, options?: object): void;
}
