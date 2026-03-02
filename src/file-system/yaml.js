import fs from 'node:fs'
import fsp from 'node:fs/promises'
import YAML from 'yaml'

/**
 * Loads and parses YAML file.
 * @function
 * @param {string} file - Path to YAML file.
 * @param {boolean} [softError=false] - Suppress errors.
 * @returns {*} Parsed YAML content.
 * @throws {Error} If parsing fails and softError is false.
 */
function loadYAML(file, softError = false) {
	try {
		const content = fs.readFileSync(file, { encoding: 'utf-8' })
		return YAML.parse(content)
	} catch (err) {
		if (!softError) throw err
		return null
	}
}

/**
 * Loads and parses YAML file asynchronously.
 * @param {string} file
 * @param {boolean} softError
 * @returns {Promise<any>}
 */
async function loadYAMLAsync(file, softError = false) {
	try {
		const content = await fsp.readFile(file, { encoding: 'utf-8' })
		return YAML.parse(content)
	} catch (err) {
		if (!softError) throw err
		return null
	}
}

/**
 * Saves data as YAML file.
 * @function
 * @param {string} file - Path to save YAML.
 * @param {*} data - Data to save.
 * @returns {string} Stringified YAML.
 */
function saveYAML(file, data) {
	const yaml = YAML.stringify(data)
	fs.writeFileSync(file, yaml, { encoding: 'utf-8' })
	return yaml
}

/**
 * Saves data as YAML file asynchronously.
 * @param {string} file
 * @param {any} data
 * @returns {Promise<string>}
 */
async function saveYAMLAsync(file, data) {
	const yaml = YAML.stringify(data)
	await fsp.writeFile(file, yaml, { encoding: 'utf-8' })
	return yaml
}

export { loadYAML, saveYAML, loadYAMLAsync, saveYAMLAsync }
