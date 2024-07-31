"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Gianluca Tomasello <giagitom@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NucleotideAtomicElementParams = void 0;
exports.NucleotideAtomicElementVisual = NucleotideAtomicElementVisual;
exports.NucleotideAtomicElementImpostorVisual = NucleotideAtomicElementImpostorVisual;
exports.NucleotideAtomicElementMeshVisual = NucleotideAtomicElementMeshVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const structure_1 = require("../../../mol-model/structure");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const int_1 = require("../../../mol-data/int");
const types_1 = require("../../../mol-model/structure/model/types");
const sphere_1 = require("../../../mol-geo/geometry/mesh/builder/sphere");
const units_visual_1 = require("../units-visual");
const nucleotide_1 = require("./util/nucleotide");
const base_1 = require("../../../mol-geo/geometry/base");
const geometry_1 = require("../../../mol-math/geometry");
const spheres_1 = require("../../../mol-geo/geometry/spheres/spheres");
const sphere_2 = require("../../../mol-geo/primitive/sphere");
const spheres_builder_1 = require("../../../mol-geo/geometry/spheres/spheres-builder");
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
const pC1_1 = (0, linear_algebra_1.Vec3)();
const pC2_1 = (0, linear_algebra_1.Vec3)();
const pC3_1 = (0, linear_algebra_1.Vec3)();
const pC4_1 = (0, linear_algebra_1.Vec3)();
const pO4_1 = (0, linear_algebra_1.Vec3)();
exports.NucleotideAtomicElementParams = {
    ...units_visual_1.UnitsMeshParams,
    ...units_visual_1.UnitsSpheresParams,
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.3, { min: 0, max: 10, step: 0.01 }),
    detail: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 3, step: 1 }, base_1.BaseGeometry.CustomQualityParamInfo),
    tryUseImpostor: param_definition_1.ParamDefinition.Boolean(true)
};
function NucleotideAtomicElementVisual(materialId, structure, props, webgl) {
    return props.tryUseImpostor && webgl && webgl.extensions.fragDepth
        ? NucleotideAtomicElementImpostorVisual(materialId)
        : NucleotideAtomicElementMeshVisual(materialId);
}
function createNucleotideAtomicElementImpostor(ctx, unit, structure, theme, props, spheres) {
    if (!structure_1.Unit.isAtomic(unit))
        return spheres_1.Spheres.createEmpty(spheres);
    const nucleotideElementCount = unit.nucleotideElements.length;
    if (!nucleotideElementCount)
        return spheres_1.Spheres.createEmpty(spheres);
    const spheresCountEstimate = nucleotideElementCount * 15; // 15 is the average purine (17) & pirimidine (13) bonds
    const builder = spheres_builder_1.SpheresBuilder.create(spheresCountEstimate, spheresCountEstimate / 4, spheres);
    const { elements, model, conformation: c } = unit;
    const { chainAtomSegments, residueAtomSegments } = model.atomicHierarchy;
    const { moleculeType } = model.atomicHierarchy.derived.residue;
    const chainIt = int_1.Segmentation.transientSegments(chainAtomSegments, elements);
    const residueIt = int_1.Segmentation.transientSegments(residueAtomSegments, elements);
    let i = 0;
    while (chainIt.hasNext) {
        residueIt.setSegment(chainIt.move());
        while (residueIt.hasNext) {
            const { index: residueIndex } = residueIt.move();
            if ((0, types_1.isNucleic)(moleculeType[residueIndex])) {
                const idx = (0, nucleotide_1.createNucleicIndices)();
                (0, nucleotide_1.setSugarIndices)(idx, unit, residueIndex);
                if ((0, nucleotide_1.hasSugarIndices)(idx)) {
                    c.invariantPosition(idx.C1_1, pC1_1);
                    c.invariantPosition(idx.C2_1, pC2_1);
                    c.invariantPosition(idx.C3_1, pC3_1);
                    c.invariantPosition(idx.C4_1, pC4_1);
                    c.invariantPosition(idx.O4_1, pO4_1);
                    // trace cylinder
                    c.invariantPosition(idx.trace, pTrace);
                    builder.add(pTrace[0], pTrace[1], pTrace[2], i);
                    // sugar ring
                    builder.add(pC3_1[0], pC3_1[1], pC3_1[2], i);
                    builder.add(pC4_1[0], pC4_1[1], pC4_1[2], i);
                    builder.add(pO4_1[0], pO4_1[1], pO4_1[2], i);
                    builder.add(pC1_1[0], pC1_1[1], pC1_1[2], i);
                    builder.add(pC2_1[0], pC2_1[1], pC2_1[2], i);
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
                        c.invariantPosition(idx.C8, pC8);
                        c.invariantPosition(idx.N9, pN9);
                        // base ring
                        builder.add(pN9[0], pN9[1], pN9[2], i);
                        builder.add(pC8[0], pC8[1], pC8[2], i);
                        builder.add(pN7[0], pN7[1], pN7[2], i);
                        builder.add(pC5[0], pC5[1], pC5[2], i);
                        builder.add(pC6[0], pC6[1], pC6[2], i);
                        builder.add(pN1[0], pN1[1], pN1[2], i);
                        builder.add(pC2[0], pC2[1], pC2[2], i);
                        builder.add(pN3[0], pN3[1], pN3[2], i);
                        builder.add(pC4[0], pC4[1], pC4[2], i);
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
                        builder.add(pN1[0], pN1[1], pN1[2], i);
                        builder.add(pC6[0], pC6[1], pC6[2], i);
                        builder.add(pC5[0], pC5[1], pC5[2], i);
                        builder.add(pC4[0], pC4[1], pC4[2], i);
                        builder.add(pN3[0], pN3[1], pN3[2], i);
                        builder.add(pC2[0], pC2[1], pC2[2], i);
                    }
                }
                ++i;
            }
        }
    }
    const s = builder.getSpheres();
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, 1 * props.sizeFactor);
    s.setBoundingSphere(sphere);
    return s;
}
function NucleotideAtomicElementImpostorVisual(materialId) {
    return (0, units_visual_1.UnitsSpheresVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.NucleotideAtomicElementParams),
        createGeometry: createNucleotideAtomicElementImpostor,
        createLocationIterator: nucleotide_1.NucleotideLocationIterator.fromGroup,
        getLoci: nucleotide_1.getNucleotideElementLoci,
        eachLocation: nucleotide_1.eachNucleotideElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor);
        },
        mustRecreate: (structureGroup, props, webgl) => {
            return !props.tryUseImpostor || !webgl;
        }
    }, materialId);
}
function createNucleotideAtomicElementMesh(ctx, unit, structure, theme, props, mesh) {
    if (!structure_1.Unit.isAtomic(unit))
        return mesh_1.Mesh.createEmpty(mesh);
    const nucleotideElementCount = unit.nucleotideElements.length;
    if (!nucleotideElementCount)
        return mesh_1.Mesh.createEmpty(mesh);
    const { sizeFactor, detail } = props;
    const vertexCount = nucleotideElementCount * (0, sphere_2.sphereVertexCount)(detail);
    const builderState = mesh_builder_1.MeshBuilder.createState(vertexCount, vertexCount / 2, mesh);
    const { elements, model, conformation: c } = unit;
    const { chainAtomSegments, residueAtomSegments } = model.atomicHierarchy;
    const { moleculeType } = model.atomicHierarchy.derived.residue;
    const chainIt = int_1.Segmentation.transientSegments(chainAtomSegments, elements);
    const residueIt = int_1.Segmentation.transientSegments(residueAtomSegments, elements);
    const radius = 1 * sizeFactor;
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
                    // trace cylinder
                    c.invariantPosition(idx.trace, pTrace);
                    (0, sphere_1.addSphere)(builderState, pTrace, radius, detail);
                    // sugar ring
                    (0, sphere_1.addSphere)(builderState, pC4_1, radius, detail);
                    (0, sphere_1.addSphere)(builderState, pO4_1, radius, detail);
                    (0, sphere_1.addSphere)(builderState, pC1_1, radius, detail);
                    (0, sphere_1.addSphere)(builderState, pC2_1, radius, detail);
                    (0, sphere_1.addSphere)(builderState, pC3_1, radius, detail);
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
                        c.invariantPosition(idx.C8, pC8);
                        c.invariantPosition(idx.N9, pN9);
                        // base ring
                        (0, sphere_1.addSphere)(builderState, pC8, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pN7, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pC5, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pC6, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pN1, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pC2, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pN3, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pC4, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pC5, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pN9, radius, detail);
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
                        (0, sphere_1.addSphere)(builderState, pC6, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pC5, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pC4, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pN3, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pC2, radius, detail);
                        (0, sphere_1.addSphere)(builderState, pN1, radius, detail);
                    }
                }
                ++i;
            }
        }
    }
    const m = mesh_builder_1.MeshBuilder.getMesh(builderState);
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, 1 * props.sizeFactor);
    m.setBoundingSphere(sphere);
    return m;
}
function NucleotideAtomicElementMeshVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.NucleotideAtomicElementParams),
        createGeometry: createNucleotideAtomicElementMesh,
        createLocationIterator: nucleotide_1.NucleotideLocationIterator.fromGroup,
        getLoci: nucleotide_1.getNucleotideElementLoci,
        eachLocation: nucleotide_1.eachNucleotideElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.detail !== currentProps.detail);
        },
        mustRecreate: (structureGroup, props, webgl) => {
            return props.tryUseImpostor && !!webgl;
        }
    }, materialId);
}
