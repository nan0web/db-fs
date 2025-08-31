import fs from 'node:fs'

/**
 * Loads text file, optionally splitting by delimiter.
 * @function
 * @param {string} txtFile - Path to text file.
 * @param {string} [delimiter="\n"] - Delimiter to split content.
 * @param {boolean} [softError=false] - Suppress errors.
 * @returns {string|string[]} File content as string or array.
 */
const loadTXT = (txtFile, delimiter = "\n", softError = false) => {
	try {
		const text = fs.readFileSync(txtFile, { encoding: 'utf-8' })
		if (!delimiter) return text
		return text.toString().split(delimiter)
	} catch (err) {
		if (!softError) throw err
		return delimiter ? [] : ""
	}
}

/**
 * Saves data to text file.
 * @function
 * @param {string} txtFile - Path to save file.
 * @param {string|string[]} [data=[]] - Data to save.
 * @param {string} [delimiter="\n"] - Delimiter to join array.
 * @returns {string} Empty string if failed, otherwise file content.
 */
const saveTXT = (txtFile, data = [], delimiter = "\n") => {
	const textContent = Array.isArray(data) ? data.join(delimiter) : `${data}`
	fs.writeFileSync(txtFile, textContent, 'utf8')
	if (!fs.existsSync(txtFile)) return ""
	return textContent
}

export {
	loadTXT,
	saveTXT,
}
