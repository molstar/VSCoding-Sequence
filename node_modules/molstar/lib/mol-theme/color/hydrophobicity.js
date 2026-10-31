/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ColorScale } from '../../mol-util/color';
import { StructureElement, Unit, Bond } from '../../mol-model/structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ResidueHydrophobicity } from '../../mol-model/structure/model/types';
import { ColorThemeCategory } from './categories';
const Description = 'Assigns a color to every amino acid according to the "Experimentally determined hydrophobicity scale for proteins at membrane interfaces" by Wimely and White (doi:10.1038/nsb1096-842).';
export const HydrophobicityColorThemeParams = {
    list: PD.ColorList('red-yellow-green', { presetKind: 'scale' }),
    scale: PD.Select('DGwif', [['DGwif', 'DG water-membrane'], ['DGwoct', 'DG water-octanol'], ['Oct-IF', 'DG difference']])
};
export function getHydrophobicityColorThemeParams(ctx) {
    return HydrophobicityColorThemeParams; // TODO return copy
}
const scaleIndexMap = { 'DGwif': 0, 'DGwoct': 1, 'Oct-IF': 2 };
export function hydrophobicity(compId, scaleIndex) {
    const c = ResidueHydrophobicity[compId];
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
export function HydrophobicityColorTheme(ctx, props) {
    const scaleIndex = scaleIndexMap[props.scale];
    // get domain
    let min = Infinity;
    let max = -Infinity;
    for (const name in ResidueHydrophobicity) {
        const val = ResidueHydrophobicity[name][scaleIndex];
        min = Math.min(min, val);
        max = Math.max(max, val);
    }
    const scale = ColorScale.create({
        listOrName: props.list.colors,
        domain: [max, min],
        minLabel: 'Hydrophilic',
        maxLabel: 'Hydrophobic'
    });
    function color(location) {
        let compId;
        if (StructureElement.Location.is(location)) {
            if (Unit.isAtomic(location.unit)) {
                compId = getAtomicCompId(location.unit, location.element);
            }
            else {
                compId = getCoarseCompId(location.unit, location.element);
            }
        }
        else if (Bond.isLocation(location)) {
            if (Unit.isAtomic(location.aUnit)) {
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
export const HydrophobicityColorThemeProvider = {
    name: 'hydrophobicity',
    label: 'Hydrophobicity',
    category: ColorThemeCategory.Residue,
    factory: HydrophobicityColorTheme,
    getParams: getHydrophobicityColorThemeParams,
    defaultValues: PD.getDefaultValues(HydrophobicityColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
