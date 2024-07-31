/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { StructureProperties, Unit } from '../../mol-model/structure';
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
import { ANVILParams, computeANVIL, isInMembranePlane } from './algorithm';
import { CustomStructureProperty } from '../../mol-model-props/common/custom-structure-property';
import { Vec3 } from '../../mol-math/linear-algebra';
import { QuerySymbolRuntime } from '../../mol-script/runtime/query/base';
import { CustomPropSymbol } from '../../mol-script/language/symbol';
import { Type } from '../../mol-script/language/type';
export const MembraneOrientationParams = {
    ...ANVILParams
};
export { MembraneOrientation };
var MembraneOrientation;
(function (MembraneOrientation) {
    let Tag;
    (function (Tag) {
        Tag["Representation"] = "membrane-orientation-3d";
    })(Tag = MembraneOrientation.Tag || (MembraneOrientation.Tag = {}));
    const pos = Vec3();
    MembraneOrientation.symbols = {
        isTransmembrane: QuerySymbolRuntime.Dynamic(CustomPropSymbol('computed', 'membrane-orientation.is-transmembrane', Type.Bool), ctx => {
            const { unit, structure } = ctx.element;
            const { x, y, z } = StructureProperties.atom;
            if (!Unit.isAtomic(unit))
                return 0;
            const membraneOrientation = MembraneOrientationProvider.get(structure).value;
            if (!membraneOrientation)
                return 0;
            Vec3.set(pos, x(ctx.element), y(ctx.element), z(ctx.element));
            const { normalVector, planePoint1, planePoint2 } = membraneOrientation;
            return isInMembranePlane(pos, normalVector, planePoint1, planePoint2);
        })
    };
})(MembraneOrientation || (MembraneOrientation = {}));
export const MembraneOrientationProvider = CustomStructureProperty.createProvider({
    label: 'Membrane Orientation',
    descriptor: CustomPropertyDescriptor({
        name: 'anvil_computed_membrane_orientation',
        symbols: MembraneOrientation.symbols,
        // TODO `cifExport`
    }),
    type: 'root',
    defaultParams: MembraneOrientationParams,
    getParams: (data) => MembraneOrientationParams,
    isApplicable: (data) => true,
    obtain: async (ctx, data, props) => {
        const p = { ...PD.getDefaultValues(MembraneOrientationParams), ...props };
        return { value: await computeAnvil(ctx, data, p) };
    }
});
async function computeAnvil(ctx, data, props) {
    const p = { ...PD.getDefaultValues(ANVILParams), ...props };
    return await computeANVIL(data, p).runInContext(ctx.runtime);
}
