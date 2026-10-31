"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MolecularSurfaceWireframeParams = void 0;
exports.MolecularSurfaceWireframeVisual = MolecularSurfaceWireframeVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const units_visual_1 = require("../units-visual");
const molecular_surface_1 = require("../../../mol-math/geometry/molecular-surface");
const lines_1 = require("../../../mol-geo/geometry/lines/lines");
const molecular_surface_2 = require("./util/molecular-surface");
const algorithm_1 = require("../../../mol-geo/util/marching-cubes/algorithm");
const element_1 = require("./util/element");
const common_1 = require("./util/common");
const geometry_1 = require("../../../mol-math/geometry");
exports.MolecularSurfaceWireframeParams = {
    ...units_visual_1.UnitsLinesParams,
    ...molecular_surface_1.MolecularSurfaceCalculationParams,
    ...common_1.CommonSurfaceParams,
    sizeFactor: param_definition_1.ParamDefinition.Numeric(1.5, { min: 0, max: 10, step: 0.1 }),
};
//
async function createMolecularSurfaceWireframe(ctx, unit, structure, theme, props, lines) {
    const { transform, field, idField, maxRadius } = await (0, molecular_surface_2.computeUnitMolecularSurface)(structure, unit, theme.size, props).runInContext(ctx.runtime);
    const params = {
        isoLevel: props.probeRadius,
        scalarField: field,
        idField
    };
    const wireframe = await (0, algorithm_1.computeMarchingCubesLines)(params, lines).runAsChild(ctx.runtime);
    lines_1.Lines.transform(wireframe, transform);
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, maxRadius);
    wireframe.setBoundingSphere(sphere);
    return wireframe;
}
function MolecularSurfaceWireframeVisual(materialId) {
    return (0, units_visual_1.UnitsLinesVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.MolecularSurfaceWireframeParams),
        createGeometry: createMolecularSurfaceWireframe,
        createLocationIterator: element_1.ElementIterator.fromGroup,
        getLoci: element_1.getElementLoci,
        eachLocation: element_1.eachElement,
        setUpdateState: (state, newProps, currentProps) => {
            if (newProps.resolution !== currentProps.resolution)
                state.createGeometry = true;
            if (newProps.probeRadius !== currentProps.probeRadius)
                state.createGeometry = true;
            if (newProps.probePositions !== currentProps.probePositions)
                state.createGeometry = true;
            if (newProps.ignoreHydrogens !== currentProps.ignoreHydrogens)
                state.createGeometry = true;
            if (newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant)
                state.createGeometry = true;
            if (newProps.includeParent !== currentProps.includeParent)
                state.createGeometry = true;
        }
    }, materialId);
}
