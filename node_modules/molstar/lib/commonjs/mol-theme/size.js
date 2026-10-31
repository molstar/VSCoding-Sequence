"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SizeTheme = void 0;
const uniform_1 = require("./size/uniform");
const theme_1 = require("../mol-theme/theme");
const physical_1 = require("./size/physical");
const mol_util_1 = require("../mol-util");
const shape_group_1 = require("./size/shape-group");
const uncertainty_1 = require("./size/uncertainty");
var SizeTheme;
(function (SizeTheme) {
    SizeTheme.EmptyFactory = () => SizeTheme.Empty;
    SizeTheme.Empty = { factory: SizeTheme.EmptyFactory, granularity: 'uniform', size: () => 1, props: {} };
    function areEqual(themeA, themeB) {
        return themeA.contextHash === themeB.contextHash && themeA.factory === themeB.factory && (0, mol_util_1.deepEqual)(themeA.props, themeB.props);
    }
    SizeTheme.areEqual = areEqual;
    SizeTheme.EmptyProvider = { name: '', label: '', category: '', factory: SizeTheme.EmptyFactory, getParams: () => ({}), defaultValues: {}, isApplicable: () => true };
    function createRegistry() {
        return new theme_1.ThemeRegistry(SizeTheme.BuiltIn, SizeTheme.EmptyProvider);
    }
    SizeTheme.createRegistry = createRegistry;
    SizeTheme.BuiltIn = {
        'physical': physical_1.PhysicalSizeThemeProvider,
        'shape-group': shape_group_1.ShapeGroupSizeThemeProvider,
        'uncertainty': uncertainty_1.UncertaintySizeThemeProvider,
        'uniform': uniform_1.UniformSizeThemeProvider
    };
})(SizeTheme || (exports.SizeTheme = SizeTheme = {}));
