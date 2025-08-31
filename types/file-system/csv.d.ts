/**
 * Loads and parses CSV file into array of objects.
 * @function
 * @param {string} filePath - Path to CSV file.
 * @param {string} [delimiter=','] - Field delimiter.
 * @param {string} [quote='"'] - Quote character.
 * @param {boolean} [softError=false] - Suppress errors.
 * @returns {Object[]} Array of objects representing CSV rows.
 * @throws {Error} If file not found or parsing fails.
 */
export function loadCSV(filePath: string, delimiter?: string | undefined, quote?: string | undefined, softError?: boolean | undefined): any[];
/**
 * Saves data as CSV file.
 * @function
 * @param {string} filePath - Path to save CSV.
 * @param {Object[]} data - Array of objects to save.
 * @param {string} [delimiter=','] - Field delimiter.
 * @param {string} [quote='"'] - Quote character.
 * @param {string} [eol='\n'] - End of line character.
 * @returns {string} The file content.
 */
export function saveCSV(filePath: string, data: any[], delimiter?: string | undefined, quote?: string | undefined, eol?: string | undefined): string;
/**
 * Parses CSV content into 2D array.
 * @function
 * @param {string} content - CSV content.
 * @param {string} [delimiter=','] - Field delimiter.
 * @param {string} [quote='"'] - Quote character.
 * @returns {Array[]} 2D array of parsed CSV data.
 */
export function parseCSV(content: string, delimiter?: string | undefined, quote?: string | undefined): any[][];
