import { extname } from "node:path"
import fs from "node:fs"
import { loadJSON, saveJSON } from "./json.js"
import { loadCSV, saveCSV } from "./csv.js"
import { loadTXT, saveTXT } from "./txt.js"
import { loadYAML, saveYAML } from "./yaml.js"

/**
 * Loads file content based on extension.
 * @function
 * @param {string} file - File path.
 * @param {Object} [opts={}] - Loading options.
 * @param {String} [opts.format=extname(file)] - Suppress errors.
 * @param {boolean} [opts.softError=false] - Suppress errors.
 * @param {string} [opts.delimiter] - Delimiter for CSV/TXT.
 * @param {string} [opts.quote] - Quote character for CSV.
 * @returns {*} Parsed file content.
 */
function load(file, opts = {}) {
	const ext = extname(file)
	const {
		format = ext,
		delimiter = ".tsv" === ext ? "\t"
			: ".csv" === ext ? ","
			: ".txt" === ext ? ""
			: ".jsonl" === ext ? "\n"
			: "|",
		quote = '"',
		softError = false,
	} = opts
	if ([".json"].includes(format)) {
		return loadJSON(file, softError)
	}
	if ([".jsonl"].includes(format)) {
		const rows = loadTXT(file, delimiter, softError)
		return Array.from(rows).filter(Boolean).map(r => JSON.parse(r))
	}
	if (['.yaml', '.yml'].includes(ext)) {
		return loadYAML(file, softError)
	}
	// if (['nano'].includes(ext)) {
	// 	return loadNANO(file, softError)
	// }
	if ([".csv", ".tsv"].includes(format)) {
		return loadCSV(file, delimiter, quote, softError)
	}
	if (['.txt'].includes(ext)) {
		return loadTXT(file, delimiter, softError)
	}
	return fs.readFileSync(file, 'utf8')
}

/**
 * Saves data to file based on extension.
 * @function
 * @param {string} file - File path.
 * @param {*} data - Data to save.
 * @param {...*} args - Format-specific arguments.
 * @returns {string} File content
 */
function save(file, data, ...args) {
	const ext = extname(file)
	if (['.yaml', '.yml'].includes(ext)) {
		return saveYAML(file, data)
	}
	// if (['nano'].includes(ext)) {
	// 	return saveNANO(file, data)
	// }
	if (['.json'].includes(ext)) {
		return saveJSON(file, data, args[0] ?? null, args[1] ?? 2)
	}
	if (['.jsonl'].includes(ext)) {
		const lines = Array.from(data).map(el => JSON.stringify(el) + "\n")
		return saveTXT(file, lines.join(""))
	}
	if (['.csv'].includes(ext)) {
		return saveCSV(file, data, args[0] ?? ",", args[1] ?? '"', args[2] ?? "\n")
	}
	if (['.tsv'].includes(ext)) {
		return saveCSV(file, data, args[0] ?? "\t", args[1] ?? '"', args[2] ?? "\n")
	}
	if (['.txt'].includes(ext)) {
		return saveTXT(file, data, ...args)
	}
	if ("string" === typeof data) {
		fs.writeFileSync(file, data, 'utf8')
		return data
	}
	fs.writeFileSync(file, data)
	return data
}

export {
	save, load,
	saveCSV, loadCSV,
	saveJSON, loadJSON,
	saveTXT, loadTXT,
	saveYAML, loadYAML
}
