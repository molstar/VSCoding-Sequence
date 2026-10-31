/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Color, ColorScale } from '../../../mol-util/color';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ColorTheme } from '../../../mol-theme/color';
import { CrossLinkRestraintProvider, CrossLinkRestraint } from './property';
const DefaultColor = Color(0xCCCCCC);
const Description = 'Colors cross-links by the deviation of the observed distance versus the modeled distance (e.g. modeled / `ihm_cross_link_restraint.distance_threshold`).';
export const CrossLinkColorThemeParams = {
    domain: PD.Interval([0.5, 1.5], { step: 0.01 }),
    list: PD.ColorList('red-grey', { presetKind: 'scale' }),
};
export function getCrossLinkColorThemeParams(ctx) {
    return CrossLinkColorThemeParams; // TODO return copy
}
export function CrossLinkColorTheme(ctx, props) {
    let color;
    let scale = undefined;
    const crossLinkRestraints = ctx.structure && CrossLinkRestraintProvider.get(ctx.structure).value;
    if (crossLinkRestraints) {
        scale = ColorScale.create({
            domain: props.domain,
            listOrName: props.list.colors
        });
        const scaleColor = scale.color;
        color = (location) => {
            if (CrossLinkRestraint.isLocation(location)) {
                const pair = crossLinkRestraints.pairs[location.element];
                if (pair) {
                    return scaleColor(CrossLinkRestraint.distance(pair) / pair.distanceThreshold);
                }
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: CrossLinkColorTheme,
        granularity: 'group',
        color,
        props,
        description: Description,
        legend: scale ? scale.legend : undefined
    };
}
export const CrossLinkColorThemeProvider = {
    name: 'cross-link',
    label: 'Cross Link',
    category: ColorTheme.Category.Misc,
    factory: CrossLinkColorTheme,
    getParams: getCrossLinkColorThemeParams,
    defaultValues: PD.getDefaultValues(CrossLinkColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure && CrossLinkRestraint.isApplicable(ctx.structure),
    ensureCustomProperties: {
        attach: (ctx, data) => data.structure ? CrossLinkRestraintProvider.attach(ctx, data.structure, void 0, true) : Promise.resolve(),
        detach: (data) => data.structure && CrossLinkRestraintProvider.ref(data.structure, false)
    }
};
