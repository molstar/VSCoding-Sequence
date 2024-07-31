"use strict";
/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._pdbx_nonpoly_scheme = exports._pdbx_chem_comp_identifier = exports._chem_comp_bond = exports._chem_comp = void 0;
const db_1 = require("../../../../mol-data/db");
const cif_1 = require("../../../../mol-io/writer/cif");
const utils_1 = require("./utils");
var CifCategory = cif_1.CifWriter.Category;
exports._chem_comp = {
    name: 'chem_comp',
    instance({ firstModel, structures, cache }) {
        const chem_comp = (0, utils_1.getModelMmCifCategory)(structures[0].model, 'chem_comp');
        if (!chem_comp)
            return CifCategory.Empty;
        const { id } = chem_comp;
        const names = cache.uniqueResidueNames || (cache.uniqueResidueNames = (0, utils_1.getUniqueResidueNamesFromStructures)(structures));
        const indices = db_1.Column.indicesOf(id, id => names.has(id));
        return CifCategory.ofTable(chem_comp, indices);
    }
};
exports._chem_comp_bond = {
    name: 'chem_comp_bond',
    instance({ firstModel, structures, cache }) {
        const chem_comp_bond = (0, utils_1.getModelMmCifCategory)(structures[0].model, 'chem_comp_bond');
        if (!chem_comp_bond)
            return CifCategory.Empty;
        const { comp_id } = chem_comp_bond;
        const names = cache.uniqueResidueNames || (cache.uniqueResidueNames = (0, utils_1.getUniqueResidueNamesFromStructures)(structures));
        const indices = db_1.Column.indicesOf(comp_id, id => names.has(id));
        return CifCategory.ofTable(chem_comp_bond, indices);
    }
};
exports._pdbx_chem_comp_identifier = {
    name: 'pdbx_chem_comp_identifier',
    instance({ firstModel, structures, cache }) {
        const pdbx_chem_comp_identifier = (0, utils_1.getModelMmCifCategory)(firstModel, 'pdbx_chem_comp_identifier');
        if (!pdbx_chem_comp_identifier)
            return CifCategory.Empty;
        const { comp_id } = pdbx_chem_comp_identifier;
        const names = cache.uniqueResidueNames || (cache.uniqueResidueNames = (0, utils_1.getUniqueResidueNamesFromStructures)(structures));
        const indices = db_1.Column.indicesOf(comp_id, id => names.has(id));
        return CifCategory.ofTable(pdbx_chem_comp_identifier, indices);
    }
};
exports._pdbx_nonpoly_scheme = {
    name: 'pdbx_nonpoly_scheme',
    instance({ firstModel, structures, cache }) {
        const pdbx_nonpoly_scheme = (0, utils_1.getModelMmCifCategory)(firstModel, 'pdbx_nonpoly_scheme');
        if (!pdbx_nonpoly_scheme)
            return CifCategory.Empty;
        // TODO: filter?
        return CifCategory.ofTable(pdbx_nonpoly_scheme);
    }
};
