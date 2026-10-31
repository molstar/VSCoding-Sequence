/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { ErrorColor, NtCColors } from '../color';
import { ConfalPyramidsProvider } from './property';
import { ConfalPyramidsTypes as CPT } from './types';
import { Dnatco } from '../property';
import { ColorTheme } from '../../../mol-theme/color';
import { ColorMap } from '../../../mol-util/color';
import { getColorMapParams } from '../../../mol-util/color/params';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { TableLegend } from '../../../mol-util/legend';
import { ObjectKeys } from '../../../mol-util/type-helpers';
const Description = 'Assigns colors to confal pyramids';
const PyramidsColors = ColorMap({ ...NtCColors });
export const ConfalPyramidsColorThemeParams = {
    colors: PD.MappedStatic('default', {
        'default': PD.EmptyGroup(),
        'custom': PD.Group(getColorMapParams(PyramidsColors))
    }),
};
export function getConfalPyramidsColorThemeParams(ctx) {
    return PD.clone(ConfalPyramidsColorThemeParams);
}
export function ConfalPyramidsColorTheme(ctx, props) {
    const colorMap = props.colors.name === 'default' ? PyramidsColors : props.colors.params;
    function color(location, isSecondary) {
        var _a;
        if (CPT.isLocation(location)) {
            const { step, isLower } = location.data;
            const key = step.NtC + `_${isLower ? 'Lwr' : 'Upr'}`;
            return (_a = colorMap[key]) !== null && _a !== void 0 ? _a : ErrorColor;
        }
        return ErrorColor;
    }
    return {
        factory: ConfalPyramidsColorTheme,
        granularity: 'group',
        color,
        props,
        description: Description,
        legend: TableLegend(ObjectKeys(colorMap).map(k => [k.replace('_', ' '), colorMap[k]]).concat([['Error', ErrorColor]])),
    };
}
export const ConfalPyramidsColorThemeProvider = {
    name: 'confal-pyramids',
    label: 'Confal Pyramids',
    category: ColorTheme.Category.Residue,
    factory: ConfalPyramidsColorTheme,
    getParams: getConfalPyramidsColorThemeParams,
    defaultValues: PD.getDefaultValues(ConfalPyramidsColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure && ctx.structure.models.some(m => Dnatco.isApplicable(m)),
    ensureCustomProperties: {
        attach: (ctx, data) => data.structure ? ConfalPyramidsProvider.attach(ctx, data.structure.models[0], void 0, true) : Promise.resolve(),
        detach: (data) => data.structure && ConfalPyramidsProvider.ref(data.structure.models[0], false)
    }
};
