"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
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
const zhang_skolnik_1 = require("./secondary-structure/zhang-skolnik");
function getSecondaryStructureParams(_data) {
    return {
        type: param_definition_1.ParamDefinition.MappedStatic('auto', {
            'auto': param_definition_1.ParamDefinition.EmptyGroup({ label: 'Automatic' }),
            'model': param_definition_1.ParamDefinition.EmptyGroup({ label: 'Model' }),
            'dssp': param_definition_1.ParamDefinition.Group(dssp_1.DSSPComputationParams, { label: 'DSSP', isFlat: true }),
            'zhang-skolnick': param_definition_1.ParamDefinition.EmptyGroup({ label: 'Zhang-Skolnick' }),
        }, { options: [['auto', 'Automatic'], ['model', 'Model'], ['dssp', 'DSSP'], ['zhang-skolnick', 'Zhang-Skolnick']] })
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
            case 'auto': return { value: await computeAuto(data) };
            case 'dssp': return { value: await computeDssp(data, p.type.params) };
            case 'model': return { value: await computeModel(data) };
            case 'zhang-skolnick': return { value: await computeZhangSkolnik(data) };
        }
    }
});
async function computeAuto(structure) {
    const map = new Map();
    for (let i = 0, il = structure.unitSymmetryGroups.length; i < il; ++i) {
        const u = structure.unitSymmetryGroups[i].units[0];
        const m = u.model;
        if ((model_1.Model.isFromPdbArchive(m) && model_1.Model.isExperimental(m) && !model_1.Model.isCoarseGrained(m)) || model_1.Model.hasSecondaryStructure(m)) {
            const secondaryStructure = secondary_structure_1.ModelSecondaryStructure.Provider.get(m);
            if (secondaryStructure)
                map.set(u.invariantId, secondaryStructure);
        }
        else if (structure_1.Unit.isAtomic(u) && !model_1.Model.isCoarseGrained(m)) {
            const secondaryStructure = await (0, dssp_1.computeUnitDSSP)(u, dssp_1.DefaultDSSPComputationProps);
            map.set(u.invariantId, secondaryStructure);
        }
        else if (structure_1.Unit.isAtomic(u)) {
            const secondaryStructure = await (0, zhang_skolnik_1.computeUnitZhangSkolnik)(u);
            map.set(u.invariantId, secondaryStructure);
        }
    }
    return map;
}
async function computeDssp(structure, props) {
    // TODO take inter-unit hbonds into account for bridge, ladder, sheet assignment
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
async function computeZhangSkolnik(structure) {
    const map = new Map();
    for (let i = 0, il = structure.unitSymmetryGroups.length; i < il; ++i) {
        const u = structure.unitSymmetryGroups[i].units[0];
        if (structure_1.Unit.isAtomic(u)) {
            const secondaryStructure = await (0, zhang_skolnik_1.computeUnitZhangSkolnik)(u);
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
            if (secondaryStructure)
                map.set(u.invariantId, secondaryStructure);
        }
    }
    return map;
}
