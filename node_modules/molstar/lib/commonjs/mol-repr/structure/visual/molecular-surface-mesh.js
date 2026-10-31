"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MolecularSurfaceMeshParams = void 0;
exports.MolecularSurfaceMeshVisual = MolecularSurfaceMeshVisual;
exports.StructureMolecularSurfaceMeshVisual = StructureMolecularSurfaceMeshVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const units_visual_1 = require("../units-visual");
const molecular_surface_1 = require("../../../mol-math/geometry/molecular-surface");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const molecular_surface_2 = require("./util/molecular-surface");
const algorithm_1 = require("../../../mol-geo/util/marching-cubes/algorithm");
const element_1 = require("./util/element");
const common_1 = require("./util/common");
const geometry_1 = require("../../../mol-math/geometry");
const color_smoothing_1 = require("../../../mol-geo/geometry/mesh/color-smoothing");
const base_1 = require("../../../mol-geo/geometry/base");
const mol_util_1 = require("../../../mol-util");
const complex_visual_1 = require("../complex-visual");
exports.MolecularSurfaceMeshParams = {
    ...units_visual_1.UnitsMeshParams,
    ...molecular_surface_1.MolecularSurfaceCalculationParams,
    ...common_1.CommonSurfaceParams,
    ...base_1.ColorSmoothingParams,
};
//
async function createMolecularSurfaceMesh(ctx, unit, structure, theme, props, mesh) {
    const { transform, field, idField, resolution, maxRadius } = await (0, molecular_surface_2.computeUnitMolecularSurface)(structure, unit, theme.size, props).runInContext(ctx.runtime);
    const params = {
        isoLevel: props.probeRadius,
        scalarField: field,
        idField
    };
    const surface = await (0, algorithm_1.computeMarchingCubesMesh)(params, mesh).runAsChild(ctx.runtime);
    if (props.includeParent) {
        const iterations = Math.ceil(2 / props.resolution);
        mesh_1.Mesh.smoothEdges(surface, { iterations, maxNewEdgeLength: Math.sqrt(2) });
    }
    mesh_1.Mesh.transform(surface, transform);
    if (ctx.webgl && !ctx.webgl.isWebGL2) {
        mesh_1.Mesh.uniformTriangleGroup(surface);
        mol_util_1.ValueCell.updateIfChanged(surface.varyingGroup, false);
    }
    else {
        mol_util_1.ValueCell.updateIfChanged(surface.varyingGroup, true);
    }
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, maxRadius);
    surface.setBoundingSphere(sphere);
    surface.meta.resolution = resolution;
    return surface;
}
function MolecularSurfaceMeshVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.MolecularSurfaceMeshParams),
        createGeometry: createMolecularSurfaceMesh,
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
            if (newProps.traceOnly !== currentProps.traceOnly)
                state.createGeometry = true;
            if (newProps.includeParent !== currentProps.includeParent)
                state.createGeometry = true;
            if (newProps.smoothColors.name !== currentProps.smoothColors.name) {
                state.updateColor = true;
            }
            else if (newProps.smoothColors.name === 'on' && currentProps.smoothColors.name === 'on') {
                if (newProps.smoothColors.params.resolutionFactor !== currentProps.smoothColors.params.resolutionFactor)
                    state.updateColor = true;
                if (newProps.smoothColors.params.sampleStride !== currentProps.smoothColors.params.sampleStride)
                    state.updateColor = true;
            }
        },
        processValues: (values, geometry, props, theme, webgl) => {
            const { resolution, colorTexture } = geometry.meta;
            const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, theme.color.preferSmoothing, resolution);
            if (csp) {
                (0, color_smoothing_1.applyMeshColorSmoothing)(values, csp.resolution, csp.stride, webgl, colorTexture);
                geometry.meta.colorTexture = values.tColorGrid.ref.value;
            }
        },
        dispose: (geometry) => {
            var _a;
            (_a = geometry.meta.colorTexture) === null || _a === void 0 ? void 0 : _a.destroy();
        }
    }, materialId);
}
//
async function createStructureMolecularSurfaceMesh(ctx, structure, theme, props, mesh) {
    const { transform, field, idField, resolution, maxRadius } = await (0, molecular_surface_2.computeStructureMolecularSurface)(structure, theme.size, props).runInContext(ctx.runtime);
    const params = {
        isoLevel: props.probeRadius,
        scalarField: field,
        idField
    };
    const surface = await (0, algorithm_1.computeMarchingCubesMesh)(params, mesh).runAsChild(ctx.runtime);
    if (props.includeParent) {
        const iterations = Math.ceil(2 / props.resolution);
        mesh_1.Mesh.smoothEdges(surface, { iterations, maxNewEdgeLength: Math.sqrt(2) });
    }
    mesh_1.Mesh.transform(surface, transform);
    if (ctx.webgl && !ctx.webgl.isWebGL2) {
        mesh_1.Mesh.uniformTriangleGroup(surface);
        mol_util_1.ValueCell.updateIfChanged(surface.varyingGroup, false);
    }
    else {
        mol_util_1.ValueCell.updateIfChanged(surface.varyingGroup, true);
    }
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), structure.boundary.sphere, maxRadius);
    surface.setBoundingSphere(sphere);
    surface.meta.resolution = resolution;
    return surface;
}
function StructureMolecularSurfaceMeshVisual(materialId) {
    return (0, complex_visual_1.ComplexMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.MolecularSurfaceMeshParams),
        createGeometry: createStructureMolecularSurfaceMesh,
        createLocationIterator: element_1.ElementIterator.fromStructure,
        getLoci: element_1.getSerialElementLoci,
        eachLocation: element_1.eachSerialElement,
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
            if (newProps.traceOnly !== currentProps.traceOnly)
                state.createGeometry = true;
            if (newProps.includeParent !== currentProps.includeParent)
                state.createGeometry = true;
            if (newProps.smoothColors.name !== currentProps.smoothColors.name) {
                state.updateColor = true;
            }
            else if (newProps.smoothColors.name === 'on' && currentProps.smoothColors.name === 'on') {
                if (newProps.smoothColors.params.resolutionFactor !== currentProps.smoothColors.params.resolutionFactor)
                    state.updateColor = true;
                if (newProps.smoothColors.params.sampleStride !== currentProps.smoothColors.params.sampleStride)
                    state.updateColor = true;
            }
        },
        processValues: (values, geometry, props, theme, webgl) => {
            const { resolution, colorTexture } = geometry.meta;
            const csp = (0, base_1.getColorSmoothingProps)(props.smoothColors, theme.color.preferSmoothing, resolution);
            if (csp) {
                (0, color_smoothing_1.applyMeshColorSmoothing)(values, csp.resolution, csp.stride, webgl, colorTexture);
                geometry.meta.colorTexture = values.tColorGrid.ref.value;
            }
        },
        dispose: (geometry) => {
            var _a;
            (_a = geometry.meta.colorTexture) === null || _a === void 0 ? void 0 : _a.destroy();
        }
    }, materialId);
}
