/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsMeshParams, UnitsMeshVisual } from '../units-visual';
import { MolecularSurfaceCalculationParams } from '../../../mol-math/geometry/molecular-surface';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { computeStructureMolecularSurface, computeUnitMolecularSurface } from './util/molecular-surface';
import { computeMarchingCubesMesh } from '../../../mol-geo/util/marching-cubes/algorithm';
import { ElementIterator, getElementLoci, eachElement, getSerialElementLoci, eachSerialElement } from './util/element';
import { CommonSurfaceParams } from './util/common';
import { Sphere3D } from '../../../mol-math/geometry';
import { applyMeshColorSmoothing } from '../../../mol-geo/geometry/mesh/color-smoothing';
import { ColorSmoothingParams, getColorSmoothingProps } from '../../../mol-geo/geometry/base';
import { ValueCell } from '../../../mol-util';
import { ComplexMeshVisual } from '../complex-visual';
export const MolecularSurfaceMeshParams = {
    ...UnitsMeshParams,
    ...MolecularSurfaceCalculationParams,
    ...CommonSurfaceParams,
    ...ColorSmoothingParams,
};
//
async function createMolecularSurfaceMesh(ctx, unit, structure, theme, props, mesh) {
    const { transform, field, idField, resolution, maxRadius } = await computeUnitMolecularSurface(structure, unit, theme.size, props).runInContext(ctx.runtime);
    const params = {
        isoLevel: props.probeRadius,
        scalarField: field,
        idField
    };
    const surface = await computeMarchingCubesMesh(params, mesh).runAsChild(ctx.runtime);
    if (props.includeParent) {
        const iterations = Math.ceil(2 / props.resolution);
        Mesh.smoothEdges(surface, { iterations, maxNewEdgeLength: Math.sqrt(2) });
    }
    Mesh.transform(surface, transform);
    if (ctx.webgl && !ctx.webgl.isWebGL2) {
        Mesh.uniformTriangleGroup(surface);
        ValueCell.updateIfChanged(surface.varyingGroup, false);
    }
    else {
        ValueCell.updateIfChanged(surface.varyingGroup, true);
    }
    const sphere = Sphere3D.expand(Sphere3D(), unit.boundary.sphere, maxRadius);
    surface.setBoundingSphere(sphere);
    surface.meta.resolution = resolution;
    return surface;
}
export function MolecularSurfaceMeshVisual(materialId) {
    return UnitsMeshVisual({
        defaultProps: PD.getDefaultValues(MolecularSurfaceMeshParams),
        createGeometry: createMolecularSurfaceMesh,
        createLocationIterator: ElementIterator.fromGroup,
        getLoci: getElementLoci,
        eachLocation: eachElement,
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
            const csp = getColorSmoothingProps(props.smoothColors, theme.color.preferSmoothing, resolution);
            if (csp) {
                applyMeshColorSmoothing(values, csp.resolution, csp.stride, webgl, colorTexture);
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
    const { transform, field, idField, resolution, maxRadius } = await computeStructureMolecularSurface(structure, theme.size, props).runInContext(ctx.runtime);
    const params = {
        isoLevel: props.probeRadius,
        scalarField: field,
        idField
    };
    const surface = await computeMarchingCubesMesh(params, mesh).runAsChild(ctx.runtime);
    if (props.includeParent) {
        const iterations = Math.ceil(2 / props.resolution);
        Mesh.smoothEdges(surface, { iterations, maxNewEdgeLength: Math.sqrt(2) });
    }
    Mesh.transform(surface, transform);
    if (ctx.webgl && !ctx.webgl.isWebGL2) {
        Mesh.uniformTriangleGroup(surface);
        ValueCell.updateIfChanged(surface.varyingGroup, false);
    }
    else {
        ValueCell.updateIfChanged(surface.varyingGroup, true);
    }
    const sphere = Sphere3D.expand(Sphere3D(), structure.boundary.sphere, maxRadius);
    surface.setBoundingSphere(sphere);
    surface.meta.resolution = resolution;
    return surface;
}
export function StructureMolecularSurfaceMeshVisual(materialId) {
    return ComplexMeshVisual({
        defaultProps: PD.getDefaultValues(MolecularSurfaceMeshParams),
        createGeometry: createStructureMolecularSurfaceMesh,
        createLocationIterator: ElementIterator.fromStructure,
        getLoci: getSerialElementLoci,
        eachLocation: eachSerialElement,
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
            const csp = getColorSmoothingProps(props.smoothColors, theme.color.preferSmoothing, resolution);
            if (csp) {
                applyMeshColorSmoothing(values, csp.resolution, csp.stride, webgl, colorTexture);
                geometry.meta.colorTexture = values.tColorGrid.ref.value;
            }
        },
        dispose: (geometry) => {
            var _a;
            (_a = geometry.meta.colorTexture) === null || _a === void 0 ? void 0 : _a.destroy();
        }
    }, materialId);
}
