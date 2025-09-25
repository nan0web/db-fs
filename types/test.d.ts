export class DBFS extends DBFSBase {
}
export default class TestDir {
    constructor(root: any);
    root: string;
    erase(): void;
    join(dir: any): string;
}
import DBFSBase from "./DBFS.js";
