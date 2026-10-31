"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.wwPDB_chemCompAtom = exports.wwPDB_chemCompBond = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const util = tslib_1.__importStar(require("util"));
const cif_1 = require("../../../../mol-io/reader/cif");
const util_1 = require("../../../common/util");
const mmcif_1 = require("../../../../mol-io/reader/cif/schema/mmcif");
const chem_comp_1 = require("../../../../mol-model-formats/structure/property/bonds/chem_comp");
const chem_comp_2 = require("../../../../mol-model-formats/structure/property/atoms/chem_comp");
const ccd_1 = require("../../../../mol-io/reader/cif/schema/ccd");
require('util.promisify').shim();
const readFile = util.promisify(fs.readFile);
const wwPDB_chemCompBond = async ({ model, params }) => {
    const table = await getChemCompBondTable(getBondTablePath(params));
    const data = chem_comp_1.ComponentBond.chemCompBondFromTable(model, table);
    const entries = chem_comp_1.ComponentBond.getEntriesFromChemCompBond(data);
    return chem_comp_1.ComponentBond.Provider.set(model, { entries, data });
};
exports.wwPDB_chemCompBond = wwPDB_chemCompBond;
async function read(path) {
    return path.endsWith('.bcif') ? new Uint8Array(await readFile(path)) : readFile(path, 'utf8');
}
let chemCompBondTable;
async function getChemCompBondTable(path) {
    if (!chemCompBondTable) {
        const parsed = await cif_1.CIF.parse(await read(path)).run();
        if (parsed.isError)
            throw new Error(parsed.toString());
        const table = cif_1.CIF.toDatabase(mmcif_1.mmCIF_Schema, parsed.result.blocks[0]);
        chemCompBondTable = table.chem_comp_bond;
    }
    return chemCompBondTable;
}
function getBondTablePath(params) {
    const path = (0, util_1.getParam)(params, 'wwPDB', 'chemCompBondTablePath');
    if (!path)
        throw new Error(`wwPDB 'chemCompBondTablePath' not set!`);
    return path;
}
const wwPDB_chemCompAtom = async ({ model, params }) => {
    const table = await getChemCompAtomTable(getAtomTablePath(params));
    const data = chem_comp_2.ComponentAtom.chemCompAtomFromTable(model, table);
    const entries = chem_comp_2.ComponentAtom.getEntriesFromChemCompAtom(data);
    return chem_comp_2.ComponentAtom.Provider.set(model, { entries, data });
};
exports.wwPDB_chemCompAtom = wwPDB_chemCompAtom;
let chemCompAtomTable;
async function getChemCompAtomTable(path) {
    if (!chemCompAtomTable) {
        const parsed = await cif_1.CIF.parse(await read(path)).run();
        if (parsed.isError)
            throw new Error(parsed.toString());
        const table = cif_1.CIF.toDatabase(ccd_1.CCD_Schema, parsed.result.blocks[0]);
        chemCompAtomTable = table.chem_comp_atom;
    }
    return chemCompAtomTable;
}
function getAtomTablePath(params) {
    const path = (0, util_1.getParam)(params, 'wwPDB', 'chemCompAtomTablePath');
    if (!path)
        throw new Error(`wwPDB 'chemCompAtomTablePath' not set!`);
    return path;
}
