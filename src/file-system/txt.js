import fs from 'node:fs'
import fsp from 'node:fs/promises'

/**
 * Loads text file, optionally splitting by delimiter.
 */
const loadTXT = (txtFile, delimiter = '\n', softError = false) => {
	try {
		const text = fs.readFileSync(txtFile, { encoding: 'utf-8' })
		if (!delimiter) return text
		return text.split(delimiter)
	} catch (err) {
		if (!softError) throw err
		return delimiter ? [] : ''
	}
}

/**
 * Loads text file asynchronously.
 */
const loadTXTAsync = async (txtFile, delimiter = '\n', softError = false) => {
	try {
		const text = await fsp.readFile(txtFile, 'utf-8')
		if (!delimiter) return text
		return text.split(delimiter)
	} catch (err) {
		if (!softError) throw err
		return delimiter ? [] : ''
	}
}

/**
 * Saves data to text file.
 * @param {string} txtFile
 * @param {string | any[]} [data]
 * @param {string} [delimiter]
 */
const saveTXT = (txtFile, data = [], delimiter = '\n') => {
	const textContent = Array.isArray(data) ? data.join(delimiter) : `${data}`
	fs.writeFileSync(txtFile, textContent, 'utf8')
	return textContent
}

/**
 * Saves data to text file asynchronously.
 * @param {string} txtFile
 * @param {string | any[]} [data]
 * @param {string} [delimiter]
 */
const saveTXTAsync = async (txtFile, data = [], delimiter = '\n') => {
	const textContent = Array.isArray(data) ? data.join(delimiter) : `${data}`
	await fsp.writeFile(txtFile, textContent, 'utf8')
	return textContent
}

export { loadTXT, saveTXT, loadTXTAsync, saveTXTAsync }
