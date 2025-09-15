/**
 * Loads and parses YAML file.
 * @function
 * @param {string} file - Path to YAML file.
 * @param {boolean} [softError=false] - Suppress errors.
 * @returns {*} Parsed YAML content.
 * @throws {Error} If parsing fails and softError is false.
 */
export function loadYAML(file: string, softError?: boolean | undefined): any;
/**
 * Saves data as YAML file.
 * @function
 * @param {string} file - Path to save YAML.
 * @param {*} data - Data to save.
 * @returns {string} Stringified YAML.
 */
export function saveYAML(file: string, data: any): string;
