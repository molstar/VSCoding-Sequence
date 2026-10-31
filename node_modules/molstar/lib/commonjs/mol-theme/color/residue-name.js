"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResidueNameColorThemeProvider = exports.ResidueNameColorThemeParams = exports.ResidueNameColors = void 0;
exports.getResidueNameColorThemeParams = getResidueNameColorThemeParams;
exports.residueNameColor = residueNameColor;
exports.ResidueNameColorTheme = ResidueNameColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const legend_1 = require("../../mol-util/legend");
const color_2 = require("../../mol-util/color/color");
const params_1 = require("../../mol-util/color/params");
const categories_1 = require("./categories");
// protein colors from Jmol http://jmol.sourceforge.net/jscolors/
exports.ResidueNameColors = (0, color_1.ColorMap)({
    // standard amino acids
    'ALA': 0x8CFF8C,
    'ARG': 0x00007C,
    'ASN': 0xFF7C70,
    'ASP': 0xA00042,
    'CYS': 0xFFFF70,
    'GLN': 0xFF4C4C,
    'GLU': 0x660000,
    'GLY': 0xEEEEEE,
    'HIS': 0x7070FF,
    'ILE': 0x004C00,
    'LEU': 0x455E45,
    'LYS': 0x4747B8,
    'MET': 0xB8A042,
    'PHE': 0x534C52,
    'PRO': 0x525252,
    'SER': 0xFF7042,
    'THR': 0xB84C00,
    'TRP': 0x4F4600,
    'TYR': 0x8C704C,
    'VAL': 0xFF8CFF,
    // rna bases
    'A': 0xDC143C, // Crimson Red
    'G': 0x32CD32, // Lime Green
    'I': 0x9ACD32, // Yellow Green
    'C': 0xFFD700, // Gold Yellow
    'T': 0x4169E1, // Royal Blue
    'U': 0x40E0D0, // Turquoise Cyan
    // dna bases
    'DA': 0xDC143C,
    'DG': 0x32CD32,
    'DI': 0x9ACD32,
    'DC': 0xFFD700,
    'DT': 0x4169E1,
    'DU': 0x40E0D0,
    // peptide bases
    'APN': 0xDC143C,
    'GPN': 0x32CD32,
    'CPN': 0xFFD700,
    'TPN': 0x4169E1,
});
const DefaultResidueNameColor = (0, color_1.Color)(0xFF00FF);
const Description = 'Assigns a color to every residue according to its name.';
exports.ResidueNameColorThemeParams = {
    saturation: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }),
    lightness: param_definition_1.ParamDefinition.Numeric(1, { min: -6, max: 6, step: 0.1 }),
    colors: param_definition_1.ParamDefinition.MappedStatic('default', {
        'default': param_definition_1.ParamDefinition.EmptyGroup(),
        'custom': param_definition_1.ParamDefinition.Group((0, params_1.getColorMapParams)(exports.ResidueNameColors))
    })
};
function getResidueNameColorThemeParams(ctx) {
    return exports.ResidueNameColorThemeParams; // TODO return copy
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
function residueNameColor(colorMap, residueName) {
    const c = colorMap[residueName];
    return c === undefined ? DefaultResidueNameColor : c;
}
function ResidueNameColorTheme(ctx, props) {
    const colorMap = (0, color_2.getAdjustedColorMap)(props.colors.name === 'default' ? exports.ResidueNameColors : props.colors.params, props.saturation, props.lightness);
    function color(location) {
        if (structure_1.StructureElement.Location.is(location)) {
            if (structure_1.Unit.isAtomic(location.unit)) {
                const compId = getAtomicCompId(location.unit, location.element);
                return residueNameColor(colorMap, compId);
            }
            else {
                const compId = getCoarseCompId(location.unit, location.element);
                if (compId)
                    return residueNameColor(colorMap, compId);
            }
        }
        else if (structure_1.Bond.isLocation(location)) {
            if (structure_1.Unit.isAtomic(location.aUnit)) {
                const compId = getAtomicCompId(location.aUnit, location.aUnit.elements[location.aIndex]);
                return residueNameColor(colorMap, compId);
            }
            else {
                const compId = getCoarseCompId(location.aUnit, location.aUnit.elements[location.aIndex]);
                if (compId)
                    return residueNameColor(colorMap, compId);
            }
        }
        return DefaultResidueNameColor;
    }
    return {
        factory: ResidueNameColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        description: Description,
        legend: (0, legend_1.TableLegend)(Object.keys(colorMap).map(name => {
            return [name, colorMap[name]];
        }).concat([['Unknown', DefaultResidueNameColor]]))
    };
}
exports.ResidueNameColorThemeProvider = {
    name: 'residue-name',
    label: 'Residue Name',
    category: categories_1.ColorThemeCategory.Residue,
    factory: ResidueNameColorTheme,
    getParams: getResidueNameColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.ResidueNameColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
