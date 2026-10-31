"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HydrophobicityColorThemeProvider = exports.HydrophobicityColorThemeParams = void 0;
exports.getHydrophobicityColorThemeParams = getHydrophobicityColorThemeParams;
exports.hydrophobicity = hydrophobicity;
exports.HydrophobicityColorTheme = HydrophobicityColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const types_1 = require("../../mol-model/structure/model/types");
const categories_1 = require("./categories");
const Description = 'Assigns a color to every amino acid according to the "Experimentally determined hydrophobicity scale for proteins at membrane interfaces" by Wimely and White (doi:10.1038/nsb1096-842).';
exports.HydrophobicityColorThemeParams = {
    list: param_definition_1.ParamDefinition.ColorList('red-yellow-green', { presetKind: 'scale' }),
    scale: param_definition_1.ParamDefinition.Select('DGwif', [['DGwif', 'DG water-membrane'], ['DGwoct', 'DG water-octanol'], ['Oct-IF', 'DG difference']])
};
function getHydrophobicityColorThemeParams(ctx) {
    return exports.HydrophobicityColorThemeParams; // TODO return copy
}
const scaleIndexMap = { 'DGwif': 0, 'DGwoct': 1, 'Oct-IF': 2 };
function hydrophobicity(compId, scaleIndex) {
    const c = types_1.ResidueHydrophobicity[compId];
    return c === undefined ? 0 : c[scaleIndex];
}
function getAtomicCompId(unit, element) {
    return unit.model.atomicHierarchy.atoms.label_comp_id.value(element);
}
function getCoarseCompId(unit, element) {
    const seqIdBegin = unit.coarseElements.seq_id_begin.value(element);
    const seqIdEnd = unit.coarseElements.seq_id_end.value(element);
    if (seqIdBegin === seqIdEnd) {
        const entityKey = unit.coarseElements.entityKey[element];
        const seq = unit.model.sequence.byEntityKey[entityKey].sequence;
        return seq.compId.value(seqIdBegin - 1); // 1-indexed
    }
}
function HydrophobicityColorTheme(ctx, props) {
    const scaleIndex = scaleIndexMap[props.scale];
    // get domain
    let min = Infinity;
    let max = -Infinity;
    for (const name in types_1.ResidueHydrophobicity) {
        const val = types_1.ResidueHydrophobicity[name][scaleIndex];
        min = Math.min(min, val);
        max = Math.max(max, val);
    }
    const scale = color_1.ColorScale.create({
        listOrName: props.list.colors,
        domain: [max, min],
        minLabel: 'Hydrophilic',
        maxLabel: 'Hydrophobic'
    });
    function color(location) {
        let compId;
        if (structure_1.StructureElement.Location.is(location)) {
            if (structure_1.Unit.isAtomic(location.unit)) {
                compId = getAtomicCompId(location.unit, location.element);
            }
            else {
                compId = getCoarseCompId(location.unit, location.element);
            }
        }
        else if (structure_1.Bond.isLocation(location)) {
            if (structure_1.Unit.isAtomic(location.aUnit)) {
                compId = getAtomicCompId(location.aUnit, location.aUnit.elements[location.aIndex]);
            }
            else {
                compId = getCoarseCompId(location.aUnit, location.aUnit.elements[location.aIndex]);
            }
        }
        return scale.color(compId ? hydrophobicity(compId, scaleIndex) : 0);
    }
    return {
        factory: HydrophobicityColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        description: Description,
        legend: scale ? scale.legend : undefined
    };
}
exports.HydrophobicityColorThemeProvider = {
    name: 'hydrophobicity',
    label: 'Hydrophobicity',
    category: categories_1.ColorThemeCategory.Residue,
    factory: HydrophobicityColorTheme,
    getParams: getHydrophobicityColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.HydrophobicityColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
