"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoleculeTypeColorThemeProvider = exports.MoleculeTypeColorThemeParams = exports.MoleculeTypeColors = void 0;
exports.getMoleculeTypeColorThemeParams = getMoleculeTypeColorThemeParams;
exports.moleculeTypeColor = moleculeTypeColor;
exports.MoleculeTypeColorTheme = MoleculeTypeColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const util_1 = require("../../mol-model/structure/util");
const param_definition_1 = require("../../mol-util/param-definition");
const legend_1 = require("../../mol-util/legend");
const color_2 = require("../../mol-util/color/color");
const params_1 = require("../../mol-util/color/params");
const categories_1 = require("./categories");
exports.MoleculeTypeColors = (0, color_1.ColorMap)({
    water: 0x386cb0,
    ion: 0xf0027f,
    protein: 0xbeaed4,
    RNA: 0xfdc086,
    DNA: 0xbf5b17,
    PNA: 0x42A49A,
    saccharide: 0x7fc97f,
});
const DefaultMoleculeTypeColor = (0, color_1.Color)(0xffff99);
const Description = 'Assigns a color based on the molecule type of a residue.';
exports.MoleculeTypeColorThemeParams = {
    saturation: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }),
    lightness: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }),
    colors: param_definition_1.ParamDefinition.MappedStatic('default', {
        'default': param_definition_1.ParamDefinition.EmptyGroup(),
        'custom': param_definition_1.ParamDefinition.Group((0, params_1.getColorMapParams)(exports.MoleculeTypeColors))
    })
};
function getMoleculeTypeColorThemeParams(ctx) {
    return exports.MoleculeTypeColorThemeParams; // TODO return copy
}
function moleculeTypeColor(colorMap, unit, element) {
    const moleculeType = (0, util_1.getElementMoleculeType)(unit, element);
    switch (moleculeType) {
        case 2 /* MoleculeType.Water */: return colorMap.water;
        case 3 /* MoleculeType.Ion */: return colorMap.ion;
        case 5 /* MoleculeType.Protein */: return colorMap.protein;
        case 6 /* MoleculeType.RNA */: return colorMap.RNA;
        case 7 /* MoleculeType.DNA */: return colorMap.DNA;
        case 8 /* MoleculeType.PNA */: return colorMap.PNA;
        case 9 /* MoleculeType.Saccharide */: return colorMap.saccharide;
    }
    return DefaultMoleculeTypeColor;
}
function MoleculeTypeColorTheme(ctx, props) {
    const colorMap = (0, color_2.getAdjustedColorMap)(props.colors.name === 'default' ? exports.MoleculeTypeColors : props.colors.params, props.saturation, props.lightness);
    function color(location) {
        if (structure_1.StructureElement.Location.is(location)) {
            return moleculeTypeColor(colorMap, location.unit, location.element);
        }
        else if (structure_1.Bond.isLocation(location)) {
            return moleculeTypeColor(colorMap, location.aUnit, location.aUnit.elements[location.aIndex]);
        }
        return DefaultMoleculeTypeColor;
    }
    return {
        factory: MoleculeTypeColorTheme,
        granularity: 'group',
        color,
        props,
        description: Description,
        legend: (0, legend_1.TableLegend)(Object.keys(colorMap).map(name => {
            return [name, colorMap[name]];
        }).concat([['Other/unknown', DefaultMoleculeTypeColor]]))
    };
}
exports.MoleculeTypeColorThemeProvider = {
    name: 'molecule-type',
    label: 'Molecule Type',
    category: categories_1.ColorThemeCategory.Residue,
    factory: MoleculeTypeColorTheme,
    getParams: getMoleculeTypeColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.MoleculeTypeColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
