/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import * as fs from 'fs';
import * as util from 'util';
import { CIF } from '../../../../mol-io/reader/cif';
import { getParam } from '../../../common/util';
import { mmCIF_Schema } from '../../../../mol-io/reader/cif/schema/mmcif';
import { ComponentBond } from '../../../../mol-model-formats/structure/property/bonds/chem_comp';
import { ComponentAtom } from '../../../../mol-model-formats/structure/property/atoms/chem_comp';
import { CCD_Schema } from '../../../../mol-io/reader/cif/schema/ccd';
require('util.promisify').shim();
const readFile = util.promisify(fs.readFile);
export const wwPDB_chemCompBond = async ({ model, params }) => {
    const table = await getChemCompBondTable(getBondTablePath(params));
    const data = ComponentBond.chemCompBondFromTable(model, table);
    const entries = ComponentBond.getEntriesFromChemCompBond(data);
    return ComponentBond.Provider.set(model, { entries, data });
};
async function read(path) {
    return path.endsWith('.bcif') ? new Uint8Array(await readFile(path)) : readFile(path, 'utf8');
}
let chemCompBondTable;
async function getChemCompBondTable(path) {
    if (!chemCompBondTable) {
        const parsed = await CIF.parse(await read(path)).run();
        if (parsed.isError)
            throw new Error(parsed.toString());
        const table = CIF.toDatabase(mmCIF_Schema, parsed.result.blocks[0]);
        chemCompBondTable = table.chem_comp_bond;
    }
    return chemCompBondTable;
}
function getBondTablePath(params) {
    const path = getParam(params, 'wwPDB', 'chemCompBondTablePath');
    if (!path)
        throw new Error(`wwPDB 'chemCompBondTablePath' not set!`);
    return path;
}
export const wwPDB_chemCompAtom = async ({ model, params }) => {
    const table = await getChemCompAtomTable(getAtomTablePath(params));
    const data = ComponentAtom.chemCompAtomFromTable(model, table);
    const entries = ComponentAtom.getEntriesFromChemCompAtom(data);
    return ComponentAtom.Provider.set(model, { entries, data });
};
let chemCompAtomTable;
async function getChemCompAtomTable(path) {
    if (!chemCompAtomTable) {
        const parsed = await CIF.parse(await read(path)).run();
        if (parsed.isError)
            throw new Error(parsed.toString());
        const table = CIF.toDatabase(CCD_Schema, parsed.result.blocks[0]);
        chemCompAtomTable = table.chem_comp_atom;
    }
    return chemCompAtomTable;
}
function getAtomTablePath(params) {
    const path = getParam(params, 'wwPDB', 'chemCompAtomTablePath');
    if (!path)
        throw new Error(`wwPDB 'chemCompAtomTablePath' not set!`);
    return path;
}
