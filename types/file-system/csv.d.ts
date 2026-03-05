/**
 * Loads and parses CSV file into array of objects.
 */
export function loadCSV(filePath: any, delimiter?: string, quote?: string, softError?: boolean): {}[];
/**
 * Saves data as CSV file.
 */
export function saveCSV(filePath: any, data: any, delimiter?: string, quote?: string, eol?: string): string;
/**
 * Parses CSV content into 2D array.
 */
export function parseCSV(content: any, delimiter?: string, quote?: string): any[][];
/**
 * Loads and parses CSV file asynchronously.
 */
export function loadCSVAsync(filePath: any, delimiter?: string, quote?: string, softError?: boolean): Promise<{}[]>;
/**
 * Saves data as CSV file asynchronously.
 */
export function saveCSVAsync(filePath: any, data: any, delimiter?: string, quote?: string, eol?: string): Promise<string>;
