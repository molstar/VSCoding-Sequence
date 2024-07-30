"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecondaryStructureProvider = exports.SecondaryStructureParams = void 0;
const dssp_1 = require("./secondary-structure/dssp");
const param_definition_1 = require("../../mol-util/param-definition");
const structure_1 = require("../../mol-model/structure/structure");
const custom_structure_property_1 = require("../common/custom-structure-property");
const secondary_structure_1 = require("../../mol-model-formats/structure/property/secondary-structure");
const custom_property_1 = require("../../mol-model/custom-property");
const model_1 = require("../../mol-model/structure/model");
function getSecondaryStructureParams(data) {
    let defaultType = 'model';
    if (data) {
        defaultType = 'dssp';
        for (let i = 0, il = data.models.length; i < il; ++i) {
            const m = data.models[i];
            if (model_1.Model.isFromPdbArchive(m) || model_1.Model.hasSecondaryStructure(m)) {
                // if there is any secondary structure definition given or if there is
                // an archival model, don't calculate dssp by default
                defaultType = 'model';
                break;
            }
        }
    }
    return {
        type: param_definition_1.ParamDefinition.MappedStatic(defaultType, {
            'model': param_definition_1.ParamDefinition.EmptyGroup({ label: 'Model' }),
            'dssp': param_definition_1.ParamDefinition.Group(dssp_1.DSSPComputationParams, { label: 'DSSP', isFlat: true })
        }, { options: [['model', 'Model'], ['dssp', 'DSSP']] })
    };
}
exports.SecondaryStructureParams = getSecondaryStructureParams();
exports.SecondaryStructureProvider = custom_structure_property_1.CustomStructureProperty.createProvider({
    label: 'Secondary Structure',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'molstar_computed_secondary_structure',
        // TODO `cifExport` and `symbol`
    }),
    type: 'root',
    defaultParams: exports.SecondaryStructureParams,
    getParams: getSecondaryStructureParams,
    isApplicable: (data) => true,
    obtain: async (ctx, data, props) => {
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.SecondaryStructureParams), ...props };
        switch (p.type.name) {
            case 'dssp': return { value: await computeDssp(data, p.type.params) };
            case 'model': return { value: await computeModel(data) };
        }
    }
});
async function computeDssp(structure, props) {
    // TODO take inter-unit hbonds into account for bridge, ladder, sheet assignment
    // TODO use Zhang-Skolnik for CA alpha only parts or for coarse parts with per-residue elements
    const map = new Map();
    for (let i = 0, il = structure.unitSymmetryGroups.length; i < il; ++i) {
        const u = structure.unitSymmetryGroups[i].units[0];
        if (structure_1.Unit.isAtomic(u) && !model_1.Model.isCoarseGrained(u.model)) {
            const secondaryStructure = await (0, dssp_1.computeUnitDSSP)(u, props);
            map.set(u.invariantId, secondaryStructure);
        }
    }
    return map;
}
async function computeModel(structure) {
    const map = new Map();
    for (let i = 0, il = structure.unitSymmetryGroups.length; i < il; ++i) {
        const u = structure.unitSymmetryGroups[i].units[0];
        if (structure_1.Unit.isAtomic(u)) {
            const secondaryStructure = secondary_structure_1.ModelSecondaryStructure.Provider.get(u.model);
            if (secondaryStructure) {
                map.set(u.invariantId, secondaryStructure);
            }
        }
    }
    return map;
}
