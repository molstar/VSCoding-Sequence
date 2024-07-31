/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsLinesVisual, UnitsLinesParams } from '../units-visual';
import { MolecularSurfaceCalculationParams } from '../../../mol-math/geometry/molecular-surface';
import { Lines } from '../../../mol-geo/geometry/lines/lines';
import { computeUnitMolecularSurface } from './util/molecular-surface';
import { computeMarchingCubesLines } from '../../../mol-geo/util/marching-cubes/algorithm';
import { ElementIterator, getElementLoci, eachElement } from './util/element';
import { CommonSurfaceParams } from './util/common';
import { Sphere3D } from '../../../mol-math/geometry';
export const MolecularSurfaceWireframeParams = {
    ...UnitsLinesParams,
    ...MolecularSurfaceCalculationParams,
    ...CommonSurfaceParams,
    sizeFactor: PD.Numeric(1.5, { min: 0, max: 10, step: 0.1 }),
};
//
async function createMolecularSurfaceWireframe(ctx, unit, structure, theme, props, lines) {
    const { transform, field, idField, maxRadius } = await computeUnitMolecularSurface(structure, unit, theme.size, props).runInContext(ctx.runtime);
    const params = {
        isoLevel: props.probeRadius,
        scalarField: field,
        idField
    };
    const wireframe = await computeMarchingCubesLines(params, lines).runAsChild(ctx.runtime);
    Lines.transform(wireframe, transform);
    const sphere = Sphere3D.expand(Sphere3D(), unit.boundary.sphere, maxRadius);
    wireframe.setBoundingSphere(sphere);
    return wireframe;
}
export function MolecularSurfaceWireframeVisual(materialId) {
    return UnitsLinesVisual({
        defaultProps: PD.getDefaultValues(MolecularSurfaceWireframeParams),
        createGeometry: createMolecularSurfaceWireframe,
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
            if (newProps.includeParent !== currentProps.includeParent)
                state.createGeometry = true;
        }
    }, materialId);
}
