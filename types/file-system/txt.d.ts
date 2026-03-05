/**
 * Loads text file, optionally splitting by delimiter.
 */
export function loadTXT(txtFile: any, delimiter?: string, softError?: boolean): string | string[];
/**
 * Saves data to text file.
 * @param {string} txtFile
 * @param {string | any[]} [data]
 * @param {string} [delimiter]
 */
export function saveTXT(txtFile: string, data?: string | any[], delimiter?: string): string;
/**
 * Loads text file asynchronously.
 */
export function loadTXTAsync(txtFile: any, delimiter?: string, softError?: boolean): Promise<string | string[]>;
/**
 * Saves data to text file asynchronously.
 * @param {string} txtFile
 * @param {string | any[]} [data]
 * @param {string} [delimiter]
 */
export function saveTXTAsync(txtFile: string, data?: string | any[], delimiter?: string): Promise<string>;
