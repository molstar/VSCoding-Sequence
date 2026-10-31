"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NucleotideRingParams = exports.DefaultNucleotideRingMeshProps = exports.NucleotideRingMeshParams = void 0;
exports.NucleotideRingVisual = NucleotideRingVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const structure_1 = require("../../../mol-model/structure");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const int_1 = require("../../../mol-data/int");
const types_1 = require("../../../mol-model/structure/model/types");
const cylinder_1 = require("../../../mol-geo/geometry/mesh/builder/cylinder");
const sphere_1 = require("../../../mol-geo/geometry/mesh/builder/sphere");
const units_visual_1 = require("../units-visual");
const nucleotide_1 = require("./util/nucleotide");
const base_1 = require("../../../mol-geo/geometry/base");
const geometry_1 = require("../../../mol-math/geometry");
// TODO support rings for multiple locations (including from microheterogeneity)
const pTrace = (0, linear_algebra_1.Vec3)();
const pN1 = (0, linear_algebra_1.Vec3)();
const pC2 = (0, linear_algebra_1.Vec3)();
const pN3 = (0, linear_algebra_1.Vec3)();
const pC4 = (0, linear_algebra_1.Vec3)();
const pC5 = (0, linear_algebra_1.Vec3)();
const pC6 = (0, linear_algebra_1.Vec3)();
const pN7 = (0, linear_algebra_1.Vec3)();
const pC8 = (0, linear_algebra_1.Vec3)();
const pN9 = (0, linear_algebra_1.Vec3)();
const normal = (0, linear_algebra_1.Vec3)();
exports.NucleotideRingMeshParams = {
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
    thicknessFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 2, step: 0.01 }),
    radialSegments: param_definition_1.ParamDefinition.Numeric(16, { min: 2, max: 56, step: 2 }, base_1.BaseGeometry.CustomQualityParamInfo),
    detail: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 3, step: 1 }, base_1.BaseGeometry.CustomQualityParamInfo),
};
exports.DefaultNucleotideRingMeshProps = param_definition_1.ParamDefinition.getDefaultValues(exports.NucleotideRingMeshParams);
const positionsRing5_6 = new Float32Array(2 * 9 * 3);
const stripIndicesRing5_6 = new Uint32Array([0, 1, 2, 3, 4, 5, 6, 7, 16, 17, 14, 15, 12, 13, 8, 9, 10, 11, 0, 1]);
const fanIndicesTopRing5_6 = new Uint32Array([8, 12, 14, 16, 6, 4, 2, 0, 10]);
const fanIndicesBottomRing5_6 = new Uint32Array([9, 11, 1, 3, 5, 7, 17, 15, 13]);
const positionsRing6 = new Float32Array(2 * 6 * 3);
const stripIndicesRing6 = new Uint32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1]);
const fanIndicesTopRing6 = new Uint32Array([0, 10, 8, 6, 4, 2]);
const fanIndicesBottomRing6 = new Uint32Array([1, 3, 5, 7, 9, 11]);
const tmpShiftV = (0, linear_algebra_1.Vec3)();
function shiftPositions(out, dir, ...positions) {
    for (let i = 0, il = positions.length; i < il; ++i) {
        const v = positions[i];
        linear_algebra_1.Vec3.toArray(linear_algebra_1.Vec3.add(tmpShiftV, v, dir), out, (i * 2) * 3);
        linear_algebra_1.Vec3.toArray(linear_algebra_1.Vec3.sub(tmpShiftV, v, dir), out, (i * 2 + 1) * 3);
    }
}
function createNucleotideRingMesh(ctx, unit, structure, theme, props, mesh) {
    if (!structure_1.Unit.isAtomic(unit))
        return mesh_1.Mesh.createEmpty(mesh);
    const nucleotideElementCount = unit.nucleotideElements.length;
    if (!nucleotideElementCount)
        return mesh_1.Mesh.createEmpty(mesh);
    const { sizeFactor, thicknessFactor, radialSegments, detail } = props;
    const vertexCount = nucleotideElementCount * (26 + radialSegments * 2);
    const builderState = mesh_builder_1.MeshBuilder.createState(vertexCount, vertexCount / 4, mesh);
    const { elements, model, conformation: c } = unit;
    const { chainAtomSegments, residueAtomSegments } = model.atomicHierarchy;
    const { moleculeType } = model.atomicHierarchy.derived.residue;
    const chainIt = int_1.Segmentation.transientSegments(chainAtomSegments, elements);
    const residueIt = int_1.Segmentation.transientSegments(residueAtomSegments, elements);
    const radius = 1 * sizeFactor;
    const thickness = thicknessFactor * sizeFactor;
    const cylinderProps = { radiusTop: radius, radiusBottom: radius, radialSegments };
    let i = 0;
    while (chainIt.hasNext) {
        residueIt.setSegment(chainIt.move());
        while (residueIt.hasNext) {
            const { index: residueIndex } = residueIt.move();
            if ((0, types_1.isNucleic)(moleculeType[residueIndex])) {
                const idx = (0, nucleotide_1.createNucleicIndices)();
                builderState.currentGroup = i;
                const { isPurine, isPyrimidine } = (0, nucleotide_1.getNucleotideBaseType)(unit, residueIndex);
                if (isPurine) {
                    (0, nucleotide_1.setPurinIndices)(idx, unit, residueIndex);
                    if (idx.N9 !== -1 && idx.trace !== -1) {
                        c.invariantPosition(idx.N9, pN9);
                        c.invariantPosition(idx.trace, pTrace);
                        builderState.currentGroup = i;
                        (0, cylinder_1.addCylinder)(builderState, pN9, pTrace, 1, cylinderProps);
                        (0, sphere_1.addSphere)(builderState, pN9, radius, detail);
                    }
                    if ((0, nucleotide_1.hasPurinIndices)(idx)) {
                        c.invariantPosition(idx.N1, pN1);
                        c.invariantPosition(idx.C2, pC2);
                        c.invariantPosition(idx.N3, pN3);
                        c.invariantPosition(idx.C4, pC4);
                        c.invariantPosition(idx.C5, pC5);
                        c.invariantPosition(idx.C6, pC6);
                        c.invariantPosition(idx.N7, pN7);
                        c.invariantPosition(idx.C8, pC8);
                        linear_algebra_1.Vec3.triangleNormal(normal, pN1, pC4, pC5);
                        linear_algebra_1.Vec3.scale(normal, normal, thickness);
                        shiftPositions(positionsRing5_6, normal, pN1, pC2, pN3, pC4, pC5, pC6, pN7, pC8, pN9);
                        mesh_builder_1.MeshBuilder.addTriangleStrip(builderState, positionsRing5_6, stripIndicesRing5_6);
                        mesh_builder_1.MeshBuilder.addTriangleFan(builderState, positionsRing5_6, fanIndicesTopRing5_6);
                        mesh_builder_1.MeshBuilder.addTriangleFan(builderState, positionsRing5_6, fanIndicesBottomRing5_6);
                    }
                }
                else if (isPyrimidine) {
                    (0, nucleotide_1.setPyrimidineIndices)(idx, unit, residueIndex);
                    if (idx.N1 !== -1 && idx.trace !== -1) {
                        c.invariantPosition(idx.N1, pN1);
                        c.invariantPosition(idx.trace, pTrace);
                        builderState.currentGroup = i;
                        (0, cylinder_1.addCylinder)(builderState, pN1, pTrace, 1, cylinderProps);
                        (0, sphere_1.addSphere)(builderState, pN1, radius, detail);
                    }
                    if ((0, nucleotide_1.hasPyrimidineIndices)(idx)) {
                        c.invariantPosition(idx.C2, pC2);
                        c.invariantPosition(idx.N3, pN3);
                        c.invariantPosition(idx.C4, pC4);
                        c.invariantPosition(idx.C5, pC5);
                        c.invariantPosition(idx.C6, pC6);
                        linear_algebra_1.Vec3.triangleNormal(normal, pN1, pC4, pC5);
                        linear_algebra_1.Vec3.scale(normal, normal, thickness);
                        shiftPositions(positionsRing6, normal, pN1, pC2, pN3, pC4, pC5, pC6);
                        mesh_builder_1.MeshBuilder.addTriangleStrip(builderState, positionsRing6, stripIndicesRing6);
                        mesh_builder_1.MeshBuilder.addTriangleFan(builderState, positionsRing6, fanIndicesTopRing6);
                        mesh_builder_1.MeshBuilder.addTriangleFan(builderState, positionsRing6, fanIndicesBottomRing6);
                    }
                }
                ++i;
            }
        }
    }
    const m = mesh_builder_1.MeshBuilder.getMesh(builderState);
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, radius);
    m.setBoundingSphere(sphere);
    return m;
}
exports.NucleotideRingParams = {
    ...units_visual_1.UnitsMeshParams,
    ...exports.NucleotideRingMeshParams
};
function NucleotideRingVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.NucleotideRingParams),
        createGeometry: createNucleotideRingMesh,
        createLocationIterator: nucleotide_1.NucleotideLocationIterator.fromGroup,
        getLoci: nucleotide_1.getNucleotideElementLoci,
        eachLocation: nucleotide_1.eachNucleotideElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.thicknessFactor !== currentProps.thicknessFactor ||
                newProps.radialSegments !== currentProps.radialSegments);
        }
    }, materialId);
}
