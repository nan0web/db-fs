import { extname } from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { loadJSON, saveJSON, loadJSONAsync, saveJSONAsync } from './json.js'
import { loadCSV, saveCSV, loadCSVAsync, saveCSVAsync } from './csv.js'
import { loadTXT, saveTXT, loadTXTAsync, saveTXTAsync } from './txt.js'
import { loadYAML, saveYAML, loadYAMLAsync, saveYAMLAsync } from './yaml.js'
import { loadMD, saveMD, loadMDAsync, saveMDAsync } from './md.js'
import { loadNAN, saveNAN, loadNANAsync, saveNANAsync } from './nan.js'

/**
 * Loads file content based on extension.
 */
function load(file, opts = {}) {
	const ext = extname(file)
	const {
		format = ext,
		delimiter = '.tsv' === ext
			? '\t'
			: '.csv' === ext
				? ','
				: '.txt' === ext
					? ''
					: '.jsonl' === ext
						? '\n'
						: '|',
		quote = '"',
		softError = false,
	} = opts

	if (['.json'].includes(format)) return loadJSON(file, softError)
	if (['.jsonl'].includes(format)) {
		const rows = loadTXT(file, delimiter, softError)
		return Array.from(rows)
			.filter(Boolean)
			.map((r) => JSON.parse(r))
	}
	if (['.yaml', '.yml'].includes(ext)) return loadYAML(file, softError)
	if (['.nan', '.nan0', '.nano'].includes(ext)) return loadNAN(file, softError)
	if (['.csv', '.tsv'].includes(format)) return loadCSV(file, delimiter, quote, softError)
	if (['.txt'].includes(ext)) return loadTXT(file, delimiter, softError)
	if (['.md'].includes(ext)) return loadMD(file, softError)

	return fs.readFileSync(file, 'utf8')
}

/**
 * Loads file content asynchronously based on extension.
 */
async function loadAsync(file, opts = {}) {
	const ext = extname(file)
	const {
		format = ext,
		delimiter = '.tsv' === ext
			? '\t'
			: '.csv' === ext
				? ','
				: '.txt' === ext
					? ''
					: '.jsonl' === ext
						? '\n'
						: '|',
		quote = '"',
		softError = false,
	} = opts

	if (['.json'].includes(format)) return await loadJSONAsync(file, softError)
	if (['.jsonl'].includes(format)) {
		const rows = await loadTXTAsync(file, delimiter, softError)
		return Array.from(rows)
			.filter(Boolean)
			.map((r) => JSON.parse(r))
	}
	if (['.yaml', '.yml'].includes(ext)) return await loadYAMLAsync(file, softError)
	if (['.nan', '.nan0', '.nano'].includes(ext)) return await loadNANAsync(file, softError)
	if (['.csv', '.tsv'].includes(format))
		return await loadCSVAsync(file, delimiter, quote, softError)
	if (['.txt'].includes(ext)) return await loadTXTAsync(file, delimiter, softError)
	if (['.md'].includes(ext)) return await loadMDAsync(file, softError)

	return await fsp.readFile(file, 'utf8')
}

/**
 * Saves data to file based on extension.
 */
function save(file, data, ...args) {
	const ext = extname(file)
	if (['.yaml', '.yml'].includes(ext)) return saveYAML(file, data)
	if (['.nan', '.nan0', '.nano'].includes(ext)) return saveNAN(file, data)
	if (['.json'].includes(ext)) return saveJSON(file, data, args[0] ?? null, args[1] ?? 2)
	if (['.jsonl'].includes(ext)) {
		const lines = Array.from(data).map((el) => JSON.stringify(el) + '\n')
		return saveTXT(file, lines.join(''))
	}
	if (['.csv', '.tsv'].includes(ext)) {
		const delim = ext === '.tsv' ? '\t' : ','
		return saveCSV(file, data, delim, '"', '\n')
	}
	if (['.txt'].includes(ext)) return saveTXT(file, data, ...args)
	if (['.md'].includes(ext)) return saveMD(file, data)

	const content = 'string' === typeof data ? data : JSON.stringify(data)
	fs.writeFileSync(file, content, 'utf8')
	return content
}

/**
 * Saves data asynchronously to file based on extension.
 */
async function saveAsync(file, data, ...args) {
	const ext = extname(file)
	if (['.yaml', '.yml'].includes(ext)) return await saveYAMLAsync(file, data)
	if (['.nan', '.nan0', '.nano'].includes(ext)) return await saveNANAsync(file, data)
	if (['.json'].includes(ext)) return await saveJSONAsync(file, data, args[0] ?? null, args[1] ?? 2)
	if (['.jsonl'].includes(ext)) {
		const lines = Array.from(data).map((el) => JSON.stringify(el) + '\n')
		return await saveTXTAsync(file, lines.join(''))
	}
	if (['.csv', '.tsv'].includes(ext)) {
		const delim = ext === '.tsv' ? '\t' : ','
		return await saveCSVAsync(file, data, delim, '"', '\n')
	}
	if (['.txt'].includes(ext)) return await saveTXTAsync(file, data, ...args)
	if (['.md'].includes(ext)) return await saveMDAsync(file, data)

	const content = 'string' === typeof data ? data : JSON.stringify(data)
	await fsp.writeFile(file, content, 'utf8')
	return content
}

export {
	save,
	load,
	saveAsync,
	loadAsync,
	saveCSV,
	loadCSV,
	loadCSVAsync,
	saveCSVAsync,
	saveJSON,
	loadJSON,
	loadJSONAsync,
	saveJSONAsync,
	saveTXT,
	loadTXT,
	loadTXTAsync,
	saveTXTAsync,
	saveYAML,
	loadYAML,
	loadYAMLAsync,
	saveYAMLAsync,
	loadMD,
	saveMD,
	loadMDAsync,
	saveMDAsync,
	loadNAN,
	saveNAN,
	loadNANAsync,
	saveNANAsync,
}
