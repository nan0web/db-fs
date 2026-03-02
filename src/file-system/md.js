import fs from 'node:fs'
import fsp from 'node:fs/promises'
import YAML from 'yaml'

const FRONTMATTER_SEPARATOR = '---'

/**
 * Loads a Markdown file with optional YAML frontmatter.
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
 * Loads a Markdown file asynchronously.
 */
async function loadMDAsync(file, softError = false) {
	try {
		const raw = await fsp.readFile(file, 'utf-8')
		return parseMD(raw)
	} catch (err) {
		if (!softError) throw err
		return null
	}
}

/**
 * Parse raw Markdown string with optional YAML frontmatter.
 */
function parseMD(raw) {
	const trimmed = raw.trimStart()
	if (!trimmed.startsWith(FRONTMATTER_SEPARATOR)) {
		return { content: raw }
	}

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
 */
function saveMD(file, data) {
	if ('string' === typeof data || data instanceof Buffer) {
		const text = String(data)
		fs.writeFileSync(file, text, 'utf-8')
		return text
	}
	const { content = '', ...metadata } = data
	const hasMetadata = Object.keys(metadata).length > 0
	let output = hasMetadata
		? [FRONTMATTER_SEPARATOR, YAML.stringify(metadata).trimEnd(), FRONTMATTER_SEPARATOR, content].join('\n')
		: content

	fs.writeFileSync(file, output, 'utf-8')
	return output
}

/**
 * Saves data as Markdown asynchronously.
 */
async function saveMDAsync(file, data) {
	if ('string' === typeof data || data instanceof Buffer) {
		const text = String(data)
		await fsp.writeFile(file, text, 'utf-8')
		return text
	}
	const { content = '', ...metadata } = data
	const hasMetadata = Object.keys(metadata).length > 0
	const output = hasMetadata
		? [FRONTMATTER_SEPARATOR, YAML.stringify(metadata).trimEnd(), FRONTMATTER_SEPARATOR, content].join('\n')
		: content

	await fsp.writeFile(file, output, 'utf-8')
	return output
}

export { loadMD, saveMD, parseMD, loadMDAsync, saveMDAsync }
