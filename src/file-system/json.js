import fs from "node:fs"

/**
 * Loads and parses JSON file.
 * @function
 * @param {string} file - Path to JSON file.
 * @param {boolean} [softError=false] - Suppress errors.
 * @returns {*} Parsed JSON content.
 * @throws {Error} If parsing fails and softError is false.
 */
function loadJSON(file, softError = false) {
	try {
		const content = fs.readFileSync(file, { encoding: 'utf-8' })
		return fromJSON(content)
	} catch (err) {
		if (!softError) throw err
		return null
	}
}

/**
 * Saves data as JSON file.
 * @function
 * @param {string} file - Path to save JSON.
 * @param {*} data - Data to save.
 * @param {(number | string)[] | null} [replacer=null] - JSON.stringify replacer.
 * @param {string | number} [space=0] - JSON.stringify space.
 * @returns {string} Stringified JSON.
 */
function saveJSON(file, data, replacer = null, space = 0) {
	if ("string" === typeof data) {
		if (data.startsWith("{") && data.endsWith("}") || data.startsWith("[") && data.endsWith("]")) {
			try {
				data = JSON.parse(data)
			} catch {
				// do nothing
			}
		}
	}
	if (data instanceof Map) data = Array.from(data.entries())
	const json = toJSON(data, replacer, space)
	fs.writeFileSync(file, json, { encoding: 'utf-8' })
	return json
}

/**
 * Parses JSON string.
 * @function
 * @param {string} content - JSON string.
 * @returns {*} Parsed value.
 */
function fromJSON(content) {
	return JSON.parse(content)
}

/**
 * Converts value to JSON string.
 * @function
 * @param {*} data - Value to stringify.
 * @param {(number | string)[] | null} [replacer=null] - JSON.stringify replacer.
 * @param {string | number} [space=0] - JSON.stringify space.
 * @returns {string} JSON string.
*/
function toJSON(data, replacer = null, space = 0) {
	return JSON.stringify(data, replacer, space)
}

export { loadJSON, saveJSON, toJSON, fromJSON }
