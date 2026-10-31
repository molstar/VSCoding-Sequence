/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color, ColorMap } from '../../mol-util/color';
import { StructureElement, Unit, Bond } from '../../mol-model/structure';
import { SecondaryStructureType } from '../../mol-model/structure/model/types';
import { getElementMoleculeType } from '../../mol-model/structure/util';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { TableLegend } from '../../mol-util/legend';
import { SecondaryStructureProvider } from '../../mol-model-props/computed/secondary-structure';
import { getAdjustedColorMap } from '../../mol-util/color/color';
import { getColorMapParams } from '../../mol-util/color/params';
import { hash2 } from '../../mol-data/util';
import { ColorThemeCategory } from './categories';
// from Jmol http://jmol.sourceforge.net/jscolors/ (shapely)
const SecondaryStructureColors = ColorMap({
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
const DefaultSecondaryStructureColor = Color(0x808080);
const Description = 'Assigns a color based on the type of secondary structure and basic molecule type.';
export const SecondaryStructureColorThemeParams = {
    saturation: PD.Numeric(-1, { min: -6, max: 6, step: 0.1 }),
    lightness: PD.Numeric(0, { min: -6, max: 6, step: 0.1 }),
    colors: PD.MappedStatic('default', {
        'default': PD.EmptyGroup(),
        'custom': PD.Group(getColorMapParams(SecondaryStructureColors))
    })
};
export function getSecondaryStructureColorThemeParams(ctx) {
    return SecondaryStructureColorThemeParams; // TODO return copy
}
export function secondaryStructureColor(colorMap, unit, element, computedSecondaryStructure) {
    let secStrucType = SecondaryStructureType.create(0 /* SecondaryStructureType.Flag.None */);
    if (computedSecondaryStructure && Unit.isAtomic(unit)) {
        const secondaryStructure = computedSecondaryStructure.get(unit.invariantId);
        if (secondaryStructure)
            secStrucType = secondaryStructure.type[secondaryStructure.getIndex(unit.residueIndex[element])];
    }
    if (SecondaryStructureType.is(secStrucType, 2 /* SecondaryStructureType.Flag.Helix */)) {
        if (SecondaryStructureType.is(secStrucType, 2048 /* SecondaryStructureType.Flag.Helix3Ten */)) {
            return colorMap.threeTenHelix;
        }
        else if (SecondaryStructureType.is(secStrucType, 32768 /* SecondaryStructureType.Flag.HelixPi */)) {
            return colorMap.piHelix;
        }
        return colorMap.alphaHelix;
    }
    else if (SecondaryStructureType.is(secStrucType, 4 /* SecondaryStructureType.Flag.Beta */)) {
        return colorMap.betaStrand;
    }
    else if (SecondaryStructureType.is(secStrucType, 8 /* SecondaryStructureType.Flag.Bend */)) {
        return colorMap.bend;
    }
    else if (SecondaryStructureType.is(secStrucType, 16 /* SecondaryStructureType.Flag.Turn */)) {
        return colorMap.turn;
    }
    else {
        const moleculeType = getElementMoleculeType(unit, element);
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
export function SecondaryStructureColorTheme(ctx, props) {
    const computedSecondaryStructure = ctx.structure && SecondaryStructureProvider.get(ctx.structure);
    const contextHash = computedSecondaryStructure ? hash2(computedSecondaryStructure.id, computedSecondaryStructure.version) : -1;
    const colorMap = getAdjustedColorMap(props.colors.name === 'default' ? SecondaryStructureColors : props.colors.params, props.saturation, props.lightness);
    function color(location) {
        if (StructureElement.Location.is(location)) {
            return secondaryStructureColor(colorMap, location.unit, location.element, computedSecondaryStructure === null || computedSecondaryStructure === void 0 ? void 0 : computedSecondaryStructure.value);
        }
        else if (Bond.isLocation(location)) {
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
        legend: TableLegend(Object.keys(colorMap).map(name => {
            return [name, colorMap[name]];
        }).concat([['Other', DefaultSecondaryStructureColor]]))
    };
}
export const SecondaryStructureColorThemeProvider = {
    name: 'secondary-structure',
    label: 'Secondary Structure',
    category: ColorThemeCategory.Residue,
    factory: SecondaryStructureColorTheme,
    getParams: getSecondaryStructureColorThemeParams,
    defaultValues: PD.getDefaultValues(SecondaryStructureColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure,
    ensureCustomProperties: {
        attach: (ctx, data) => data.structure ? SecondaryStructureProvider.attach(ctx, data.structure, void 0, true) : Promise.resolve(),
        detach: (data) => data.structure && SecondaryStructureProvider.ref(data.structure, false)
    }
};
