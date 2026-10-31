"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolymerBackboneCylinderParams = void 0;
exports.PolymerBackboneCylinderVisual = PolymerBackboneCylinderVisual;
exports.PolymerBackboneCylinderImpostorVisual = PolymerBackboneCylinderImpostorVisual;
exports.PolymerBackboneCylinderMeshVisual = PolymerBackboneCylinderMeshVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const structure_1 = require("../../../mol-model/structure");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const polymer_1 = require("./util/polymer");
const cylinder_1 = require("../../../mol-geo/geometry/mesh/builder/cylinder");
const units_visual_1 = require("../units-visual");
const base_1 = require("../../../mol-geo/geometry/base");
const geometry_1 = require("../../../mol-math/geometry");
const types_1 = require("../../../mol-model/structure/model/types");
const cylinders_1 = require("../../../mol-geo/geometry/cylinders/cylinders");
const cylinders_builder_1 = require("../../../mol-geo/geometry/cylinders/cylinders-builder");
const backbone_1 = require("./util/polymer/backbone");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3scale = linear_algebra_1.Vec3.scale;
const v3add = linear_algebra_1.Vec3.add;
const v3sub = linear_algebra_1.Vec3.sub;
exports.PolymerBackboneCylinderParams = {
    ...units_visual_1.UnitsMeshParams,
    ...units_visual_1.UnitsCylindersParams,
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.3, { min: 0, max: 10, step: 0.01 }),
    radialSegments: param_definition_1.ParamDefinition.Numeric(16, { min: 2, max: 56, step: 2 }, base_1.BaseGeometry.CustomQualityParamInfo),
    tryUseImpostor: param_definition_1.ParamDefinition.Boolean(true),
};
function PolymerBackboneCylinderVisual(materialId, structure, props, webgl) {
    return props.tryUseImpostor && webgl && webgl.extensions.fragDepth
        ? PolymerBackboneCylinderImpostorVisual(materialId)
        : PolymerBackboneCylinderMeshVisual(materialId);
}
function createPolymerBackboneCylinderImpostor(ctx, unit, structure, theme, props, cylinders) {
    const polymerElementCount = unit.polymerElements.length;
    if (!polymerElementCount)
        return cylinders_1.Cylinders.createEmpty(cylinders);
    const cylindersCountEstimate = polymerElementCount * 2;
    const builder = cylinders_builder_1.CylindersBuilder.create(cylindersCountEstimate, cylindersCountEstimate / 4, cylinders);
    const uc = unit.conformation;
    const pA = (0, linear_algebra_1.Vec3)();
    const pB = (0, linear_algebra_1.Vec3)();
    const pM = (0, linear_algebra_1.Vec3)();
    const add = function (indexA, indexB, groupA, groupB, moleculeType) {
        uc.invariantPosition(indexA, pA);
        uc.invariantPosition(indexB, pB);
        const isNucleicType = (0, types_1.isNucleic)(moleculeType);
        const shift = isNucleicType ? polymer_1.NucleicShift : polymer_1.StandardShift;
        v3add(pM, pA, v3scale(pM, v3sub(pM, pB, pA), shift));
        builder.add(pA[0], pA[1], pA[2], pM[0], pM[1], pM[2], 1, false, false, 2, groupA);
        builder.add(pM[0], pM[1], pM[2], pB[0], pB[1], pB[2], 1, false, false, 2, groupB);
    };
    (0, backbone_1.eachPolymerBackboneLink)(unit, add);
    const c = builder.getCylinders();
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, 1 * props.sizeFactor);
    c.setBoundingSphere(sphere);
    return c;
}
function PolymerBackboneCylinderImpostorVisual(materialId) {
    return (0, units_visual_1.UnitsCylindersVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.PolymerBackboneCylinderParams),
        createGeometry: createPolymerBackboneCylinderImpostor,
        createLocationIterator: (structureGroup) => polymer_1.PolymerLocationIterator.fromGroup(structureGroup),
        getLoci: polymer_1.getPolymerElementLoci,
        eachLocation: polymer_1.eachPolymerElement,
        setUpdateState: (state, newProps, currentProps) => { },
        mustRecreate: (structureGroup, props, webgl) => {
            return !props.tryUseImpostor || !webgl;
        }
    }, materialId);
}
function createPolymerBackboneCylinderMesh(ctx, unit, structure, theme, props, mesh) {
    const polymerElementCount = unit.polymerElements.length;
    if (!polymerElementCount)
        return mesh_1.Mesh.createEmpty(mesh);
    const { radialSegments, sizeFactor } = props;
    const vertexCountEstimate = radialSegments * 2 * polymerElementCount * 2;
    const builderState = mesh_builder_1.MeshBuilder.createState(vertexCountEstimate, vertexCountEstimate / 10, mesh);
    const c = unit.conformation;
    const pA = (0, linear_algebra_1.Vec3)();
    const pB = (0, linear_algebra_1.Vec3)();
    const cylinderProps = { radiusTop: 1, radiusBottom: 1, radialSegments };
    const centerA = structure_1.StructureElement.Location.create(structure, unit);
    const centerB = structure_1.StructureElement.Location.create(structure, unit);
    const add = function (indexA, indexB, groupA, groupB, moleculeType) {
        centerA.element = indexA;
        centerB.element = indexB;
        c.invariantPosition(centerA.element, pA);
        c.invariantPosition(centerB.element, pB);
        const isNucleicType = (0, types_1.isNucleic)(moleculeType);
        const shift = isNucleicType ? polymer_1.NucleicShift : polymer_1.StandardShift;
        cylinderProps.radiusTop = cylinderProps.radiusBottom = theme.size.size(centerA) * sizeFactor;
        builderState.currentGroup = groupA;
        (0, cylinder_1.addCylinder)(builderState, pA, pB, shift, cylinderProps);
        cylinderProps.radiusTop = cylinderProps.radiusBottom = theme.size.size(centerB) * sizeFactor;
        builderState.currentGroup = groupB;
        (0, cylinder_1.addCylinder)(builderState, pB, pA, 1 - shift, cylinderProps);
    };
    (0, backbone_1.eachPolymerBackboneLink)(unit, add);
    const m = mesh_builder_1.MeshBuilder.getMesh(builderState);
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, 1 * props.sizeFactor);
    m.setBoundingSphere(sphere);
    return m;
}
function PolymerBackboneCylinderMeshVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.PolymerBackboneCylinderParams),
        createGeometry: createPolymerBackboneCylinderMesh,
        createLocationIterator: (structureGroup) => polymer_1.PolymerLocationIterator.fromGroup(structureGroup),
        getLoci: polymer_1.getPolymerElementLoci,
        eachLocation: polymer_1.eachPolymerElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.radialSegments !== currentProps.radialSegments);
        },
        mustRecreate: (structureGroup, props, webgl) => {
            return props.tryUseImpostor && !!webgl;
        }
    }, materialId);
}
