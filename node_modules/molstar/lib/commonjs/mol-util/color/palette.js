"use strict";
/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaletteParams = getPaletteParams;
exports.getPalette = getPalette;
const legend_1 = require("../legend");
const param_definition_1 = require("../param-definition");
const distinct_1 = require("./distinct");
const lists_1 = require("./lists");
const scale_1 = require("./scale");
const DefaultGetPaletteProps = {
    type: 'generate',
    colorList: 'red-yellow-blue'
};
function getPaletteParams(props = {}) {
    const p = { ...DefaultGetPaletteProps, ...props };
    return {
        palette: param_definition_1.ParamDefinition.MappedStatic(p.type, {
            colors: param_definition_1.ParamDefinition.Group({
                list: param_definition_1.ParamDefinition.ColorList(p.colorList),
            }, { isFlat: true }),
            generate: param_definition_1.ParamDefinition.Group({
                ...distinct_1.DistinctColorsParams,
                maxCount: param_definition_1.ParamDefinition.Numeric(75, { min: 1, max: 250, step: 1 }),
            }, { isFlat: true })
        }, {
            options: [
                ['colors', 'Color List'],
                ['generate', 'Generate Distinct']
            ]
        })
    };
}
const DefaultPaletteProps = param_definition_1.ParamDefinition.getDefaultValues(getPaletteParams());
const DefaultLabelOptions = {
    valueLabel: (i) => `${i + 1}`,
    minLabel: 'Start',
    maxLabel: 'End'
};
function getPalette(count, props, labelOptions = {}) {
    var _a;
    let color;
    let legend;
    if (props.palette.name === 'colors' && props.palette.params.list.kind === 'interpolate') {
        const { list } = props.palette.params;
        const domain = [0, count - 1];
        const { minLabel, maxLabel } = { ...DefaultLabelOptions, ...labelOptions };
        let colors = list.colors;
        if (colors.length === 0)
            colors = (0, lists_1.getColorListFromName)(DefaultGetPaletteProps.colorList).list;
        const scale = scale_1.ColorScale.create({ listOrName: colors, domain, minLabel, maxLabel });
        legend = scale.legend;
        color = scale.color;
    }
    else {
        let colors;
        if (props.palette.name === 'colors') {
            colors = props.palette.params.list.colors.map(c => Array.isArray(c) ? c[0] : c);
            if (colors.length === 0)
                colors = (0, lists_1.getColorListFromName)('dark-2').list.map(c => Array.isArray(c) ? c[0] : c);
        }
        else {
            count = Math.min(count, props.palette.params.maxCount);
            colors = (0, distinct_1.distinctColors)(count, props.palette.params);
        }
        const valueLabel = (_a = labelOptions.valueLabel) !== null && _a !== void 0 ? _a : DefaultLabelOptions.valueLabel;
        const colorsLength = colors.length;
        const table = [];
        for (let i = 0; i < count; ++i) {
            const j = i % colorsLength;
            if (table[j] === undefined) {
                table[j] = [valueLabel(i), colors[j]];
            }
            else {
                table[j][0] += `, ${valueLabel(i)}`;
            }
        }
        legend = (0, legend_1.TableLegend)(table);
        color = (i) => colors[i % colorsLength];
    }
    return { color, legend };
}
