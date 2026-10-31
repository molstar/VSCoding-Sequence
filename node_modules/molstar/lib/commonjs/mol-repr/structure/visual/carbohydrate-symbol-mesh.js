"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbohydrateSymbolParams = void 0;
exports.CarbohydrateSymbolVisual = CarbohydrateSymbolVisual;
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const box_1 = require("../../../mol-geo/primitive/box");
const pyramid_1 = require("../../../mol-geo/primitive/pyramid");
const star_1 = require("../../../mol-geo/primitive/star");
const octahedron_1 = require("../../../mol-geo/primitive/octahedron");
const prism_1 = require("../../../mol-geo/primitive/prism");
const structure_1 = require("../../../mol-model/structure");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const constants_1 = require("../../../mol-model/structure/structure/carbohydrates/constants");
const sphere_1 = require("../../../mol-geo/geometry/mesh/builder/sphere");
const complex_visual_1 = require("../complex-visual");
const param_definition_1 = require("../../../mol-util/param-definition");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const int_1 = require("../../../mol-data/int");
const loci_1 = require("../../../mol-model/loci");
const common_1 = require("./util/common");
const base_1 = require("../../../mol-geo/geometry/base");
const t = linear_algebra_1.Mat4.identity();
const sVec = (0, linear_algebra_1.Vec3)();
const pd = (0, linear_algebra_1.Vec3)();
const SideFactor = 2 * 0.806; // 0.806 == Math.cos(Math.PI / 4)
const box = (0, box_1.Box)();
const perforatedBox = (0, box_1.PerforatedBox)();
const octagonalPyramid = (0, pyramid_1.OctagonalPyramid)();
const perforatedOctagonalPyramid = (0, pyramid_1.PerforatedOctagonalPyramid)();
const star = (0, star_1.Star)({ outerRadius: 1, innerRadius: 0.5, thickness: 0.5, pointCount: 5 });
const octahedron = (0, octahedron_1.Octahedron)();
const perforatedOctahedron = (0, octahedron_1.PerforatedOctahedron)();
const diamondPrism = (0, prism_1.DiamondPrism)();
const pentagonalPrism = (0, prism_1.PentagonalPrism)();
const hexagonalPrism = (0, prism_1.HexagonalPrism)();
const shiftedHexagonalPrism = (0, prism_1.ShiftedHexagonalPrism)();
const heptagonalPrism = (0, prism_1.HeptagonalPrism)();
function createCarbohydrateSymbolMesh(ctx, structure, theme, props, mesh) {
    const builderState = mesh_builder_1.MeshBuilder.createState(256, 128, mesh);
    const { detail, sizeFactor } = props;
    const carbohydrates = structure.carbohydrates;
    const n = carbohydrates.elements.length;
    const l = structure_1.StructureElement.Location.create(structure);
    for (let i = 0; i < n; ++i) {
        const c = carbohydrates.elements[i];
        const ring = c.unit.rings.all[c.ringIndex];
        const shapeType = (0, constants_1.getSaccharideShape)(c.component.type, ring.length);
        l.unit = c.unit;
        l.element = c.unit.elements[ring[0]];
        const size = theme.size.size(l);
        const radius = size * sizeFactor;
        const side = size * sizeFactor * SideFactor;
        const { center, normal, direction } = c.geometry;
        linear_algebra_1.Vec3.add(pd, center, direction);
        linear_algebra_1.Mat4.targetTo(t, center, pd, normal);
        linear_algebra_1.Mat4.setTranslation(t, center);
        builderState.currentGroup = i * 2;
        switch (shapeType) {
            case constants_1.SaccharideShape.FilledSphere:
                (0, sphere_1.addSphere)(builderState, center, radius, detail);
                break;
            case constants_1.SaccharideShape.FilledCube:
                linear_algebra_1.Mat4.scaleUniformly(t, t, side);
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, box);
                break;
            case constants_1.SaccharideShape.CrossedCube:
                linear_algebra_1.Mat4.scaleUniformly(t, t, side);
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, perforatedBox);
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotZ90X180);
                builderState.currentGroup += 1;
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, perforatedBox);
                break;
            case constants_1.SaccharideShape.FilledCone:
                linear_algebra_1.Mat4.scaleUniformly(t, t, side * 1.2);
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, octagonalPyramid);
                break;
            case constants_1.SaccharideShape.DevidedCone:
                linear_algebra_1.Mat4.scaleUniformly(t, t, side * 1.2);
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, perforatedOctagonalPyramid);
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotZ90);
                builderState.currentGroup += 1;
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, perforatedOctagonalPyramid);
                break;
            case constants_1.SaccharideShape.FlatBox:
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotZY90);
                linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.set(sVec, side, side, side / 2));
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, box);
                break;
            case constants_1.SaccharideShape.FilledStar:
                linear_algebra_1.Mat4.scaleUniformly(t, t, side);
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotZY90);
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, star);
                break;
            case constants_1.SaccharideShape.FilledDiamond:
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotZY90);
                linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.set(sVec, side * 1.4, side * 1.4, side * 1.4));
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, octahedron);
                break;
            case constants_1.SaccharideShape.DividedDiamond:
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotZY90);
                linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.set(sVec, side * 1.4, side * 1.4, side * 1.4));
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, perforatedOctahedron);
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotY90);
                builderState.currentGroup += 1;
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, perforatedOctahedron);
                break;
            case constants_1.SaccharideShape.FlatDiamond:
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotZY90);
                linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.set(sVec, side, side / 2, side / 2));
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, diamondPrism);
                break;
            case constants_1.SaccharideShape.DiamondPrism:
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotZY90);
                linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.set(sVec, side, side, side / 2));
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, diamondPrism);
                break;
            case constants_1.SaccharideShape.PentagonalPrism:
            case constants_1.SaccharideShape.Pentagon:
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotZY90);
                linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.set(sVec, side, side, side / 2));
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, pentagonalPrism);
                break;
            case constants_1.SaccharideShape.HexagonalPrism:
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotZY90);
                linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.set(sVec, side, side, side / 2));
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, hexagonalPrism);
                break;
            case constants_1.SaccharideShape.HeptagonalPrism:
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotZY90);
                linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.set(sVec, side, side, side / 2));
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, heptagonalPrism);
                break;
            case constants_1.SaccharideShape.FlatHexagon:
            default:
                linear_algebra_1.Mat4.mul(t, t, linear_algebra_1.Mat4.rotZYZ90);
                linear_algebra_1.Mat4.scale(t, t, linear_algebra_1.Vec3.set(sVec, side / 1.5, side, side / 2));
                mesh_builder_1.MeshBuilder.addPrimitive(builderState, t, shiftedHexagonalPrism);
                break;
        }
    }
    return mesh_builder_1.MeshBuilder.getMesh(builderState);
}
exports.CarbohydrateSymbolParams = {
    ...complex_visual_1.ComplexMeshParams,
    detail: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 3, step: 1 }, base_1.BaseGeometry.CustomQualityParamInfo),
    sizeFactor: param_definition_1.ParamDefinition.Numeric(1.75, { min: 0, max: 10, step: 0.01 }),
};
function CarbohydrateSymbolVisual(materialId) {
    return (0, complex_visual_1.ComplexMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.CarbohydrateSymbolParams),
        createGeometry: createCarbohydrateSymbolMesh,
        createLocationIterator: CarbohydrateElementIterator,
        getLoci: getCarbohydrateLoci,
        eachLocation: eachCarbohydrate,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.detail !== currentProps.detail);
        }
    }, materialId);
}
function CarbohydrateElementIterator(structure) {
    const carbElements = structure.carbohydrates.elements;
    const groupCount = carbElements.length * 2;
    const instanceCount = 1;
    const location = structure_1.StructureElement.Location.create(structure);
    function getLocation(groupIndex, instanceIndex) {
        const carb = carbElements[Math.floor(groupIndex / 2)];
        const ring = carb.unit.rings.all[carb.ringIndex];
        location.unit = carb.unit;
        location.element = carb.unit.elements[ring[0]];
        return location;
    }
    function isSecondary(elementIndex, instanceIndex) {
        return (elementIndex % 2) === 1;
    }
    return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation, true, isSecondary);
}
/** Return a Loci for the elements of the whole residue of a carbohydrate. */
function getCarbohydrateLoci(pickingId, structure, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const carb = structure.carbohydrates.elements[Math.floor(groupId / 2)];
        return (0, common_1.getAltResidueLociFromId)(structure, carb.unit, carb.residueIndex, carb.altId);
    }
    return loci_1.EmptyLoci;
}
const __elementIndicesSet = new Set();
/** For each carbohydrate (usually a monosaccharide) when all its residue's elements are in a loci. */
function eachCarbohydrate(loci, structure, apply) {
    const { getElementIndices } = structure.carbohydrates;
    let changed = false;
    if (!structure_1.StructureElement.Loci.is(loci))
        return false;
    if (!structure_1.Structure.areEquivalent(loci.structure, structure))
        return false;
    for (const { unit, indices } of loci.elements) {
        if (!structure_1.Unit.isAtomic(unit))
            continue;
        __elementIndicesSet.clear();
        int_1.OrderedSet.forEach(indices, v => {
            const elementIndices = getElementIndices(unit, unit.elements[v]);
            for (let i = 0, il = elementIndices.length; i < il; ++i) {
                if (!__elementIndicesSet.has(elementIndices[i])) {
                    __elementIndicesSet.add(elementIndices[i]);
                    if (apply(int_1.Interval.ofSingleton(elementIndices[i] * 2)))
                        changed = true;
                }
            }
        });
    }
    return changed;
}
