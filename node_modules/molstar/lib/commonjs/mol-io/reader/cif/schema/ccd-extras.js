"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ccd_chemCompAtom_schema = void 0;
const ccd_1 = require("./ccd");
// a reduced chem_comp_atom schema that provides charge and stereo_config information
exports.ccd_chemCompAtom_schema = {
    comp_id: ccd_1.CCD_Schema.chem_comp_atom.comp_id,
    atom_id: ccd_1.CCD_Schema.chem_comp_atom.atom_id,
    charge: ccd_1.CCD_Schema.chem_comp_atom.charge,
    pdbx_stereo_config: ccd_1.CCD_Schema.chem_comp_atom.pdbx_stereo_config
};
