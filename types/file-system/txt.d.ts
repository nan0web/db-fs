/**
 * Loads text file, optionally splitting by delimiter.
 * @param {string} txtFile - Path to the text file.
 * @param {string | false} [delimiter='\n'] - Delimiter to split content. Pass `false` to return raw string.
 * @param {boolean} [softError=false] - If true, returns `[]` (with delimiter) or `''` (without) on error instead of throwing.
 * @returns {string | string[]} File content as string (no delimiter) or array (with delimiter).
 */
export function loadTXT(txtFile: string, delimiter?: string | false, softError?: boolean): string | string[];
/**
 * Saves data to text file.
 * @param {string} txtFile
 * @param {string | any[]} [data]
 * @param {string} [delimiter]
 */
export function saveTXT(txtFile: string, data?: string | any[], delimiter?: string): string;
/**
 * Loads text file asynchronously.
 * @param {string} txtFile - Path to the text file.
 * @param {string | false} [delimiter='\n'] - Delimiter to split content. Pass `false` to return raw string.
 * @param {boolean} [softError=false] - If true, returns `[]` (with delimiter) or `''` (without) on error instead of throwing.
 * @returns {Promise<string | string[]>} File content as string (no delimiter) or array (with delimiter).
 */
export function loadTXTAsync(txtFile: string, delimiter?: string | false, softError?: boolean): Promise<string | string[]>;
/**
 * Saves data to text file asynchronously.
 * @param {string} txtFile
 * @param {string | any[]} [data]
 * @param {string} [delimiter]
 */
export function saveTXTAsync(txtFile: string, data?: string | any[], delimiter?: string): Promise<string>;
