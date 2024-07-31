"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibleSurfaceAreaProvider = exports.AccessibleSurfaceAreaSymbols = exports.AccessibleSurfaceAreaParams = void 0;
const param_definition_1 = require("../../mol-util/param-definition");
const shrake_rupley_1 = require("./accessible-surface-area/shrake-rupley");
const structure_1 = require("../../mol-model/structure");
const custom_structure_property_1 = require("../common/custom-structure-property");
const compiler_1 = require("../../mol-script/runtime/query/compiler");
const symbol_1 = require("../../mol-script/language/symbol");
const type_1 = require("../../mol-script/language/type");
const custom_property_1 = require("../../mol-model/custom-property");
exports.AccessibleSurfaceAreaParams = {
    ...shrake_rupley_1.ShrakeRupleyComputationParams
};
exports.AccessibleSurfaceAreaSymbols = {
    isBuried: compiler_1.QuerySymbolRuntime.Dynamic((0, symbol_1.CustomPropSymbol)('computed', 'accessible-surface-area.is-buried', type_1.Type.Bool), ctx => {
        if (!structure_1.Unit.isAtomic(ctx.element.unit))
            return false;
        const accessibleSurfaceArea = exports.AccessibleSurfaceAreaProvider.get(ctx.element.structure).value;
        if (!accessibleSurfaceArea)
            return false;
        return shrake_rupley_1.AccessibleSurfaceArea.getFlag(ctx.element, accessibleSurfaceArea) === 1 /* AccessibleSurfaceArea.Flags.Buried */;
    }),
    isAccessible: compiler_1.QuerySymbolRuntime.Dynamic((0, symbol_1.CustomPropSymbol)('computed', 'accessible-surface-area.is-accessible', type_1.Type.Bool), ctx => {
        if (!structure_1.Unit.isAtomic(ctx.element.unit))
            return false;
        const accessibleSurfaceArea = exports.AccessibleSurfaceAreaProvider.get(ctx.element.structure).value;
        if (!accessibleSurfaceArea)
            return false;
        return shrake_rupley_1.AccessibleSurfaceArea.getFlag(ctx.element, accessibleSurfaceArea) === 2 /* AccessibleSurfaceArea.Flags.Accessible */;
    }),
};
exports.AccessibleSurfaceAreaProvider = custom_structure_property_1.CustomStructureProperty.createProvider({
    label: 'Accessible Surface Area',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'molstar_accessible_surface_area',
        symbols: exports.AccessibleSurfaceAreaSymbols,
        // TODO `cifExport`
    }),
    type: 'root',
    defaultParams: exports.AccessibleSurfaceAreaParams,
    getParams: (data) => exports.AccessibleSurfaceAreaParams,
    isApplicable: (data) => true,
    obtain: async (ctx, data, props) => {
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.AccessibleSurfaceAreaParams), ...props };
        return { value: await shrake_rupley_1.AccessibleSurfaceArea.compute(data, p).runInContext(ctx.runtime) };
    }
});
