/**
 * Loads a Markdown file with optional YAML frontmatter.
 */
export function loadMD(file: any, softError?: boolean): any;
/**
 * Saves data as Markdown with YAML frontmatter.
 */
export function saveMD(file: any, data: any): any;
/**
 * Parse raw Markdown string with optional YAML frontmatter.
 */
export function parseMD(raw: any): any;
/**
 * Loads a Markdown file asynchronously.
 */
export function loadMDAsync(file: any, softError?: boolean): Promise<any>;
/**
 * Saves data as Markdown asynchronously.
 */
export function saveMDAsync(file: any, data: any): Promise<any>;
