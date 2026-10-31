/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
const Description = 'Gives everything the same, uniform size.';
export const UniformSizeThemeParams = {
    value: PD.Numeric(1, { min: 0, max: 20, step: 0.1 }),
};
export function getUniformSizeThemeParams(ctx) {
    return UniformSizeThemeParams; // TODO return copy
}
export function UniformSizeTheme(ctx, props) {
    const size = props.value;
    return {
        factory: UniformSizeTheme,
        granularity: 'uniform',
        size: () => size,
        props,
        description: Description
    };
}
export const UniformSizeThemeProvider = {
    name: 'uniform',
    label: 'Uniform',
    category: '',
    factory: UniformSizeTheme,
    getParams: getUniformSizeThemeParams,
    defaultValues: PD.getDefaultValues(UniformSizeThemeParams),
    isApplicable: (ctx) => true
};
