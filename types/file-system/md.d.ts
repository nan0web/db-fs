/**
 * Loads a Markdown file with optional YAML frontmatter.
 * Everything between the first pair of `---` lines is parsed as YAML metadata.
 * Everything after the closing `---` becomes the `content` field.
 *
 * Returns a flat object: { ...metadata, content }.
 * If no frontmatter is found, returns { content: rawText }.
 *
 * @param {string} file - Path to .md file.
 * @param {boolean} [softError=false] - Return null instead of throwing on error.
 * @returns {object|null} Parsed document with metadata + content.
 */
export function loadMD(file: string, softError?: boolean): object | null;
/**
 * Saves data as Markdown with YAML frontmatter.
 * The `content` field becomes the Markdown body.
 * All other fields become YAML frontmatter.
 *
 * @param {string} file - Path to save .md file.
 * @param {object} data - Object with metadata fields and `content` string.
 * @returns {string} Written file content.
 */
export function saveMD(file: string, data: object): string;
/**
 * Parse raw Markdown string with optional YAML frontmatter.
 * @param {string} raw - Raw Markdown text.
 * @returns {object} { ...metadata, content }
 */
export function parseMD(raw: string): object;
