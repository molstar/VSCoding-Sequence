"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembraneOrientationProvider = exports.MembraneOrientation = exports.MembraneOrientationParams = void 0;
const param_definition_1 = require("../../mol-util/param-definition");
const structure_1 = require("../../mol-model/structure");
const custom_property_1 = require("../../mol-model/custom-property");
const algorithm_1 = require("./algorithm");
const custom_structure_property_1 = require("../../mol-model-props/common/custom-structure-property");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const base_1 = require("../../mol-script/runtime/query/base");
const symbol_1 = require("../../mol-script/language/symbol");
const type_1 = require("../../mol-script/language/type");
exports.MembraneOrientationParams = {
    ...algorithm_1.ANVILParams
};
var MembraneOrientation;
(function (MembraneOrientation) {
    let Tag;
    (function (Tag) {
        Tag["Representation"] = "membrane-orientation-3d";
    })(Tag = MembraneOrientation.Tag || (MembraneOrientation.Tag = {}));
    const pos = (0, linear_algebra_1.Vec3)();
    MembraneOrientation.symbols = {
        isTransmembrane: base_1.QuerySymbolRuntime.Dynamic((0, symbol_1.CustomPropSymbol)('computed', 'membrane-orientation.is-transmembrane', type_1.Type.Bool), ctx => {
            const { unit, structure } = ctx.element;
            const { x, y, z } = structure_1.StructureProperties.atom;
            if (!structure_1.Unit.isAtomic(unit))
                return 0;
            const membraneOrientation = exports.MembraneOrientationProvider.get(structure).value;
            if (!membraneOrientation)
                return 0;
            linear_algebra_1.Vec3.set(pos, x(ctx.element), y(ctx.element), z(ctx.element));
            const { normalVector, planePoint1, planePoint2 } = membraneOrientation;
            return (0, algorithm_1.isInMembranePlane)(pos, normalVector, planePoint1, planePoint2);
        })
    };
})(MembraneOrientation || (exports.MembraneOrientation = MembraneOrientation = {}));
exports.MembraneOrientationProvider = custom_structure_property_1.CustomStructureProperty.createProvider({
    label: 'Membrane Orientation',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'anvil_computed_membrane_orientation',
        symbols: MembraneOrientation.symbols,
        // TODO `cifExport`
    }),
    type: 'root',
    defaultParams: exports.MembraneOrientationParams,
    getParams: (data) => exports.MembraneOrientationParams,
    isApplicable: (data) => true,
    obtain: async (ctx, data, props) => {
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.MembraneOrientationParams), ...props };
        return { value: await computeAnvil(ctx, data, p) };
    }
});
async function computeAnvil(ctx, data, props) {
    const p = { ...param_definition_1.ParamDefinition.getDefaultValues(algorithm_1.ANVILParams), ...props };
    return await (0, algorithm_1.computeANVIL)(data, p).runInContext(ctx.runtime);
}
