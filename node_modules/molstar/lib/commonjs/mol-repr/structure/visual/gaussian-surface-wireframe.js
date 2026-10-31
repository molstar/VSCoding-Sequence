"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaussianWireframeParams = void 0;
exports.GaussianWireframeVisual = GaussianWireframeVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const lines_1 = require("../../../mol-geo/geometry/lines/lines");
const gaussian_1 = require("./util/gaussian");
const algorithm_1 = require("../../../mol-geo/util/marching-cubes/algorithm");
const units_visual_1 = require("../units-visual");
const element_1 = require("./util/element");
const geometry_1 = require("../../../mol-math/geometry");
async function createGaussianWireframe(ctx, unit, structure, theme, props, lines) {
    const { smoothness } = props;
    const { transform, field, idField, maxRadius } = await (0, gaussian_1.computeUnitGaussianDensity)(structure, unit, theme.size, props).runInContext(ctx.runtime);
    const params = {
        isoLevel: Math.exp(-smoothness),
        scalarField: field,
        idField
    };
    const wireframe = await (0, algorithm_1.computeMarchingCubesLines)(params, lines).runAsChild(ctx.runtime);
    lines_1.Lines.transform(wireframe, transform);
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, maxRadius);
    wireframe.setBoundingSphere(sphere);
    return wireframe;
}
exports.GaussianWireframeParams = {
    ...units_visual_1.UnitsLinesParams,
    ...gaussian_1.GaussianDensityParams,
    sizeFactor: param_definition_1.ParamDefinition.Numeric(3, { min: 0, max: 10, step: 0.1 }),
    lineSizeAttenuation: param_definition_1.ParamDefinition.Boolean(false),
    ignoreHydrogens: param_definition_1.ParamDefinition.Boolean(false),
    ignoreHydrogensVariant: param_definition_1.ParamDefinition.Select('all', param_definition_1.ParamDefinition.arrayToOptions(['all', 'non-polar'])),
    includeParent: param_definition_1.ParamDefinition.Boolean(false, { isHidden: true }),
};
function GaussianWireframeVisual(materialId) {
    return (0, units_visual_1.UnitsLinesVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.GaussianWireframeParams),
        createGeometry: createGaussianWireframe,
        createLocationIterator: element_1.ElementIterator.fromGroup,
        getLoci: element_1.getElementLoci,
        eachLocation: element_1.eachElement,
        setUpdateState: (state, newProps, currentProps) => {
            if (newProps.resolution !== currentProps.resolution)
                state.createGeometry = true;
            if (newProps.radiusOffset !== currentProps.radiusOffset)
                state.createGeometry = true;
            if (newProps.smoothness !== currentProps.smoothness)
                state.createGeometry = true;
            if (newProps.ignoreHydrogens !== currentProps.ignoreHydrogens)
                state.createGeometry = true;
            if (newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant)
                state.createGeometry = true;
            if (newProps.traceOnly !== currentProps.traceOnly)
                state.createGeometry = true;
            if (newProps.includeParent !== currentProps.includeParent)
                state.createGeometry = true;
        }
    }, materialId);
}
