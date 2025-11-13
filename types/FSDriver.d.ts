/**
 * File System Driver for Node.js environments.
 * Provides persistent storage using fs/promises with automatic format handling.
 */
export default class FSDriver extends DBDriverProtocol {
    /**
     * @param {any} input
     * @returns {FSDriver}
     */
    static from(input: any): FSDriver;
    /**
     * Connects to the file system.
     * @returns {Promise<void>}
     * @throws {Error} - If root directory is inaccessible
     */
    connect(): Promise<void>;
    connected: boolean | undefined;
    /**
     * Ensures access to the resource.
     * @param {string} absoluteURI - URI path
     * @param {'r'|'w'|'d'} [level="r"]
     * @param {AuthContext} [context=new AuthContext()]
     * @returns {Promise<boolean | void>} - TRUE if allowed, FALSE if denied, undefined if not realized.
     * @throws {Error} - Access denied (e.g., no write permission)
     */
    access(absoluteURI: string, level?: "r" | "w" | "d" | undefined, context?: AuthContext | undefined): Promise<boolean | void>;
    /**
     * Ensures directory exists.
     * @param {string} dirPath
     * @throws {Error}
     */
    ensureDir(dirPath: string): Promise<void>;
    /**
     * Gets file statistics.
     * @param {string} absoluteURI - File URI
     * @returns {Promise<DocumentStat>}
     */
    stat(absoluteURI: string): Promise<DocumentStat>;
}
import { DBDriverProtocol } from '@nan0web/db';
import { AuthContext } from '@nan0web/db';
import { DocumentStat } from '@nan0web/db';
