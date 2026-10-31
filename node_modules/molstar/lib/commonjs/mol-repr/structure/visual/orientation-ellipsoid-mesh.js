"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrientationEllipsoidMeshParams = void 0;
exports.OrientationEllipsoidMeshVisual = OrientationEllipsoidMeshVisual;
exports.createOrientationEllipsoidMesh = createOrientationEllipsoidMesh;
const param_definition_1 = require("../../../mol-util/param-definition");
const units_visual_1 = require("../../../mol-repr/structure/units-visual");
const structure_1 = require("../../../mol-model/structure");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const ellipsoid_1 = require("../../../mol-geo/geometry/mesh/builder/ellipsoid");
const geometry_1 = require("../../../mol-math/geometry");
const int_1 = require("../../../mol-data/int");
const loci_1 = require("../../../mol-model/loci");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const base_1 = require("../../../mol-geo/geometry/base");
exports.OrientationEllipsoidMeshParams = {
    ...units_visual_1.UnitsMeshParams,
    sizeFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 2, step: 0.1 }),
    detail: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 3, step: 1 }, base_1.BaseGeometry.CustomQualityParamInfo),
};
function OrientationEllipsoidMeshVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.OrientationEllipsoidMeshParams),
        createGeometry: createOrientationEllipsoidMesh,
        createLocationIterator: UnitIterator,
        getLoci: getUnitLoci,
        eachLocation: eachUnit,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.detail !== currentProps.detail);
        }
    }, materialId);
}
function isUnitApplicable(unit) {
    if (structure_1.Unit.Traits.is(unit.traits, structure_1.Unit.Trait.MultiChain))
        return false;
    if (structure_1.Unit.Traits.is(unit.traits, structure_1.Unit.Trait.Partitioned))
        return false;
    if (structure_1.Unit.isCoarse(unit))
        return true;
    if (unit.elements.length === 0)
        return false;
    unit.model.atomicHierarchy.derived.residue.moleculeType;
    const rI = unit.residueIndex[unit.elements[0]];
    const mt = unit.model.atomicHierarchy.derived.residue.moleculeType[rI];
    if (mt === 3 /* MoleculeType.Ion */)
        return false;
    if (mt === 2 /* MoleculeType.Water */)
        return false;
    return true;
}
function createOrientationEllipsoidMesh(ctx, unit, structure, theme, props, mesh) {
    if (!isUnitApplicable(unit))
        return mesh_1.Mesh.createEmpty(mesh);
    const { detail, sizeFactor } = props;
    const vertexCount = 256;
    const builderState = mesh_builder_1.MeshBuilder.createState(vertexCount, vertexCount / 2, mesh);
    const axes = unit.principalAxes.boxAxes;
    const { origin, dirA, dirB } = axes;
    const size = geometry_1.Axes3D.size((0, linear_algebra_1.Vec3)(), axes);
    linear_algebra_1.Vec3.scale(size, size, sizeFactor / 2);
    const radiusScale = linear_algebra_1.Vec3.create(size[2], size[1], size[0]);
    builderState.currentGroup = 0;
    (0, ellipsoid_1.addEllipsoid)(builderState, origin, dirA, dirB, radiusScale, detail + 1);
    const m = mesh_builder_1.MeshBuilder.getMesh(builderState);
    const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), unit.boundary.sphere, 1 * props.sizeFactor);
    m.setBoundingSphere(sphere);
    return m;
}
//
function UnitIterator(structureGroup) {
    const { group, structure } = structureGroup;
    const groupCount = 1;
    const instanceCount = group.units.length;
    const location = structure_1.StructureElement.Location.create(structure);
    const getLocation = (groupIndex, instanceIndex) => {
        const unit = group.units[instanceIndex];
        location.unit = unit;
        location.element = unit.elements[groupIndex];
        return location;
    };
    return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation);
}
function getUnitLoci(pickingId, structureGroup, id) {
    const { objectId, instanceId } = pickingId;
    if (id === objectId) {
        const { structure, group } = structureGroup;
        const unit = group.units[instanceId];
        const indices = int_1.OrderedSet.ofBounds(0, unit.elements.length);
        return structure_1.StructureElement.Loci(structure, [{ unit, indices }]);
    }
    return loci_1.EmptyLoci;
}
function eachUnit(loci, structureGroup, apply) {
    let changed = false;
    if (!structure_1.StructureElement.Loci.is(loci))
        return false;
    const { structure, group } = structureGroup;
    if (!structure_1.Structure.areEquivalent(loci.structure, structure))
        return false;
    const elementCount = group.elements.length;
    for (const e of loci.elements) {
        const unitIdx = group.unitIndexMap.get(e.unit.id);
        if (unitIdx !== undefined) {
            if (int_1.OrderedSet.size(e.indices) === elementCount) {
                if (apply(int_1.Interval.ofSingleton(unitIdx)))
                    changed = true;
            }
        }
    }
    return changed;
}
