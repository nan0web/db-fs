import fs from "node:fs"
import YAML from "yaml"

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
		const content = fs.readFileSync(file, { encoding: "utf-8" })
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
	fs.writeFileSync(file, yaml, { encoding: "utf-8" })
	return yaml
}

export { loadYAML, saveYAML }