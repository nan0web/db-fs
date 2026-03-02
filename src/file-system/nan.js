import NaN0 from '@nan0web/types'
import fs from 'node:fs'
import fsp from 'node:fs/promises'

/**
 * Loads content from a .nan file.
 * @param {string} file - Path to the .nan file.
 * @param {boolean} [softError=false] - Whether to suppress errors.
 * @returns {any} Parsed content.
 */
export function loadNAN(file, softError = false) {
	try {
		const content = fs.readFileSync(file, 'utf8')
		return NaN0.parse(content)
	} catch (err) {
		if (softError) return null
		throw err
	}
}

/**
 * Loads content from a .nan file asynchronously.
 * @param {string} file
 * @param {boolean} softError
 * @returns {Promise<any>}
 */
export async function loadNANAsync(file, softError = false) {
	try {
		const content = await fsp.readFile(file, 'utf8')
		return NaN0.parse(content)
	} catch (err) {
		if (softError) return null
		throw err
	}
}

/**
 * Saves data to a .nan file.
 * @param {string} file - Path to the .nan file.
 * @param {any} data - Data to save.
 * @returns {string} Saved content.
 */
export function saveNAN(file, data) {
	const content = NaN0.stringify(data)
	fs.writeFileSync(file, content, 'utf8')
	return content
}

/**
 * Saves data to a .nan file asynchronously.
 * @param {string} file
 * @param {any} data
 * @returns {Promise<string>}
 */
export async function saveNANAsync(file, data) {
	const content = NaN0.stringify(data)
	await fsp.writeFile(file, content, 'utf8')
	return content
}
