/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Color } from '../../mol-util/color';
import { ColorTheme } from '../../mol-theme/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ThemeDataContext } from '../../mol-theme/theme';
export declare function createProteopediaCustomTheme(colors: number[]): {
    name: string;
    label: string;
    category: string;
    factory: (ctx: ThemeDataContext, props: PD.Values<{
        colors: PD.ObjectList<PD.Normalize<{
            color: Color;
        }>>;
    }>) => ColorTheme<{
        colors: PD.ObjectList<PD.Normalize<{
            color: Color;
        }>>;
    }>;
    getParams: (ctx: ThemeDataContext) => {
        colors: PD.ObjectList<PD.Normalize<{
            color: Color;
        }>>;
    };
    defaultValues: PD.Values<{
        colors: PD.ObjectList<PD.Normalize<{
            color: Color;
        }>>;
    }>;
    isApplicable: (ctx: ThemeDataContext) => boolean;
};
