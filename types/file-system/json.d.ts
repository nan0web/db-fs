/**
 * Loads and parses JSON file.
 * @function
 * @param {string} file - Path to JSON file.
 * @param {boolean} [softError=false] - Suppress errors.
 * @returns {*} Parsed JSON content.
 * @throws {Error} If parsing fails and softError is false.
 */
export function loadJSON(file: string, softError?: boolean | undefined): any;
/**
 * Saves data as JSON file.
 * @function
 * @param {string} file - Path to save JSON.
 * @param {*} data - Data to save.
 * @param {(number | string)[] | null} [replacer=null] - JSON.stringify replacer.
 * @param {string | number} [space=0] - JSON.stringify space.
 * @returns {string} Stringified JSON.
 */
export function saveJSON(file: string, data: any, replacer?: (string | number)[] | null | undefined, space?: string | number | undefined): string;
/**
 * Converts value to JSON string.
 * @function
 * @param {*} data - Value to stringify.
 * @param {(number | string)[] | null} [replacer=null] - JSON.stringify replacer.
 * @param {string | number} [space=0] - JSON.stringify space.
 * @returns {string} JSON string.
*/
export function toJSON(data: any, replacer?: (string | number)[] | null | undefined, space?: string | number | undefined): string;
/**
 * Parses JSON string.
 * @function
 * @param {string} content - JSON string.
 * @returns {*} Parsed value.
 */
export function fromJSON(content: string): any;
