"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainIdColorThemeProvider = exports.ChainIdColorThemeParams = void 0;
exports.getChainIdColorThemeParams = getChainIdColorThemeParams;
exports.ChainIdColorTheme = ChainIdColorTheme;
const structure_1 = require("../../mol-model/structure");
const color_1 = require("../../mol-util/color");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const categories_1 = require("./categories");
const DefaultList = 'many-distinct';
const DefaultColor = (0, color_1.Color)(0xFAFAFA);
const Description = 'Gives every chain a color based on its `asym_id` value.';
exports.ChainIdColorThemeParams = {
    asymId: param_definition_1.ParamDefinition.Select('auth', param_definition_1.ParamDefinition.arrayToOptions(['auth', 'label'])),
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: DefaultList }),
};
function getChainIdColorThemeParams(ctx) {
    var _a;
    const params = param_definition_1.ParamDefinition.clone(exports.ChainIdColorThemeParams);
    if ((_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.models.some(m => m.coarseHierarchy.isDefined)) {
        params.asymId.defaultValue = 'label';
    }
    return params;
}
function getAsymId(unit, type) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */:
            return type === 'auth'
                ? structure_1.StructureProperties.chain.auth_asym_id
                : structure_1.StructureProperties.chain.label_asym_id;
        case 1 /* Unit.Kind.Spheres */:
        case 2 /* Unit.Kind.Gaussians */:
            return structure_1.StructureProperties.coarse.asym_id;
    }
}
function getAsymIdKey(location, type) {
    const asymId = getAsymId(location.unit, type)(location);
    return location.structure.root.models.length > 1
        ? getKey(location.unit.model, asymId)
        : asymId;
}
function getKey(model, asymId) {
    return `${asymId}|${(structure_1.Model.Index.get(model).value || 0) + 1}`;
}
function getAsymIdSerialMap(structure, type) {
    const map = new Map();
    for (const m of structure.models) {
        const asymIdOffset = structure_1.Model.AsymIdOffset.get(m).value;
        const offset = (type === 'auth' ? asymIdOffset === null || asymIdOffset === void 0 ? void 0 : asymIdOffset.auth : asymIdOffset === null || asymIdOffset === void 0 ? void 0 : asymIdOffset.label) || 0;
        let count = 0;
        m.properties.structAsymMap.forEach(({ auth_id }, label_id) => {
            const asymId = type === 'auth' ? auth_id : label_id;
            const k = structure.models.length > 1
                ? getKey(m, asymId)
                : asymId;
            if (!map.has(k)) {
                map.set(k, count + offset);
                ++count;
            }
        });
    }
    return map;
}
function ChainIdColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const l = structure_1.StructureElement.Location.create(ctx.structure.root);
        const asymIdSerialMap = getAsymIdSerialMap(ctx.structure.root, props.asymId);
        const labelTable = Array.from(asymIdSerialMap.keys());
        const valueLabel = (i) => labelTable[i];
        const palette = (0, palette_1.getPalette)(asymIdSerialMap.size, props, { valueLabel });
        legend = palette.legend;
        color = (location) => {
            let serial = undefined;
            if (structure_1.StructureElement.Location.is(location)) {
                const k = getAsymIdKey(location, props.asymId);
                serial = asymIdSerialMap.get(k);
            }
            else if (structure_1.Bond.isLocation(location)) {
                l.unit = location.aUnit;
                l.element = location.aUnit.elements[location.aIndex];
                const k = getAsymIdKey(l, props.asymId);
                serial = asymIdSerialMap.get(k);
            }
            return serial === undefined ? DefaultColor : palette.color(serial);
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: ChainIdColorTheme,
        granularity: 'group',
        color,
        props,
        description: Description,
        legend
    };
}
exports.ChainIdColorThemeProvider = {
    name: 'chain-id',
    label: 'Chain Id',
    category: categories_1.ColorThemeCategory.Chain,
    factory: ChainIdColorTheme,
    getParams: getChainIdColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.ChainIdColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
