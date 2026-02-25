import fs from 'node:fs'
import YAML from 'yaml'

const FRONTMATTER_SEPARATOR = '---'

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
function loadMD(file, softError = false) {
	try {
		const raw = fs.readFileSync(file, 'utf-8')
		return parseMD(raw)
	} catch (err) {
		if (!softError) throw err
		return null
	}
}

/**
 * Parse raw Markdown string with optional YAML frontmatter.
 * @param {string} raw - Raw Markdown text.
 * @returns {object} { ...metadata, content }
 */
function parseMD(raw) {
	const trimmed = raw.trimStart()
	if (!trimmed.startsWith(FRONTMATTER_SEPARATOR)) {
		return { content: raw }
	}

	// Find closing ---
	const afterFirst = trimmed.indexOf('\n') + 1
	const closingIndex = trimmed.indexOf('\n' + FRONTMATTER_SEPARATOR, afterFirst)

	if (closingIndex < 0) {
		return { content: raw }
	}

	const yamlBlock = trimmed.slice(afterFirst, closingIndex)
	const contentStart = closingIndex + 1 + FRONTMATTER_SEPARATOR.length
	const content = trimmed.slice(contentStart).replace(/^\n+/, '')

	const metadata = YAML.parse(yamlBlock) || {}

	return { ...metadata, content }
}

/**
 * Saves data as Markdown with YAML frontmatter.
 * The `content` field becomes the Markdown body.
 * All other fields become YAML frontmatter.
 *
 * @param {string} file - Path to save .md file.
 * @param {object} data - Object with metadata fields and `content` string.
 * @returns {string} Written file content.
 */
function saveMD(file, data) {
	// Plain string → write as-is (no frontmatter)
	if ('string' === typeof data || data instanceof Buffer) {
		const text = String(data)
		fs.writeFileSync(file, text, 'utf-8')
		return text
	}
	const { content = '', ...metadata } = data
	let output = ''

	const hasMetadata = Object.keys(metadata).length > 0
	if (hasMetadata) {
		output += FRONTMATTER_SEPARATOR + '\n'
		output += YAML.stringify(metadata).trimEnd() + '\n'
		output += FRONTMATTER_SEPARATOR + '\n'
	}

	output += content

	fs.writeFileSync(file, output, 'utf-8')
	return output
}

export { loadMD, saveMD, parseMD }
