import { isPositionLocation } from '../../mol-geo/util/location-iterator';
import { Vec3 } from '../../mol-math/linear-algebra';
import { ColorTheme } from '../../mol-theme/color';
import { ColorNames } from '../../mol-util/color/names';
export function CustomColorTheme(ctx, props) {
    var _a;
    const { radius, center } = (_a = ctx.structure) === null || _a === void 0 ? void 0 : _a.boundary.sphere;
    const radiusSq = Math.max(radius * radius, 0.001);
    const scale = ColorTheme.PaletteScale;
    return {
        factory: CustomColorTheme,
        granularity: 'vertex',
        color: location => {
            if (!isPositionLocation(location))
                return ColorNames.black;
            const dist = Vec3.squaredDistance(location.position, center);
            const t = Math.min(dist / radiusSq, 1);
            return ((t * scale) | 0);
        },
        palette: {
            filter: 'nearest',
            colors: [
                ColorNames.red,
                ColorNames.pink,
                ColorNames.violet,
                ColorNames.orange,
                ColorNames.yellow,
                ColorNames.green,
                ColorNames.blue
            ]
        },
        props: props,
        description: '',
    };
}
export const CustomColorThemeProvider = {
    name: 'basic-wrapper-custom-color-theme',
    label: 'Custom Color Theme',
    category: ColorTheme.Category.Misc,
    factory: CustomColorTheme,
    getParams: () => ({}),
    defaultValues: {},
    isApplicable: (ctx) => true,
};
