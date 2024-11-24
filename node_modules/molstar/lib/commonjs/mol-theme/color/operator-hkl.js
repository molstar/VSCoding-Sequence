"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorHklColorThemeProvider = exports.OperatorHklColorThemeParams = void 0;
exports.getOperatorHklColorThemeParams = getOperatorHklColorThemeParams;
exports.OperatorHklColorTheme = OperatorHklColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const number_1 = require("../../mol-util/number");
const lists_1 = require("../../mol-util/color/lists");
const categories_1 = require("./categories");
const DefaultList = 'dark-2';
const DefaultColor = (0, color_1.Color)(0xCCCCCC);
const Description = `Assigns a color based on the operator HKL value of a transformed chain.`;
exports.OperatorHklColorThemeParams = {
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: DefaultList }),
};
function getOperatorHklColorThemeParams(ctx) {
    const params = param_definition_1.ParamDefinition.clone(exports.OperatorHklColorThemeParams);
    if (ctx.structure) {
        if (getOperatorHklSerialMap(ctx.structure.root).map.size > lists_1.ColorLists[DefaultList].list.length) {
            params.palette.defaultValue.name = 'colors';
            params.palette.defaultValue.params = {
                ...params.palette.defaultValue.params,
                list: { kind: 'interpolate', colors: (0, lists_1.getColorListFromName)(DefaultList).list }
            };
        }
    }
    return params;
}
const hklOffset = 10000;
function hklKey(hkl) {
    return hkl.map(v => `${v + hklOffset}`.padStart(5, '0')).join('');
}
function hklKeySplit(key) {
    const len = (0, number_1.integerDigitCount)(hklOffset, 0);
    const h = parseInt(key.substr(0, len));
    const k = parseInt(key.substr(len, len));
    const l = parseInt(key.substr(len + len, len));
    return linear_algebra_1.Vec3.create(h - hklOffset, k - hklOffset, l - hklOffset);
}
function formatHkl(hkl) {
    return hkl.map(v => v + 5).join('');
}
function getOperatorHklSerialMap(structure) {
    const map = new Map();
    const set = new Set();
    for (let i = 0, il = structure.units.length; i < il; ++i) {
        const k = hklKey(structure.units[i].conformation.operator.hkl);
        set.add(k);
    }
    const arr = Array.from(set.values()).sort();
    arr.forEach(k => map.set(k, map.size));
    const min = hklKeySplit(arr[0]);
    const max = hklKeySplit(arr[arr.length - 1]);
    return { min, max, map };
}
function OperatorHklColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const { min, max, map } = getOperatorHklSerialMap(ctx.structure.root);
        const labelTable = [];
        map.forEach((v, k) => {
            const i = v % map.size;
            const label = formatHkl(hklKeySplit(k));
            if (labelTable[i] === undefined)
                labelTable[i] = label;
            else
                labelTable[i] += `, ${label}`;
        });
        const labelOptions = {
            minLabel: formatHkl(min),
            maxLabel: formatHkl(max),
            valueLabel: (i) => labelTable[i]
        };
        const palette = (0, palette_1.getPalette)(map.size, props, labelOptions);
        legend = palette.legend;
        color = (location) => {
            let serial = undefined;
            if (structure_1.StructureElement.Location.is(location)) {
                const k = hklKey(location.unit.conformation.operator.hkl);
                serial = map.get(k);
            }
            else if (structure_1.Bond.isLocation(location)) {
                const k = hklKey(location.aUnit.conformation.operator.hkl);
                serial = map.get(k);
            }
            return serial === undefined ? DefaultColor : palette.color(serial);
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: OperatorHklColorTheme,
        granularity: 'instance',
        color,
        props,
        description: Description,
        legend
    };
}
exports.OperatorHklColorThemeProvider = {
    name: 'operator-hkl',
    label: 'Operator HKL',
    category: categories_1.ColorThemeCategory.Symmetry,
    factory: OperatorHklColorTheme,
    getParams: getOperatorHklColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.OperatorHklColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
