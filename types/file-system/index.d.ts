/**
 * Saves data to file based on extension.
 */
export function save(file: any, data: any, ...args: any[]): any;
/**
 * Loads file content based on extension.
 */
export function load(file: any, opts?: {}): any;
/**
 * Saves data asynchronously to file based on extension.
 */
export function saveAsync(file: any, data: any, ...args: any[]): Promise<any>;
/**
 * Loads file content asynchronously based on extension.
 */
export function loadAsync(file: any, opts?: {}): Promise<any>;
import { saveCSV } from './csv.js';
import { loadCSV } from './csv.js';
import { loadCSVAsync } from './csv.js';
import { saveCSVAsync } from './csv.js';
import { saveJSON } from './json.js';
import { loadJSON } from './json.js';
import { loadJSONAsync } from './json.js';
import { saveJSONAsync } from './json.js';
import { saveTXT } from './txt.js';
import { loadTXT } from './txt.js';
import { loadTXTAsync } from './txt.js';
import { saveTXTAsync } from './txt.js';
import { saveYAML } from './yaml.js';
import { loadYAML } from './yaml.js';
import { loadYAMLAsync } from './yaml.js';
import { saveYAMLAsync } from './yaml.js';
import { loadMD } from './md.js';
import { saveMD } from './md.js';
import { loadMDAsync } from './md.js';
import { saveMDAsync } from './md.js';
import { loadNAN } from './nan.js';
import { saveNAN } from './nan.js';
import { loadNANAsync } from './nan.js';
import { saveNANAsync } from './nan.js';
export { saveCSV, loadCSV, loadCSVAsync, saveCSVAsync, saveJSON, loadJSON, loadJSONAsync, saveJSONAsync, saveTXT, loadTXT, loadTXTAsync, saveTXTAsync, saveYAML, loadYAML, loadYAMLAsync, saveYAMLAsync, loadMD, saveMD, loadMDAsync, saveMDAsync, loadNAN, saveNAN, loadNANAsync, saveNANAsync };
