"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NucleotideBlockParams = exports.DefaultNucleotideBlockMeshProps = exports.NucleotideBlockMeshParams = void 0;
exports.NucleotideBlockVisual = NucleotideBlockVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const box_1 = require("../../../mol-geo/primitive/box");
const structure_1 = require("../../../mol-model/structure");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const int_1 = require("../../../mol-data/int");
const types_1 = require("../../../mol-model/structure/model/types");
const cylinder_1 = require("../../../mol-geo/geometry/mesh/builder/cylinder");
const units_visual_1 = require("../units-visual");
const nucleotide_1 = require("./util/nucleotide");
const base_1 = require("../../../mol-geo/geometry/base");
const geometry_1 = require("../../../mol-math/geometry");
// TODO support blocks for multiple locations (including from microheterogeneity)
const p1 = (0, linear_algebra_1.Vec3)();
const p2 = (0, linear_algebra_1.Vec3)();
const p3 = (0, linear_algebra_1.Vec3)();
const p4 = (0, linear_algebra_1.Vec3)();
const p5 = (0, linear_algebra_1.Vec3)();
const pt = (0, linear_algebra_1.Vec3)();
const v12 = (0, linear_algebra_1.Vec3)();
const v34 = (0, linear_algebra_1.Vec3)();
const vC = (0, linear_algebra_1.Vec3)();
const center = (0, linear_algebra_1.Vec3)();
const t = linear_algebra_1.Mat4.identity();
const sVec = (0, linear_algebra_1.Vec3)();
const box = (0, box_1.Box)();
exports.NucleotideBlockMeshParams = {
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 10, step: 0.01 }),
    thicknessFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 2, step: 0.01 }),
    radialSegments: param_definition_1.ParamDefinition.Numeric(16, { min: 2, max: 56, step: 2 }, base_1.BaseGeometry.CustomQualityParamInfo),
};
exports.DefaultNucleotideBlockMeshProps = param_definition_1.ParamDefinition.getDefaultValues(exports.NucleotideBlockMeshParams);
function createNucleotideBlockMesh(ctx, unit, structure, theme, props, mesh) {
    if (!structure_1.Unit.isAtomic(unit))
        return mesh_1.Mesh.createEmpty(mesh);
    const nucleotideElementCount = unit.nucleotideElements.length;
    if (!nucleotideElementCount)
        return mesh_1.Mesh.createEmpty(mesh);
    const { sizeFactor, thicknessFactor, radialSegments } = props;
    const vertexCount = nucleotideElementCount * (box.vertices.length / 3 + radialSegments * 2);
    const builderState = mesh_builder_1.MeshBuilder.createState(vertexCount, vertexCount / 4, mesh);
    const { elements, model, conformation: c } = unit;
    const { chainAtomSegments, residueAtomSegments } = model.atomicHierarchy;
    const { moleculeType } = model.atomicHierarchy.derived.residue;
    const chainIt = int_1.Segmentation.transientSegments(chainAtomSegments, elements);
    const residueIt = int_1.Segmentation.transientSegments(residueAtomSegments, elements);
    const radius = 1 * sizeFactor;
    const width = 4.5;
    const depth = thicknessFactor * sizeFactor * 2;
    const cylinderProps = { radiusTop: radius, radiusBottom: radius, radialSegments, bottomCap: true };
    let i = 0;
    while (chainIt.hasNext) {
        residueIt.setSegment(chainIt.move());
        while (residueIt.hasNext) {
            const { index: residueIndex } = residueIt.move();
            if ((0, types_1.isNucleic)(moleculeType[residueIndex])) {
                const idx = (0, nucleotide_1.createNucleicIndices)();
                let idx1 = -1, idx2 = -1, idx3 = -1, idx4 = -1, idx5 = -1;
                let height = 4.5;
                const { isPurine, isPyrimidine } = (0, nucleotide_1.getNucleotideBaseType)(unit, residueIndex);
                if (isPurine) {
                    height = 4.5;
                    (0, nucleotide_1.setPurinIndices)(idx, unit, residueIndex);
                    idx1 = idx.N1;
                    idx2 = idx.C4;
                    idx3 = idx.C6;
                    idx4 = idx.C2;
                    idx5 = idx.N9;
                }
                else if (isPyrimidine) {
                    height = 3.0;
                    (0, nucleotide_1.setPyrimidineIndices)(idx, unit, residueIndex);
                    idx1 = idx.N3;
                    idx2 = idx.C6;
                    idx3 = idx.C4;
                    idx4 = idx.C2;
                    idx5 = idx.N1;
                }
                if (idx5 !== -1 && idx.trace !== -1) {
                    c.invariantPosition(idx5, p5);
                    c.invariantPosition(idx.trace, pt);
                    builderState.currentGroup = i;
                    (0, cylinder_1.addCylinder)(builderState, p5, pt, 1, cylinderProps);
                    if (idx1 !== -1 && idx2 !== -1 && idx3 !== -1 && idx4 !== -1) {
                        c.invariantPosition(idx1, p1);
                        c.invariantPosition(idx2, p2);
                        c.invariantPosition(idx3, p3);
                        c.invariantPosition(idx4, p4);
                        linear_algebra_1.Vec3.normalize(v12, linear_algebra_1.Vec3.sub(v12, p2, p1));
                        linear_algebra_1.Vec3.normalize(v34, linear_algebra_1.Vec3.sub(v34, p4, p3));
                        linear_algebra_1.Vec3.normalize(vC, linear_algebra_1.Vec3.cross(vC, v12, v34));
                        linear_algebra_1.Mat4.targetTo(t, p1, p2, vC);
                        linear_algebra_1.Vec3.scaleAndAdd(center, p1, v12, height / 2 - 0.2);
                        linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.set(sVec, width, depth, height));
                        linear_algebra_1.Mat4.setTranslation(t, center);
                        mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, box);
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
exports.NucleotideBlockParams = {
    ...units_visual_1.UnitsMeshParams,
    ...exports.NucleotideBlockMeshParams
};
function NucleotideBlockVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.NucleotideBlockParams),
        createGeometry: createNucleotideBlockMesh,
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
