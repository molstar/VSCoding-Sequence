"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolymerTubeParams = exports.DefaultPolymerTubeMeshProps = exports.PolymerTubeMeshParams = void 0;
exports.PolymerTubeVisual = PolymerTubeVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const polymer_1 = require("./util/polymer");
const types_1 = require("../../../mol-model/structure/model/types");
const tube_1 = require("../../../mol-geo/geometry/mesh/builder/tube");
const units_visual_1 = require("../units-visual");
const sheet_1 = require("../../../mol-geo/geometry/mesh/builder/sheet");
const ribbon_1 = require("../../../mol-geo/geometry/mesh/builder/ribbon");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const sphere_1 = require("../../../mol-geo/geometry/mesh/builder/sphere");
const base_1 = require("../../../mol-geo/geometry/base");
const geometry_1 = require("../../../mol-math/geometry");
exports.PolymerTubeMeshParams = {
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
    detail: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 3, step: 1 }, base_1.BaseGeometry.CustomQualityParamInfo),
    linearSegments: param_definition_1.ParamDefinition.Numeric(8, { min: 1, max: 48, step: 1 }, base_1.BaseGeometry.CustomQualityParamInfo),
    radialSegments: param_definition_1.ParamDefinition.Numeric(16, { min: 2, max: 56, step: 2 }, base_1.BaseGeometry.CustomQualityParamInfo),
};
exports.DefaultPolymerTubeMeshProps = param_definition_1.ParamDefinition.getDefaultValues(exports.PolymerTubeMeshParams);
const tmpV1 = (0, linear_algebra_1.Vec3)();
function createPolymerTubeMesh(ctx, unit, structure, theme, props, mesh) {
    const polymerElementCount = unit.polymerElements.length;
    if (!polymerElementCount)
        return mesh_1.Mesh.createEmpty(mesh);
    const { sizeFactor, detail, linearSegments, radialSegments } = props;
    const vertexCount = linearSegments * radialSegments * polymerElementCount + (radialSegments + 1) * polymerElementCount * 2;
    const builderState = mesh_builder_1.MeshBuilder.createState(vertexCount, vertexCount / 10, mesh);
    const state = (0, polymer_1.createCurveSegmentState)(linearSegments);
    const { curvePoints, normalVectors, binormalVectors, widthValues, heightValues } = state;
    let i = 0;
    const polymerTraceIt = (0, polymer_1.PolymerTraceIterator)(unit, structure, { ignoreSecondaryStructure: true });
    while (polymerTraceIt.hasNext) {
        const v = polymerTraceIt.move();
        builderState.currentGroup = i;
        const isNucleicType = (0, types_1.isNucleic)(v.moleculeType);
        const shift = isNucleicType ? polymer_1.NucleicShift : polymer_1.StandardShift;
        (0, polymer_1.interpolateCurveSegment)(state, v, polymer_1.StandardTension, shift);
        const startCap = v.coarseBackboneFirst || v.first;
        const endCap = v.coarseBackboneLast || v.last;
        const s0 = theme.size.size(v.centerPrev) * sizeFactor;
        const s1 = theme.size.size(v.center) * sizeFactor;
        const s2 = theme.size.size(v.centerNext) * sizeFactor;
        (0, polymer_1.interpolateSizes)(state, s0, s1, s2, s0, s1, s2, shift);
        let segmentCount = linearSegments;
        if (v.initial) {
            segmentCount = Math.max(Math.round(linearSegments * shift), 1);
            const offset = linearSegments - segmentCount;
            curvePoints.copyWithin(0, offset * 3);
            binormalVectors.copyWithin(0, offset * 3);
            normalVectors.copyWithin(0, offset * 3);
            widthValues.copyWithin(0, offset * 3);
            heightValues.copyWithin(0, offset * 3);
            linear_algebra_1.Vec3.fromArray(tmpV1, curvePoints, 3);
            linear_algebra_1.Vec3.normalize(tmpV1, linear_algebra_1.Vec3.sub(tmpV1, v.p2, tmpV1));
            linear_algebra_1.Vec3.scaleAndAdd(tmpV1, v.p2, tmpV1, s1 * polymer_1.OverhangFactor);
            linear_algebra_1.Vec3.toArray(tmpV1, curvePoints, 0);
        }
        else if (v.final) {
            segmentCount = Math.max(Math.round(linearSegments * (1 - shift)), 1);
            linear_algebra_1.Vec3.fromArray(tmpV1, curvePoints, segmentCount * 3 - 3);
            linear_algebra_1.Vec3.normalize(tmpV1, linear_algebra_1.Vec3.sub(tmpV1, v.p2, tmpV1));
            linear_algebra_1.Vec3.scaleAndAdd(tmpV1, v.p2, tmpV1, s1 * polymer_1.OverhangFactor);
            linear_algebra_1.Vec3.toArray(tmpV1, curvePoints, segmentCount * 3);
        }
        if (v.initial === true && v.final === true) {
            (0, sphere_1.addSphere)(builderState, v.p2, s1 * 2, detail);
        }
        else if (radialSegments === 2) {
            (0, ribbon_1.addRibbon)(builderState, curvePoints, normalVectors, binormalVectors, segmentCount, widthValues, heightValues, 0);
        }
        else if (radialSegments === 4) {
            (0, sheet_1.addSheet)(builderState, curvePoints, normalVectors, binormalVectors, segmentCount, widthValues, heightValues, 0, startCap, endCap);
        }
        else {
            (0, tube_1.addTube)(builderState, curvePoints, normalVectors, binormalVectors, segmentCount, radialSegments, widthValues, heightValues, startCap, endCap, 'elliptical');
        }
        ++i;
    }
    const m = mesh_builder_1.MeshBuilder.getMesh(builderState);
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, 1 * props.sizeFactor);
    m.setBoundingSphere(sphere);
    return m;
}
exports.PolymerTubeParams = {
    ...units_visual_1.UnitsMeshParams,
    ...exports.PolymerTubeMeshParams
};
function PolymerTubeVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.PolymerTubeParams),
        createGeometry: createPolymerTubeMesh,
        createLocationIterator: (structureGroup) => polymer_1.PolymerLocationIterator.fromGroup(structureGroup, { asSecondary: true }),
        getLoci: polymer_1.getPolymerElementLoci,
        eachLocation: polymer_1.eachPolymerElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.detail !== currentProps.detail ||
                newProps.linearSegments !== currentProps.linearSegments ||
                newProps.radialSegments !== currentProps.radialSegments);
        }
    }, materialId);
}
