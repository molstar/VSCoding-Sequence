/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../../mol-geo/geometry/mesh/mesh-builder';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { PolymerGapIterator, PolymerGapLocationIterator, getPolymerGapElementLoci, eachPolymerGapElement } from './util/polymer';
import { addFixedCountDashedCylinder } from '../../../mol-geo/geometry/mesh/builder/cylinder';
import { UnitsMeshParams, UnitsMeshVisual } from '../units-visual';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
import { Sphere3D } from '../../../mol-math/geometry';
// import { TriangularPyramid } from '../../../mol-geo/primitive/pyramid';
const segmentCount = 10;
export const PolymerGapCylinderParams = {
    sizeFactor: PD.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
    radialSegments: PD.Numeric(16, { min: 2, max: 56, step: 2 }, BaseGeometry.CustomQualityParamInfo),
};
export const DefaultPolymerGapCylinderProps = PD.getDefaultValues(PolymerGapCylinderParams);
// const triangularPyramid = TriangularPyramid()
// const t = Mat4.identity()
// const pd = Vec3.zero()
function createPolymerGapCylinderMesh(ctx, unit, structure, theme, props, mesh) {
    const polymerGapCount = unit.gapElements.length;
    if (!polymerGapCount)
        return Mesh.createEmpty(mesh);
    const { sizeFactor, radialSegments } = props;
    const vertexCountEstimate = segmentCount * radialSegments * 2 * polymerGapCount * 2;
    const builderState = MeshBuilder.createState(vertexCountEstimate, vertexCountEstimate / 10, mesh);
    const pA = Vec3();
    const pB = Vec3();
    const cylinderProps = {
        radiusTop: 1, radiusBottom: 1, topCap: true, bottomCap: true, radialSegments
    };
    let i = 0;
    const polymerGapIt = PolymerGapIterator(structure, unit);
    while (polymerGapIt.hasNext) {
        const { centerA, centerB } = polymerGapIt.move();
        if (centerA.element === centerB.element) {
            // TODO
            // builderState.currentGroup = i
            // pos(centerA.element, pA)
            // Vec3.add(pd, pA, Vec3.create(1, 0, 0))
            // Mat4.targetTo(t, pA, pd, Vec3.create(0, 1, 0))
            // Mat4.setTranslation(t, pA)
            // Mat4.scale(t, t, Vec3.create(0.7, 0.7, 2.5))
            // MeshBuilder.addPrimitive(builderState, t, triangularPyramid)
        }
        else {
            unit.conformation.invariantPosition(centerA.element, pA);
            unit.conformation.invariantPosition(centerB.element, pB);
            cylinderProps.radiusTop = cylinderProps.radiusBottom = theme.size.size(centerA) * sizeFactor;
            builderState.currentGroup = i;
            addFixedCountDashedCylinder(builderState, pA, pB, 0.5, segmentCount, false, cylinderProps);
            cylinderProps.radiusTop = cylinderProps.radiusBottom = theme.size.size(centerB) * sizeFactor;
            builderState.currentGroup = i + 1;
            addFixedCountDashedCylinder(builderState, pB, pA, 0.5, segmentCount, false, cylinderProps);
        }
        i += 2;
    }
    const m = MeshBuilder.getMesh(builderState);
    const sphere = Sphere3D.expand(Sphere3D(), unit.boundary.sphere, 1 * props.sizeFactor);
    m.setBoundingSphere(sphere);
    return m;
}
export const PolymerGapParams = {
    ...UnitsMeshParams,
    ...PolymerGapCylinderParams
};
export function PolymerGapVisual(materialId) {
    return UnitsMeshVisual({
        defaultProps: PD.getDefaultValues(PolymerGapParams),
        createGeometry: createPolymerGapCylinderMesh,
        createLocationIterator: (structureGroup) => PolymerGapLocationIterator.fromGroup(structureGroup, { asSecondary: true }),
        getLoci: getPolymerGapElementLoci,
        eachLocation: eachPolymerGapElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.radialSegments !== currentProps.radialSegments);
        }
    }, materialId);
}
