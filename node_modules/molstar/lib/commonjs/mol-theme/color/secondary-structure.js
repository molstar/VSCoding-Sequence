"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecondaryStructureColorThemeProvider = exports.SecondaryStructureColorThemeParams = void 0;
exports.getSecondaryStructureColorThemeParams = getSecondaryStructureColorThemeParams;
exports.secondaryStructureColor = secondaryStructureColor;
exports.SecondaryStructureColorTheme = SecondaryStructureColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const types_1 = require("../../mol-model/structure/model/types");
const util_1 = require("../../mol-model/structure/util");
const param_definition_1 = require("../../mol-util/param-definition");
const legend_1 = require("../../mol-util/legend");
const secondary_structure_1 = require("../../mol-model-props/computed/secondary-structure");
const color_2 = require("../../mol-util/color/color");
const params_1 = require("../../mol-util/color/params");
const util_2 = require("../../mol-data/util");
const categories_1 = require("./categories");
// from Jmol http://jmol.sourceforge.net/jscolors/ (shapely)
const SecondaryStructureColors = (0, color_1.ColorMap)({
    'alphaHelix': 0xFF0080,
    'threeTenHelix': 0xA00080,
    'piHelix': 0x600080,
    'betaTurn': 0x6080FF,
    'betaStrand': 0xFFC800,
    'coil': 0xFFFFFF,
    'bend': 0x66D8C9 /* biting original color used 0x00FF00 */,
    'turn': 0x00B266,
    'dna': 0xAE00FE,
    'rna': 0xFD0162,
    'carbohydrate': 0xA6A6FA
});
const DefaultSecondaryStructureColor = (0, color_1.Color)(0x808080);
const Description = 'Assigns a color based on the type of secondary structure and basic molecule type.';
exports.SecondaryStructureColorThemeParams = {
    saturation: param_definition_1.ParamDefinition.Numeric(-1, { min: -6, max: 6, step: 0.1 }),
    lightness: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }),
    colors: param_definition_1.ParamDefinition.MappedStatic('default', {
        'default': param_definition_1.ParamDefinition.EmptyGroup(),
        'custom': param_definition_1.ParamDefinition.Group((0, params_1.getColorMapParams)(SecondaryStructureColors))
    })
};
function getSecondaryStructureColorThemeParams(ctx) {
    return exports.SecondaryStructureColorThemeParams; // TODO return copy
}
function secondaryStructureColor(colorMap, unit, element, computedSecondaryStructure) {
    let secStrucType = types_1.SecondaryStructureType.create(0 /* SecondaryStructureType.Flag.None */);
    if (computedSecondaryStructure && structure_1.Unit.isAtomic(unit)) {
        const secondaryStructure = computedSecondaryStructure.get(unit.invariantId);
        if (secondaryStructure)
            secStrucType = secondaryStructure.type[secondaryStructure.getIndex(unit.residueIndex[element])];
    }
    if (types_1.SecondaryStructureType.is(secStrucType, 2 /* SecondaryStructureType.Flag.Helix */)) {
        if (types_1.SecondaryStructureType.is(secStrucType, 2048 /* SecondaryStructureType.Flag.Helix3Ten */)) {
            return colorMap.threeTenHelix;
        }
        else if (types_1.SecondaryStructureType.is(secStrucType, 32768 /* SecondaryStructureType.Flag.HelixPi */)) {
            return colorMap.piHelix;
        }
        return colorMap.alphaHelix;
    }
    else if (types_1.SecondaryStructureType.is(secStrucType, 4 /* SecondaryStructureType.Flag.Beta */)) {
        return colorMap.betaStrand;
    }
    else if (types_1.SecondaryStructureType.is(secStrucType, 8 /* SecondaryStructureType.Flag.Bend */)) {
        return colorMap.bend;
    }
    else if (types_1.SecondaryStructureType.is(secStrucType, 16 /* SecondaryStructureType.Flag.Turn */)) {
        return colorMap.turn;
    }
    else {
        const moleculeType = (0, util_1.getElementMoleculeType)(unit, element);
        if (moleculeType === 7 /* MoleculeType.DNA */) {
            return colorMap.dna;
        }
        else if (moleculeType === 6 /* MoleculeType.RNA */) {
            return colorMap.rna;
        }
        else if (moleculeType === 9 /* MoleculeType.Saccharide */) {
            return colorMap.carbohydrate;
        }
        else if (moleculeType === 5 /* MoleculeType.Protein */) {
            return colorMap.coil;
        }
    }
    return DefaultSecondaryStructureColor;
}
function SecondaryStructureColorTheme(ctx, props) {
    const computedSecondaryStructure = ctx.structure && secondary_structure_1.SecondaryStructureProvider.get(ctx.structure);
    const contextHash = computedSecondaryStructure ? (0, util_2.hash2)(computedSecondaryStructure.id, computedSecondaryStructure.version) : -1;
    const colorMap = (0, color_2.getAdjustedColorMap)(props.colors.name === 'default' ? SecondaryStructureColors : props.colors.params, props.saturation, props.lightness);
    function color(location) {
        if (structure_1.StructureElement.Location.is(location)) {
            return secondaryStructureColor(colorMap, location.unit, location.element, computedSecondaryStructure === null || computedSecondaryStructure === void 0 ? void 0 : computedSecondaryStructure.value);
        }
        else if (structure_1.Bond.isLocation(location)) {
            return secondaryStructureColor(colorMap, location.aUnit, location.aUnit.elements[location.aIndex], computedSecondaryStructure === null || computedSecondaryStructure === void 0 ? void 0 : computedSecondaryStructure.value);
        }
        return DefaultSecondaryStructureColor;
    }
    return {
        factory: SecondaryStructureColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        contextHash,
        description: Description,
        legend: (0, legend_1.TableLegend)(Object.keys(colorMap).map(name => {
            return [name, colorMap[name]];
        }).concat([['Other', DefaultSecondaryStructureColor]]))
    };
}
exports.SecondaryStructureColorThemeProvider = {
    name: 'secondary-structure',
    label: 'Secondary Structure',
    category: categories_1.ColorThemeCategory.Residue,
    factory: SecondaryStructureColorTheme,
    getParams: getSecondaryStructureColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.SecondaryStructureColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure,
    ensureCustomProperties: {
        attach: (ctx, data) => data.structure ? secondary_structure_1.SecondaryStructureProvider.attach(ctx, data.structure, void 0, true) : Promise.resolve(),
        detach: (data) => data.structure && secondary_structure_1.SecondaryStructureProvider.ref(data.structure, false)
    }
};
