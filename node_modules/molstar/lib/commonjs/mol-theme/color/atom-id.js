"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomIdColorThemeProvider = exports.AtomIdColorThemeParams = void 0;
exports.getAtomIdColorThemeParams = getAtomIdColorThemeParams;
exports.AtomIdColorTheme = AtomIdColorTheme;
const structure_1 = require("../../mol-model/structure");
const color_1 = require("../../mol-util/color");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const categories_1 = require("./categories");
const DefaultList = 'many-distinct';
const DefaultColor = (0, color_1.Color)(0xFAFAFA);
const Description = 'Gives every atom a color based on its `label_atom_id` value.';
exports.AtomIdColorThemeParams = {
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: DefaultList }),
};
function getAtomIdColorThemeParams(ctx) {
    const params = param_definition_1.ParamDefinition.clone(exports.AtomIdColorThemeParams);
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
function AtomIdColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const l = structure_1.StructureElement.Location.create(ctx.structure.root);
        const atomIdSerialMap = getAtomIdSerialMap(ctx.structure.root);
        const labelTable = Array.from(atomIdSerialMap.keys());
        const valueLabel = (i) => labelTable[i];
        const palette = (0, palette_1.getPalette)(atomIdSerialMap.size, props, { valueLabel });
        legend = palette.legend;
        color = (location) => {
            let serial = undefined;
            if (structure_1.StructureElement.Location.is(location)) {
                const id = structure_1.StructureProperties.atom.label_atom_id(location);
                serial = atomIdSerialMap.get(id);
            }
            else if (structure_1.Bond.isLocation(location)) {
                l.unit = location.aUnit;
                l.element = location.aUnit.elements[location.aIndex];
                const id = structure_1.StructureProperties.atom.label_atom_id(l);
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
exports.AtomIdColorThemeProvider = {
    name: 'atom-id',
    label: 'Atom Id',
    category: categories_1.ColorThemeCategory.Atom,
    factory: AtomIdColorTheme,
    getParams: getAtomIdColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.AtomIdColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
