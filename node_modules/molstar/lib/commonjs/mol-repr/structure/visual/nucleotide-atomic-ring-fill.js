"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Gianluca Tomasello <giagitom@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NucleotideAtomicRingFillParams = exports.DefaultNucleotideAtomicRingFillMeshProps = exports.NucleotideAtomicRingFillMeshParams = void 0;
exports.NucleotideAtomicRingFillVisual = NucleotideAtomicRingFillVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const structure_1 = require("../../../mol-model/structure");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const int_1 = require("../../../mol-data/int");
const types_1 = require("../../../mol-model/structure/model/types");
const units_visual_1 = require("../units-visual");
const nucleotide_1 = require("./util/nucleotide");
const geometry_1 = require("../../../mol-math/geometry");
// TODO support ring-fills for multiple locations (including from microheterogeneity)
const pN1 = (0, linear_algebra_1.Vec3)();
const pC2 = (0, linear_algebra_1.Vec3)();
const pN3 = (0, linear_algebra_1.Vec3)();
const pC4 = (0, linear_algebra_1.Vec3)();
const pC5 = (0, linear_algebra_1.Vec3)();
const pC6 = (0, linear_algebra_1.Vec3)();
const pN7 = (0, linear_algebra_1.Vec3)();
const pC8 = (0, linear_algebra_1.Vec3)();
const pN9 = (0, linear_algebra_1.Vec3)();
const pC1_1 = (0, linear_algebra_1.Vec3)();
const pC2_1 = (0, linear_algebra_1.Vec3)();
const pC3_1 = (0, linear_algebra_1.Vec3)();
const pC4_1 = (0, linear_algebra_1.Vec3)();
const pO4_1 = (0, linear_algebra_1.Vec3)();
const mid = (0, linear_algebra_1.Vec3)();
const normal = (0, linear_algebra_1.Vec3)();
const shift = (0, linear_algebra_1.Vec3)();
exports.NucleotideAtomicRingFillMeshParams = {
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
    thicknessFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 2, step: 0.01 }),
};
exports.DefaultNucleotideAtomicRingFillMeshProps = param_definition_1.ParamDefinition.getDefaultValues(exports.NucleotideAtomicRingFillMeshParams);
const positionsRing5_6 = new Float32Array(2 * 9 * 3);
const stripIndicesRing5_6 = new Uint32Array([0, 1, 2, 3, 4, 5, 6, 7, 16, 17, 14, 15, 12, 13, 8, 9, 10, 11, 0, 1]);
const fanIndicesTopRing5_6 = new Uint32Array([8, 12, 14, 16, 6, 4, 2, 0, 10]);
const fanIndicesBottomRing5_6 = new Uint32Array([9, 11, 1, 3, 5, 7, 17, 15, 13]);
const positionsRing5 = new Float32Array(2 * 6 * 3);
const stripIndicesRing5 = new Uint32Array([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 2, 3]);
const fanIndicesTopRing5 = new Uint32Array([0, 10, 8, 6, 4, 2, 10]);
const fanIndicesBottomRing5 = new Uint32Array([1, 3, 5, 7, 9, 11, 3]);
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
function createNucleotideAtomicRingFillMesh(ctx, unit, structure, theme, props, mesh) {
    if (!structure_1.Unit.isAtomic(unit))
        return mesh_1.Mesh.createEmpty(mesh);
    const nucleotideElementCount = unit.nucleotideElements.length;
    if (!nucleotideElementCount)
        return mesh_1.Mesh.createEmpty(mesh);
    const { sizeFactor, thicknessFactor } = props;
    const vertexCount = nucleotideElementCount * 25;
    const builderState = mesh_builder_1.MeshBuilder.createState(vertexCount, vertexCount / 4, mesh);
    const { elements, model, conformation: c } = unit;
    const { chainAtomSegments, residueAtomSegments } = model.atomicHierarchy;
    const { moleculeType } = model.atomicHierarchy.derived.residue;
    const chainIt = int_1.Segmentation.transientSegments(chainAtomSegments, elements);
    const residueIt = int_1.Segmentation.transientSegments(residueAtomSegments, elements);
    const thickness = sizeFactor * thicknessFactor;
    let i = 0;
    while (chainIt.hasNext) {
        residueIt.setSegment(chainIt.move());
        while (residueIt.hasNext) {
            const { index: residueIndex } = residueIt.move();
            if ((0, types_1.isNucleic)(moleculeType[residueIndex])) {
                const idx = (0, nucleotide_1.createNucleicIndices)();
                builderState.currentGroup = i;
                (0, nucleotide_1.setSugarIndices)(idx, unit, residueIndex);
                if ((0, nucleotide_1.hasSugarIndices)(idx)) {
                    c.invariantPosition(idx.C1_1, pC1_1);
                    c.invariantPosition(idx.C2_1, pC2_1);
                    c.invariantPosition(idx.C3_1, pC3_1);
                    c.invariantPosition(idx.C4_1, pC4_1);
                    c.invariantPosition(idx.O4_1, pO4_1);
                    // sugar ring
                    linear_algebra_1.Vec3.triangleNormal(normal, pC3_1, pC4_1, pC1_1);
                    linear_algebra_1.Vec3.scale(mid, linear_algebra_1.Vec3.add(mid, pO4_1, linear_algebra_1.Vec3.add(mid, pC4_1, linear_algebra_1.Vec3.add(mid, pC3_1, linear_algebra_1.Vec3.add(mid, pC1_1, pC2_1)))), 0.2 /* 1 / 5 */);
                    linear_algebra_1.Vec3.scale(shift, normal, thickness);
                    shiftPositions(positionsRing5, shift, mid, pC3_1, pC4_1, pO4_1, pC1_1, pC2_1);
                    mesh_builder_1.MeshBuilder.addTriangleStrip(builderState, positionsRing5, stripIndicesRing5);
                    mesh_builder_1.MeshBuilder.addTriangleFanWithNormal(builderState, positionsRing5, fanIndicesTopRing5, normal);
                    linear_algebra_1.Vec3.negate(normal, normal);
                    mesh_builder_1.MeshBuilder.addTriangleFanWithNormal(builderState, positionsRing5, fanIndicesBottomRing5, normal);
                }
                const { isPurine, isPyrimidine } = (0, nucleotide_1.getNucleotideBaseType)(unit, residueIndex);
                if (isPurine) {
                    (0, nucleotide_1.setPurinIndices)(idx, unit, residueIndex);
                    if ((0, nucleotide_1.hasPurinIndices)(idx)) {
                        c.invariantPosition(idx.N1, pN1);
                        c.invariantPosition(idx.C2, pC2);
                        c.invariantPosition(idx.N3, pN3);
                        c.invariantPosition(idx.C4, pC4);
                        c.invariantPosition(idx.C5, pC5);
                        c.invariantPosition(idx.C6, pC6);
                        c.invariantPosition(idx.N7, pN7);
                        c.invariantPosition(idx.C8, pC8), c.invariantPosition(idx.N9, pN9);
                        // base ring
                        linear_algebra_1.Vec3.triangleNormal(normal, pN1, pC4, pC5);
                        linear_algebra_1.Vec3.scale(shift, normal, thickness);
                        shiftPositions(positionsRing5_6, shift, pN1, pC2, pN3, pC4, pC5, pC6, pN7, pC8, pN9);
                        mesh_builder_1.MeshBuilder.addTriangleStrip(builderState, positionsRing5_6, stripIndicesRing5_6);
                        mesh_builder_1.MeshBuilder.addTriangleFanWithNormal(builderState, positionsRing5_6, fanIndicesTopRing5_6, normal);
                        linear_algebra_1.Vec3.negate(normal, normal);
                        mesh_builder_1.MeshBuilder.addTriangleFanWithNormal(builderState, positionsRing5_6, fanIndicesBottomRing5_6, normal);
                    }
                }
                else if (isPyrimidine) {
                    (0, nucleotide_1.setPyrimidineIndices)(idx, unit, residueIndex);
                    if ((0, nucleotide_1.hasPyrimidineIndices)(idx)) {
                        c.invariantPosition(idx.N1, pN1);
                        c.invariantPosition(idx.C2, pC2);
                        c.invariantPosition(idx.N3, pN3);
                        c.invariantPosition(idx.C4, pC4);
                        c.invariantPosition(idx.C5, pC5);
                        c.invariantPosition(idx.C6, pC6);
                        // base ring
                        linear_algebra_1.Vec3.triangleNormal(normal, pN1, pC4, pC5);
                        linear_algebra_1.Vec3.scale(shift, normal, thickness);
                        shiftPositions(positionsRing6, shift, pN1, pC2, pN3, pC4, pC5, pC6);
                        mesh_builder_1.MeshBuilder.addTriangleStrip(builderState, positionsRing6, stripIndicesRing6);
                        mesh_builder_1.MeshBuilder.addTriangleFanWithNormal(builderState, positionsRing6, fanIndicesTopRing6, normal);
                        linear_algebra_1.Vec3.negate(normal, normal);
                        mesh_builder_1.MeshBuilder.addTriangleFanWithNormal(builderState, positionsRing6, fanIndicesBottomRing6, normal);
                    }
                }
                ++i;
            }
        }
    }
    const m = mesh_builder_1.MeshBuilder.getMesh(builderState);
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, thickness);
    m.setBoundingSphere(sphere);
    return m;
}
exports.NucleotideAtomicRingFillParams = {
    ...units_visual_1.UnitsMeshParams,
    ...exports.NucleotideAtomicRingFillMeshParams
};
function NucleotideAtomicRingFillVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.NucleotideAtomicRingFillParams),
        createGeometry: createNucleotideAtomicRingFillMesh,
        createLocationIterator: nucleotide_1.NucleotideLocationIterator.fromGroup,
        getLoci: nucleotide_1.getNucleotideElementLoci,
        eachLocation: nucleotide_1.eachNucleotideElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.thicknessFactor !== currentProps.thicknessFactor);
        }
    }, materialId);
}
