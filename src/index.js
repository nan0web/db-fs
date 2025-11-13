import DB, { DocumentStat, DocumentEntry } from "@nan0web/db"
import DBFS from "./DBFS.js"
import FSDriver from "./FSDriver.js"

/**
 * @module DBFS
 * The main database filesystem class.
 */
export {
	/** @deprecated */
	DBFS,
	DocumentEntry,
	DocumentStat,
	FSDriver
}

export {
	load, save, loadCSV, saveCSV, loadJSON, saveJSON, loadTXT, saveTXT
} from "./file-system/index.js"

export class DBwithFSDriver extends DB {
	static Driver = FSDriver
}

export default DBFS
