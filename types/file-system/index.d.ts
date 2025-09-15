/**
 * Saves data to file based on extension.
 * @function
 * @param {string} file - File path.
 * @param {*} data - Data to save.
 * @param {...*} args - Format-specific arguments.
 * @returns {string} File content
 */
export function save(file: string, data: any, ...args: any[]): string;
/**
 * Loads file content based on extension.
 * @function
 * @param {string} file - File path.
 * @param {Object} [opts={}] - Loading options.
 * @param {String} [opts.format=extname(file)] - Suppress errors.
 * @param {boolean} [opts.softError=false] - Suppress errors.
 * @param {string} [opts.delimiter] - Delimiter for CSV/TXT.
 * @param {string} [opts.quote] - Quote character for CSV.
 * @returns {*} Parsed file content.
 */
export function load(file: string, opts?: {
    format?: string | undefined;
    softError?: boolean | undefined;
    delimiter?: string | undefined;
    quote?: string | undefined;
} | undefined): any;
import { saveCSV } from "./csv.js";
import { loadCSV } from "./csv.js";
import { saveJSON } from "./json.js";
import { loadJSON } from "./json.js";
import { saveTXT } from "./txt.js";
import { loadTXT } from "./txt.js";
import { saveYAML } from "./yaml.js";
import { loadYAML } from "./yaml.js";
export { saveCSV, loadCSV, saveJSON, loadJSON, saveTXT, loadTXT, saveYAML, loadYAML };
