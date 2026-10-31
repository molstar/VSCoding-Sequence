/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { UniformSizeThemeProvider } from './size/uniform';
import { ThemeRegistry } from '../mol-theme/theme';
import { PhysicalSizeThemeProvider } from './size/physical';
import { deepEqual } from '../mol-util';
import { ShapeGroupSizeThemeProvider } from './size/shape-group';
import { UncertaintySizeThemeProvider } from './size/uncertainty';
export { SizeTheme };
var SizeTheme;
(function (SizeTheme) {
    SizeTheme.EmptyFactory = () => SizeTheme.Empty;
    SizeTheme.Empty = { factory: SizeTheme.EmptyFactory, granularity: 'uniform', size: () => 1, props: {} };
    function areEqual(themeA, themeB) {
        return themeA.contextHash === themeB.contextHash && themeA.factory === themeB.factory && deepEqual(themeA.props, themeB.props);
    }
    SizeTheme.areEqual = areEqual;
    SizeTheme.EmptyProvider = { name: '', label: '', category: '', factory: SizeTheme.EmptyFactory, getParams: () => ({}), defaultValues: {}, isApplicable: () => true };
    function createRegistry() {
        return new ThemeRegistry(SizeTheme.BuiltIn, SizeTheme.EmptyProvider);
    }
    SizeTheme.createRegistry = createRegistry;
    SizeTheme.BuiltIn = {
        'physical': PhysicalSizeThemeProvider,
        'shape-group': ShapeGroupSizeThemeProvider,
        'uncertainty': UncertaintySizeThemeProvider,
        'uniform': UniformSizeThemeProvider
    };
})(SizeTheme || (SizeTheme = {}));
