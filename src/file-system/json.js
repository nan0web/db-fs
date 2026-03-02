import fs from 'node:fs'
import fsp from 'node:fs/promises'

/**
 * Parses JSON string.
 */
function fromJSON(str) {
	return JSON.parse(str)
}

/**
 * Loads and parses JSON file.
 */
function loadJSON(file, softError = false) {
	try {
		const content = fs.readFileSync(file, 'utf8')
		return fromJSON(content)
	} catch (err) {
		if (softError) return null
		throw err
	}
}

/**
 * Loads and parses JSON file asynchronously.
 */
async function loadJSONAsync(file, softError = false) {
	try {
		const content = await fsp.readFile(file, 'utf8')
		return fromJSON(content)
	} catch (err) {
		if (softError) return null
		throw err
	}
}

/**
 * Stringifies data to JSON with Map support.
 */
function toJSON(data, replacer = null, space = 0) {
	if (data instanceof Map) {
		return JSON.stringify(Array.from(data.entries()), replacer, space)
	}
	return JSON.stringify(data, replacer, space)
}

/**
 * Saves data as JSON file.
 */
function saveJSON(file, data, replacer = null, space = 0) {
	let content = ''
	if (typeof data === 'string') {
		if ((data.startsWith('{') && data.endsWith('}')) || (data.startsWith('[') && data.endsWith(']'))) {
			content = data
		} else {
			content = toJSON(data, replacer, space)
		}
	} else {
		content = toJSON(data, replacer, space)
	}
	fs.writeFileSync(file, content, 'utf8')
	return content
}

/**
 * Saves data as JSON file asynchronously.
 */
async function saveJSONAsync(file, data, replacer = null, space = 0) {
	let content = ''
	if (typeof data === 'string') {
		if ((data.startsWith('{') && data.endsWith('}')) || (data.startsWith('[') && data.endsWith(']'))) {
			content = data
		} else {
			content = toJSON(data, replacer, space)
		}
	} else {
		content = toJSON(data, replacer, space)
	}
	await fsp.writeFile(file, content, 'utf8')
	return content
}

export { loadJSON, saveJSON, fromJSON, toJSON, loadJSONAsync, saveJSONAsync }
