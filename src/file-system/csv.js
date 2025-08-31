import { existsSync, readFileSync, writeFileSync } from 'node:fs'

/**
 * Loads and parses CSV file into array of objects.
 * @function
 * @param {string} filePath - Path to CSV file.
 * @param {string} [delimiter=','] - Field delimiter.
 * @param {string} [quote='"'] - Quote character.
 * @param {boolean} [softError=false] - Suppress errors.
 * @returns {Object[]} Array of objects representing CSV rows.
 * @throws {Error} If file not found or parsing fails.
 */
function loadCSV(filePath, delimiter = ',', quote = '"', softError = false) {
	if ('undefined' === typeof delimiter) delimiter = ","
	if ('undefined' === typeof quote) quote = '"'
	if (!existsSync(filePath)) {
		throw new Error(`File not found: ${filePath}`)
	}
	try {
		const content = readFileSync(filePath, { encoding: 'utf-8' })
		const all = parseCSV(content, delimiter, quote)
		const cols = all[0]; // Column headers
		const rows = all.slice(1); // Data rows
		return rows.map(row => {
			const result = {}
			row.forEach((value, i) => result[cols[i]] = decodeValue(value)); // Ensure values are decoded
			return result
		})
	} catch (err) {
		if (!softError) throw err
		return []
	}
}

/**
 * Decodes CSV cell value to appropriate type.
 * @function
 * @param {string} value - Cell value.
 * @returns {string|number} Decoded value.
 */
function decodeValue(value) {
	value = `${value}`.trim()
	// Check if the trimmed value is a number
	if (!isNaN(parseFloat(value)) && value !== '') {
		return Number(value)
	}
	return value
}

/**
 * Parses CSV content into 2D array.
 * @function
 * @param {string} content - CSV content.
 * @param {string} [delimiter=','] - Field delimiter.
 * @param {string} [quote='"'] - Quote character.
 * @returns {Array[]} 2D array of parsed CSV data.
 */
function parseCSV(content, delimiter = ',', quote = '"') {
	const rows = []
	let currentRow = []
	let currentValue = ''
	let inQuotes = false
	let currentChar = ''

	for (let i = 0; i < content.length; i++) {
		currentChar = content[i]

		if (currentChar === quote) {
			if (inQuotes && content[i + 1] === quote) {
				// Escaped quote inside quoted field
				currentValue += quote
				++i; // Skip next quote
			} else {
				inQuotes = !inQuotes
			}
		} else if (currentChar === delimiter && !inQuotes) {
			// End of a value
			currentRow.push(decodeValue(currentValue)); // Decode value
			currentValue = ''
		} else if ((currentChar === '\n' || (currentChar === '\r' && content[i + 1] === '\n')) && !inQuotes) {
			// End of a row
			if (currentChar === '\r' && content[i + 1] === '\n') {
				++i; // Skip the \n part of \r\n
			}
			currentRow.push(decodeValue(currentValue)); // Decode value
			rows.push(currentRow)
			currentRow = []
			currentValue = ''
		} else {
			currentValue += currentChar
		}
	}

	// Push the last value and row if there are any remaining
	if (currentValue) {
		currentRow.push(decodeValue(currentValue))
	}
	if (currentRow.length > 0) {
		rows.push(currentRow)
	}

	return rows
}

/**
 * Saves data as CSV file.
 * @function
 * @param {string} filePath - Path to save CSV.
 * @param {Object[]} data - Array of objects to save.
 * @param {string} [delimiter=','] - Field delimiter.
 * @param {string} [quote='"'] - Quote character.
 * @param {string} [eol='\n'] - End of line character.
 * @returns {string} The file content.
 */
function saveCSV(filePath, data, delimiter = ',', quote = '"', eol = '\n') {
	const escapeCell = (cell) => {
		if (typeof cell === 'string' && (cell.includes(delimiter) || cell.includes(quote) || cell.includes(eol))) {
			cell = cell.replace(new RegExp(quote, 'g'), `${quote}${quote}`)
			return `${quote}${cell}${quote}`
		}
		return cell
	}

	const csv = []
	data.forEach((row, i) => {
		if (0 === i) {
			csv.push(Object.keys(row).map(escapeCell).join(delimiter))
		}
		csv.push(Object.values(row).map(escapeCell).join(delimiter))
	})

	const text = csv.join(eol)
	writeFileSync(filePath, text, 'utf8')
	return text
}

export { loadCSV, saveCSV, parseCSV }
