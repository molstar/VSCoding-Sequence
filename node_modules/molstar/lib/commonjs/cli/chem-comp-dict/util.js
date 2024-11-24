"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDataOptions = void 0;
exports.ensureAvailable = ensureAvailable;
exports.ensureDataAvailable = ensureDataAvailable;
exports.readFileAsCollection = readFileAsCollection;
exports.readCCD = readCCD;
exports.readPVCD = readPVCD;
exports.getEncodedCif = getEncodedCif;
const tslib_1 = require("tslib");
const util = tslib_1.__importStar(require("util"));
const path = tslib_1.__importStar(require("path"));
const fs = tslib_1.__importStar(require("fs"));
const zlib = tslib_1.__importStar(require("zlib"));
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
require('util.promisify').shim();
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mol_task_1 = require("../../mol-task");
const cif_1 = require("../../mol-io/reader/cif");
const cif_2 = require("../../mol-io/writer/cif");
const ccd_1 = require("../../mol-io/reader/cif/schema/ccd");
async function ensureAvailable(path, url, forceDownload = false) {
    if (forceDownload || !fs.existsSync(path)) {
        console.log(`downloading ${url}...`);
        const data = await (0, node_fetch_1.default)(url);
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR);
        }
        if (url.endsWith('.gz')) {
            await writeFile(path, zlib.gunzipSync(await data.buffer()));
        }
        else {
            await writeFile(path, await data.text());
        }
        console.log(`done downloading ${url}`);
    }
}
async function ensureDataAvailable(options) {
    await ensureAvailable(CCD_PATH, options.ccdUrl || CCD_URL, !!options.ccdUrl || options.forceDownload);
    await ensureAvailable(PVCD_PATH, options.pvcdUrl || PVCD_URL, !!options.pvcdUrl || options.forceDownload);
}
async function readFileAsCollection(path, schema) {
    const parsed = await parseCif(await readFile(path, 'utf8'));
    return cif_1.CIF.toDatabaseCollection(schema, parsed.result);
}
async function readCCD() {
    return readFileAsCollection(CCD_PATH, ccd_1.CCD_Schema);
}
async function readPVCD() {
    return readFileAsCollection(PVCD_PATH, ccd_1.CCD_Schema);
}
async function parseCif(data) {
    const comp = cif_1.CIF.parse(data);
    console.time('parse cif');
    const parsed = await comp.run(p => console.log(mol_task_1.Progress.format(p)), 250);
    console.timeEnd('parse cif');
    if (parsed.isError)
        throw parsed;
    return parsed;
}
function getEncodedCif(name, database, binary = false) {
    const encoder = cif_2.CifWriter.createEncoder({ binary, encoderName: 'mol*' });
    cif_2.CifWriter.Encoder.writeDatabase(encoder, name, database);
    return encoder.getData();
}
exports.DefaultDataOptions = {
    forceDownload: false
};
const DATA_DIR = path.join(__dirname, '..', '..', '..', '..', 'build/data');
const CCD_PATH = path.join(DATA_DIR, 'components.cif');
const PVCD_PATH = path.join(DATA_DIR, 'aa-variants-v1.cif');
const CCD_URL = 'https://files.wwpdb.org/pub/pdb/data/monomers/components.cif';
const PVCD_URL = 'https://files.wwpdb.org/pub/pdb/data/monomers/aa-variants-v1.cif';
