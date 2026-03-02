import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import fsp from 'node:fs/promises'

/**
 * Loads and parses CSV file into array of objects.
 */
function loadCSV(filePath, delimiter = ',', quote = '"', softError = false) {
	if (!existsSync(filePath)) {
		if (softError) return []
		throw new Error(`File not found: ${filePath}`)
	}
	try {
		const content = readFileSync(filePath, { encoding: 'utf-8' })
		return parseToObjects(content, delimiter, quote)
	} catch (err) {
		if (softError) return []
		throw err
	}
}

/**
 * Loads and parses CSV file asynchronously.
 */
async function loadCSVAsync(filePath, delimiter = ',', quote = '"', softError = false) {
	try {
		const content = await fsp.readFile(filePath, 'utf-8')
		return parseToObjects(content, delimiter, quote)
	} catch (err) {
		if (softError) return []
		throw err
	}
}

/**
 * Common logic to parse CSV string into objects.
 */
function parseToObjects(content, delimiter = ',', quote = '"') {
	const all = parseCSV(content, delimiter, quote)
	if (all.length === 0) return []
	const cols = all[0]
	const rows = all.slice(1)
	return rows.map((row) => {
		const result = {}
		row.forEach((value, i) => (result[cols[i]] = decodeValue(value)))
		return result
	})
}

/**
 * Decodes CSV cell value to appropriate type.
 */
function decodeValue(value) {
	value = `${value}`.trim()
	if (value === '') return value
	if (!isNaN(parseFloat(value)) && isFinite(Number(value))) return Number(value)
	return value
}

/**
 * Parses CSV content into 2D array.
 */
function parseCSV(content, delimiter = ',', quote = '"') {
	const rows = []
	let currentRow = []
	let currentValue = ''
	let inQuotes = false

	for (let i = 0; i < content.length; i++) {
		const char = content[i]
		if (char === quote) {
			if (inQuotes && content[i + 1] === quote) {
				currentValue += quote
				i++
			} else {
				inQuotes = !inQuotes
			}
		} else if (char === delimiter && !inQuotes) {
			currentRow.push(decodeValue(currentValue))
			currentValue = ''
		} else if ((char === '\n' || (char === '\r' && content[i + 1] === '\n')) && !inQuotes) {
			if (char === '\r' && content[i + 1] === '\n') i++
			currentRow.push(decodeValue(currentValue))
			rows.push(currentRow)
			currentRow = []
			currentValue = ''
		} else {
			currentValue += char
		}
	}

	if (currentValue || content.endsWith('\n') || content.endsWith('\r')) {
		currentRow.push(decodeValue(currentValue))
	}
	if (currentRow.length > 0) rows.push(currentRow)
	return rows
}

/**
 * Saves data as CSV file.
 */
function saveCSV(filePath, data, delimiter = ',', quote = '"', eol = '\n') {
	const text = stringifyCSV(data, delimiter, quote, eol)
	writeFileSync(filePath, text, 'utf8')
	return text
}

/**
 * Saves data as CSV file asynchronously.
 */
async function saveCSVAsync(filePath, data, delimiter = ',', quote = '"', eol = '\n') {
	const text = stringifyCSV(data, delimiter, quote, eol)
	await fsp.writeFile(filePath, text, 'utf8')
	return text
}

/**
 * Internal logic for CSV stringification.
 */
function stringifyCSV(data, delimiter = ',', quote = '"', eol = '\n') {
	const escapeCell = (cell) => {
		if (typeof cell === 'string' && (cell.includes(delimiter) || cell.includes(quote) || cell.includes(eol))) {
			cell = cell.replace(new RegExp(quote, 'g'), `${quote}${quote}`)
			return `${quote}${cell}${quote}`
		}
		return cell
	}

	if (typeof data === 'string') return data
	const csv = []
	data.forEach((row, i) => {
		if (i === 0) csv.push(Object.keys(row).map(escapeCell).join(delimiter))
		csv.push(Object.values(row).map(escapeCell).join(delimiter))
	})
	return csv.join(eol)
}

export { loadCSV, saveCSV, parseCSV, loadCSVAsync, saveCSVAsync }
