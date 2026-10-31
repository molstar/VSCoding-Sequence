"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorNameColorThemeProvider = exports.OperatorNameColorThemeParams = void 0;
exports.getOperatorNameColorThemeParams = getOperatorNameColorThemeParams;
exports.OperatorNameColorTheme = OperatorNameColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const categories_1 = require("./categories");
const DefaultList = 'many-distinct';
const DefaultColor = (0, color_1.Color)(0xCCCCCC);
const Description = `Assigns a color based on the operator name of a transformed chain.`;
exports.OperatorNameColorThemeParams = {
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: DefaultList }),
};
function getOperatorNameColorThemeParams(ctx) {
    const params = param_definition_1.ParamDefinition.clone(exports.OperatorNameColorThemeParams);
    return params;
}
function getOperatorNameSerialMap(structure) {
    const map = new Map();
    for (let i = 0, il = structure.units.length; i < il; ++i) {
        const name = structure.units[i].conformation.operator.name;
        if (!map.has(name))
            map.set(name, map.size);
    }
    return map;
}
function OperatorNameColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const operatorNameSerialMap = getOperatorNameSerialMap(ctx.structure.root);
        const labelTable = Array.from(operatorNameSerialMap.keys());
        const valueLabel = (i) => labelTable[i];
        const palette = (0, palette_1.getPalette)(operatorNameSerialMap.size, props, { valueLabel });
        legend = palette.legend;
        color = (location) => {
            let serial = undefined;
            if (structure_1.StructureElement.Location.is(location)) {
                const name = location.unit.conformation.operator.name;
                serial = operatorNameSerialMap.get(name);
            }
            else if (structure_1.Bond.isLocation(location)) {
                const name = location.aUnit.conformation.operator.name;
                serial = operatorNameSerialMap.get(name);
            }
            return serial === undefined ? DefaultColor : palette.color(serial);
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: OperatorNameColorTheme,
        granularity: 'instance',
        color,
        props,
        description: Description,
        legend
    };
}
exports.OperatorNameColorThemeProvider = {
    name: 'operator-name',
    label: 'Operator Name',
    category: categories_1.ColorThemeCategory.Symmetry,
    factory: OperatorNameColorTheme,
    getParams: getOperatorNameColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.OperatorNameColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
