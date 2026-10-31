"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolymerDirectionParams = exports.DefaultPolymerDirectionWedgeProps = exports.PolymerDirectionWedgeParams = void 0;
exports.PolymerDirectionVisual = PolymerDirectionVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const wedge_1 = require("../../../mol-geo/primitive/wedge");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const polymer_1 = require("./util/polymer");
const types_1 = require("../../../mol-model/structure/model/types");
const units_visual_1 = require("../units-visual");
const geometry_1 = require("../../../mol-math/geometry");
const t = linear_algebra_1.Mat4.identity();
const sVec = linear_algebra_1.Vec3.zero();
const n0 = linear_algebra_1.Vec3.zero();
const n1 = linear_algebra_1.Vec3.zero();
const upVec = linear_algebra_1.Vec3.zero();
const depthFactor = 4;
const widthFactor = 4;
const heightFactor = 6;
const wedge = (0, wedge_1.Wedge)();
exports.PolymerDirectionWedgeParams = {
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
};
exports.DefaultPolymerDirectionWedgeProps = param_definition_1.ParamDefinition.getDefaultValues(exports.PolymerDirectionWedgeParams);
function createPolymerDirectionWedgeMesh(ctx, unit, structure, theme, props, mesh) {
    const polymerElementCount = unit.polymerElements.length;
    if (!polymerElementCount)
        return mesh_1.Mesh.createEmpty(mesh);
    const { sizeFactor } = props;
    const vertexCount = polymerElementCount * 24;
    const builderState = mesh_builder_1.MeshBuilder.createState(vertexCount, vertexCount / 10, mesh);
    const linearSegments = 1;
    const state = (0, polymer_1.createCurveSegmentState)(linearSegments);
    const { normalVectors, binormalVectors } = state;
    let i = 0;
    const polymerTraceIt = (0, polymer_1.PolymerTraceIterator)(unit, structure);
    while (polymerTraceIt.hasNext) {
        const v = polymerTraceIt.move();
        builderState.currentGroup = i;
        const isNucleicType = (0, types_1.isNucleic)(v.moleculeType);
        const isSheet = types_1.SecondaryStructureType.is(v.secStrucType, 4 /* SecondaryStructureType.Flag.Beta */);
        const tension = (isNucleicType || isSheet) ? 0.5 : 0.9;
        const shift = isNucleicType ? 0.3 : 0.5;
        (0, polymer_1.interpolateCurveSegment)(state, v, tension, shift);
        if ((isSheet && !v.secStrucLast) || !isSheet) {
            const size = theme.size.size(v.center) * sizeFactor;
            const depth = depthFactor * size;
            const width = widthFactor * size;
            const height = heightFactor * size;
            const vectors = isNucleicType ? binormalVectors : normalVectors;
            linear_algebra_1.Vec3.fromArray(n0, vectors, 0);
            linear_algebra_1.Vec3.fromArray(n1, vectors, 3);
            linear_algebra_1.Vec3.normalize(upVec, linear_algebra_1.Vec3.add(upVec, n0, n1));
            linear_algebra_1.Mat4.targetTo(t, v.p3, v.p1, upVec);
            linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotY90Z180);
            linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.set(sVec, height, width, depth));
            linear_algebra_1.Mat4.setTranslation(t, v.p2);
            mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, wedge);
        }
        ++i;
    }
    const m = mesh_builder_1.MeshBuilder.getMesh(builderState);
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, 1 * props.sizeFactor);
    m.setBoundingSphere(sphere);
    return m;
}
exports.PolymerDirectionParams = {
    ...units_visual_1.UnitsMeshParams,
    ...exports.PolymerDirectionWedgeParams
};
function PolymerDirectionVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.PolymerDirectionParams),
        createGeometry: createPolymerDirectionWedgeMesh,
        createLocationIterator: (structureGroup) => polymer_1.PolymerLocationIterator.fromGroup(structureGroup),
        getLoci: polymer_1.getPolymerElementLoci,
        eachLocation: polymer_1.eachPolymerElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor);
        }
    }, materialId);
}
