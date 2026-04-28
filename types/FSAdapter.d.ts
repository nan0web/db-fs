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
    static sep: string;
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
     * @param {MakeDirectoryOptions} [options] - Creation options.
     * @returns {string|undefined} Path of created directory.
     */
    static mkdirSync(path: string, options?: MakeDirectoryOptions): string | undefined;
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
     * Return the directory name of a path. Similar to the Unix dirname command.
     *
     * @param {string} path the path to evaluate.
     * @returns {string} The directory path
     * @throws {TypeError} if `path` is not a string.
     */
    static dirname(path: string): string;
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
    }): any;
    /**
     * Loads text file, optionally splitting by delimiter.
     * @function
     * @param {string} file - Path to text file.
     * @param {string | false} [delimiter="\n"] - Delimiter to split content. Pass `false` to return raw string.
     * @param {boolean} [softError=false] - If true, returns `[]` or `''` on error instead of throwing.
     * @returns {string | string[]} File content as string or array.
     */
    static loadTXT(file: string, delimiter?: string | false, softError?: boolean): string | string[];
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
    static buildPath(path: any): void;
    /**
     * Writes data to file.
     * @function
     * @param {string} path - File path.
     * @param {string} data - Data to write.
     * @param {object} [options] - Write options.
     * @returns {void}
     */
    static writeFileSync(path: string, data: string, options?: object): void;
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
     * Loads file content based on extension.
     */
    static loadAsync(file: any, opts: any): Promise<any>;
    /**
     * Saves data to file with automatic format handling.
     */
    static saveAsync(file: any, data: any, ...args: any[]): Promise<any>;
    /**
     * Checks if a file or directory exists.
     * @param {string} path
     * @returns {Promise<boolean>}
     */
    static exists(path: string): Promise<boolean>;
    /**
     * Creates directory recursively.
     */
    static mkdir(path: any, options: any): Promise<string | undefined>;
    /**
     * Gets file statistics.
     */
    static stat(path: any, options: any): Promise<import("fs").Stats>;
    /**
     * Reads directory contents.
     */
    static readdir(path: any, options: any): Promise<string[]>;
    /**
     * Deletes a file.
     */
    static unlink(path: any): Promise<void>;
    /**
     * Removes directory.
     */
    static rmdir(path: any, options: any): Promise<void>;
    /**
     * Reads file content.
     */
    static readFile(path: any, options: any): Promise<NonSharedBuffer>;
    /**
     * Writes data to file.
     */
    static writeFile(path: any, data: any, options: any): Promise<void>;
    /**
     * Appends data to a file.
     */
    static appendFile(path: any, data: any, options: any): Promise<void>;
    static ensurePath(path: any): Promise<void>;
}
export type MakeDirectoryOptions = {
    recursive?: boolean;
    mode?: number | string;
};
