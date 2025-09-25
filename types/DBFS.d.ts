export default DBFS;
declare class DBFS extends DB {
    static FS: typeof FS;
    /**
     * Fixes path separators for Windows systems.
     * @param {string} path The path to fix.
     * @returns {string} The path with forward slashes.
     */
    static winFix(path: string): string;
    /**
     * Creates a DocumentStat instance from fs.Stats.
     * @param {import("node:fs").Stats} stats The fs.Stats object.
     * @returns {DocumentStat} A new DocumentStat instance.
     */
    static createDocumentStatFrom(stats: import("node:fs").Stats): DocumentStat;
    /**
     * Creates a DBFS instance from input parameters.
     * @param {object} input The input parameters for DBFS.
     * @returns {DBFS} A new or existing DBFS instance.
     */
    static from(input: object): DBFS;
    /**
     * Array of loader functions that attempt to load data from a file path.
     * Each loader returns false if it cannot handle the data format.
     * @type {((file: string, data: any, ext: string) => any)[]}
     */
    loaders: ((file: string, data: any, ext: string) => any)[];
    /**
     * Array of saver functions that attempt to save data to a file path.
     * Each saver returns false if it cannot handle the data format.
     * @type {((file: string, data: any, ext: string) => any)[]}
     */
    savers: ((file: string, data: any, ext: string) => any)[];
    /**
     * @returns {typeof FS}
     */
    get FS(): typeof FS;
    /**
     * Creates a new DB instance with a subset of the data and meta.
     * @param {string} uri The URI to extract from the current DB.
     * @returns {DBFS}
     */
    extract(uri: string): DBFS;
    /**
     * Returns location for the provided uris.
     * @param  {...any} args
     * @returns {string} Absolute location on the drive.
     */
    location(...args: any[]): string;
    /**
     * Loads a document using a specific extension handler.
     * @param {string} ext The extension of the document.
     * @param {string} uri The URI to load the document from.
     * @param {any} defaultValue The default value to return if the document does not exist.
     * @returns {Promise<any>} The loaded document or the default value.
     */
    loadDocumentAs(ext: string, uri: string, defaultValue?: any): Promise<any>;
    /**
     * Ensures the directory path for a given URI exists, creating it if necessary.
     * @param {string} uri The URI to build the path for.
     * @returns {Promise<void>}
     */
    _buildPath(uri: string): Promise<void>;
    /**
     * Deletes a document or documents at the given URI(s).
     * @throws {Error} If the document cannot be dropped.
     * @param {string | string[]} uri The URI(s) of the document(s) to drop.
     * @returns {Promise<boolean | boolean[]>} True if dropped successfully, false otherwise.
     */
    drop(uri: string | string[]): Promise<boolean | boolean[]>;
    /**
     * Ensures the current operation has proper access rights.
     * @param {string} uri The URI to check access for.
     * @param {"r"|"w"|"d"} [level="r"] The access level: read, write, or delete.
     * @returns {Promise<void>} True if access is granted.
     */
    ensureAccess(uri: string, level?: "r" | "w" | "d"): Promise<void>;
    /**
     * Lists the contents of a directory.
     * @param {string} uri The directory URI to list.
     * @param {{depth?: number, skipStat?: boolean}} options Options for listing.
     * @returns {Promise<DocumentEntry[]>} The list of directory entries.
     */
    listDir(uri: string, { depth, skipStat }?: {
        depth?: number;
        skipStat?: boolean;
    }): Promise<DocumentEntry[]>;
}
import DB from "@nan0web/db";
import FS from "./FS.js";
import { DocumentEntry } from "@nan0web/db";
import { DocumentStat } from "@nan0web/db";
