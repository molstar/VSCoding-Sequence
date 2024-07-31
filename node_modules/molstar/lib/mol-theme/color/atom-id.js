/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureProperties, StructureElement, Bond } from '../../mol-model/structure';
import { Color } from '../../mol-util/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { getPaletteParams, getPalette } from '../../mol-util/color/palette';
import { ColorThemeCategory } from './categories';
const DefaultList = 'many-distinct';
const DefaultColor = Color(0xFAFAFA);
const Description = 'Gives every atom a color based on its `label_atom_id` value.';
export const AtomIdColorThemeParams = {
    ...getPaletteParams({ type: 'colors', colorList: DefaultList }),
};
export function getAtomIdColorThemeParams(ctx) {
    const params = PD.clone(AtomIdColorThemeParams);
    return params;
}
function getAtomIdSerialMap(structure) {
    const map = new Map();
    for (const m of structure.models) {
        const { label_atom_id } = m.atomicHierarchy.atoms;
        for (let i = 0, il = label_atom_id.rowCount; i < il; ++i) {
            const id = label_atom_id.value(i);
            if (!map.has(id))
                map.set(id, map.size);
        }
    }
    return map;
}
export function AtomIdColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const l = StructureElement.Location.create(ctx.structure.root);
        const atomIdSerialMap = getAtomIdSerialMap(ctx.structure.root);
        const labelTable = Array.from(atomIdSerialMap.keys());
        const valueLabel = (i) => labelTable[i];
        const palette = getPalette(atomIdSerialMap.size, props, { valueLabel });
        legend = palette.legend;
        color = (location) => {
            let serial = undefined;
            if (StructureElement.Location.is(location)) {
                const id = StructureProperties.atom.label_atom_id(location);
                serial = atomIdSerialMap.get(id);
            }
            else if (Bond.isLocation(location)) {
                l.unit = location.aUnit;
                l.element = location.aUnit.elements[location.aIndex];
                const id = StructureProperties.atom.label_atom_id(l);
                serial = atomIdSerialMap.get(id);
            }
            return serial === undefined ? DefaultColor : palette.color(serial);
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: AtomIdColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        description: Description,
        legend
    };
}
export const AtomIdColorThemeProvider = {
    name: 'atom-id',
    label: 'Atom Id',
    category: ColorThemeCategory.Atom,
    factory: AtomIdColorTheme,
    getParams: getAtomIdColorThemeParams,
    defaultValues: PD.getDefaultValues(AtomIdColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
