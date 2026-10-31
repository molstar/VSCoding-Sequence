/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color } from '../../mol-util/color';
import { StructureElement, Bond } from '../../mol-model/structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { getPaletteParams, getPalette } from '../../mol-util/color/palette';
import { ColorThemeCategory } from './categories';
const DefaultList = 'many-distinct';
const DefaultColor = Color(0xCCCCCC);
const Description = `Assigns a color based on the operator name of a transformed chain.`;
export const OperatorNameColorThemeParams = {
    ...getPaletteParams({ type: 'colors', colorList: DefaultList }),
};
export function getOperatorNameColorThemeParams(ctx) {
    const params = PD.clone(OperatorNameColorThemeParams);
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
export function OperatorNameColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const operatorNameSerialMap = getOperatorNameSerialMap(ctx.structure.root);
        const labelTable = Array.from(operatorNameSerialMap.keys());
        const valueLabel = (i) => labelTable[i];
        const palette = getPalette(operatorNameSerialMap.size, props, { valueLabel });
        legend = palette.legend;
        color = (location) => {
            let serial = undefined;
            if (StructureElement.Location.is(location)) {
                const name = location.unit.conformation.operator.name;
                serial = operatorNameSerialMap.get(name);
            }
            else if (Bond.isLocation(location)) {
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
export const OperatorNameColorThemeProvider = {
    name: 'operator-name',
    label: 'Operator Name',
    category: ColorThemeCategory.Symmetry,
    factory: OperatorNameColorTheme,
    getParams: getOperatorNameColorThemeParams,
    defaultValues: PD.getDefaultValues(OperatorNameColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
