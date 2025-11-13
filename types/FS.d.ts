/**
 * File System Database extension of DB with FSDriver.
 * @class
 * @extends DB
 */
export default class FS extends DB {
    static Driver: typeof FSDriver;
}
import DB from "@nan0web/db";
import FSDriver from "./FSDriver.js";
