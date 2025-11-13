/**
 * Loads text file, optionally splitting by delimiter.
 * @function
 * @param {string} txtFile - Path to text file.
 * @param {string} [delimiter="\n"] - Delimiter to split content.
 * @param {boolean} [softError=false] - Suppress errors.
 * @returns {string|string[]} File content as string or array.
 */
export function loadTXT(txtFile: string, delimiter?: string | undefined, softError?: boolean | undefined): string | string[];
/**
 * Saves data to text file.
 * @function
 * @param {string} txtFile - Path to save file.
 * @param {string|string[]} [data=[]] - Data to save.
 * @param {string} [delimiter="\n"] - Delimiter to join array.
 * @returns {string} Empty string if failed, otherwise file content.
 */
export function saveTXT(txtFile: string, data?: string | string[] | undefined, delimiter?: string | undefined): string;
