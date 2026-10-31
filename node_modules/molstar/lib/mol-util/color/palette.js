/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { TableLegend } from '../legend';
import { ParamDefinition as PD } from '../param-definition';
import { distinctColors, DistinctColorsParams } from './distinct';
import { getColorListFromName } from './lists';
import { ColorScale } from './scale';
const DefaultGetPaletteProps = {
    type: 'generate',
    colorList: 'red-yellow-blue'
};
export function getPaletteParams(props = {}) {
    const p = { ...DefaultGetPaletteProps, ...props };
    return {
        palette: PD.MappedStatic(p.type, {
            colors: PD.Group({
                list: PD.ColorList(p.colorList),
            }, { isFlat: true }),
            generate: PD.Group({
                ...DistinctColorsParams,
                maxCount: PD.Numeric(75, { min: 1, max: 250, step: 1 }),
            }, { isFlat: true })
        }, {
            options: [
                ['colors', 'Color List'],
                ['generate', 'Generate Distinct']
            ]
        })
    };
}
const DefaultPaletteProps = PD.getDefaultValues(getPaletteParams());
const DefaultLabelOptions = {
    valueLabel: (i) => `${i + 1}`,
    minLabel: 'Start',
    maxLabel: 'End'
};
export function getPalette(count, props, labelOptions = {}) {
    var _a;
    let color;
    let legend;
    if (props.palette.name === 'colors' && props.palette.params.list.kind === 'interpolate') {
        const { list } = props.palette.params;
        const domain = [0, count - 1];
        const { minLabel, maxLabel } = { ...DefaultLabelOptions, ...labelOptions };
        let colors = list.colors;
        if (colors.length === 0)
            colors = getColorListFromName(DefaultGetPaletteProps.colorList).list;
        const scale = ColorScale.create({ listOrName: colors, domain, minLabel, maxLabel });
        legend = scale.legend;
        color = scale.color;
    }
    else {
        let colors;
        if (props.palette.name === 'colors') {
            colors = props.palette.params.list.colors.map(c => Array.isArray(c) ? c[0] : c);
            if (colors.length === 0)
                colors = getColorListFromName('dark-2').list.map(c => Array.isArray(c) ? c[0] : c);
        }
        else {
            count = Math.min(count, props.palette.params.maxCount);
            colors = distinctColors(count, props.palette.params);
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
        legend = TableLegend(table);
        color = (i) => colors[i % colorsLength];
    }
    return { color, legend };
}
