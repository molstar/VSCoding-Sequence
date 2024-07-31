/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ShapeGroup } from '../../mol-model/shape';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
const DefaultSize = 1;
const Description = 'Assigns sizes as defined by the shape object.';
export const ShapeGroupSizeThemeParams = {};
export function getShapeGroupSizeThemeParams(ctx) {
    return ShapeGroupSizeThemeParams; // TODO return copy
}
export function ShapeGroupSizeTheme(ctx, props) {
    return {
        factory: ShapeGroupSizeTheme,
        granularity: 'groupInstance',
        size: (location) => {
            if (ShapeGroup.isLocation(location)) {
                return location.shape.getSize(location.group, location.instance);
            }
            return DefaultSize;
        },
        props,
        description: Description
    };
}
export const ShapeGroupSizeThemeProvider = {
    name: 'shape-group',
    label: 'Shape Group',
    category: '',
    factory: ShapeGroupSizeTheme,
    getParams: getShapeGroupSizeThemeParams,
    defaultValues: PD.getDefaultValues(ShapeGroupSizeThemeParams),
    isApplicable: (ctx) => !!ctx.shape
};
