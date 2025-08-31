import { DocumentStat, DocumentEntry } from "@nan0web/db"
import DBFS from "./DBFS.js"

/**
 * @module DBFS
 * The main database filesystem class.
 */
export { DBFS, DocumentEntry, DocumentStat }

export {
	load, save, loadCSV, saveCSV, loadJSON, saveJSON, loadTXT, saveTXT
} from "./file-system/index.js"

export default DBFS
