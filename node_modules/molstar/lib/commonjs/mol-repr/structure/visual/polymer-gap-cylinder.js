"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolymerGapParams = exports.DefaultPolymerGapCylinderProps = exports.PolymerGapCylinderParams = void 0;
exports.PolymerGapVisual = PolymerGapVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const polymer_1 = require("./util/polymer");
const cylinder_1 = require("../../../mol-geo/geometry/mesh/builder/cylinder");
const units_visual_1 = require("../units-visual");
const base_1 = require("../../../mol-geo/geometry/base");
const geometry_1 = require("../../../mol-math/geometry");
// import { TriangularPyramid } from '../../../mol-geo/primitive/pyramid';
const segmentCount = 10;
exports.PolymerGapCylinderParams = {
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
    radialSegments: param_definition_1.ParamDefinition.Numeric(16, { min: 2, max: 56, step: 2 }, base_1.BaseGeometry.CustomQualityParamInfo),
};
exports.DefaultPolymerGapCylinderProps = param_definition_1.ParamDefinition.getDefaultValues(exports.PolymerGapCylinderParams);
// const triangularPyramid = TriangularPyramid()
// const t = Mat4.identity()
// const pd = Vec3.zero()
function createPolymerGapCylinderMesh(ctx, unit, structure, theme, props, mesh) {
    const polymerGapCount = unit.gapElements.length;
    if (!polymerGapCount)
        return mesh_1.Mesh.createEmpty(mesh);
    const { sizeFactor, radialSegments } = props;
    const vertexCountEstimate = segmentCount * radialSegments * 2 * polymerGapCount * 2;
    const builderState = mesh_builder_1.MeshBuilder.createState(vertexCountEstimate, vertexCountEstimate / 10, mesh);
    const pA = (0, linear_algebra_1.Vec3)();
    const pB = (0, linear_algebra_1.Vec3)();
    const cylinderProps = {
        radiusTop: 1, radiusBottom: 1, topCap: true, bottomCap: true, radialSegments
    };
    let i = 0;
    const polymerGapIt = (0, polymer_1.PolymerGapIterator)(structure, unit);
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
            (0, cylinder_1.addFixedCountDashedCylinder)(builderState, pA, pB, 0.5, segmentCount, false, cylinderProps);
            cylinderProps.radiusTop = cylinderProps.radiusBottom = theme.size.size(centerB) * sizeFactor;
            builderState.currentGroup = i + 1;
            (0, cylinder_1.addFixedCountDashedCylinder)(builderState, pB, pA, 0.5, segmentCount, false, cylinderProps);
        }
        i += 2;
    }
    const m = mesh_builder_1.MeshBuilder.getMesh(builderState);
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, 1 * props.sizeFactor);
    m.setBoundingSphere(sphere);
    return m;
}
exports.PolymerGapParams = {
    ...units_visual_1.UnitsMeshParams,
    ...exports.PolymerGapCylinderParams
};
function PolymerGapVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.PolymerGapParams),
        createGeometry: createPolymerGapCylinderMesh,
        createLocationIterator: (structureGroup) => polymer_1.PolymerGapLocationIterator.fromGroup(structureGroup, { asSecondary: true }),
        getLoci: polymer_1.getPolymerGapElementLoci,
        eachLocation: polymer_1.eachPolymerGapElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.radialSegments !== currentProps.radialSegments);
        }
    }, materialId);
}
