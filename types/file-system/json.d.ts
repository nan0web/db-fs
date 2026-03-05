/**
 * Loads and parses JSON file.
 */
export function loadJSON(file: any, softError?: boolean): any;
/**
 * Saves data as JSON file.
 */
export function saveJSON(file: any, data: any, replacer?: null, space?: number): string;
/**
 * Parses JSON string.
 */
export function fromJSON(str: any): any;
/**
 * Stringifies data to JSON with Map support.
 */
export function toJSON(data: any, replacer?: null, space?: number): string;
/**
 * Loads and parses JSON file asynchronously.
 */
export function loadJSONAsync(file: any, softError?: boolean): Promise<any>;
/**
 * Saves data as JSON file asynchronously.
 */
export function saveJSONAsync(file: any, data: any, replacer?: null, space?: number): Promise<string>;
