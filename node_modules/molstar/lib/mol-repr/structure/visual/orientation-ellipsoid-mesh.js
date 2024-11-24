/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsMeshParams, UnitsMeshVisual } from '../../../mol-repr/structure/units-visual';
import { Unit, Structure, StructureElement } from '../../../mol-model/structure';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../../mol-geo/geometry/mesh/mesh-builder';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { addEllipsoid } from '../../../mol-geo/geometry/mesh/builder/ellipsoid';
import { Axes3D, Sphere3D } from '../../../mol-math/geometry';
import { OrderedSet, Interval } from '../../../mol-data/int';
import { EmptyLoci } from '../../../mol-model/loci';
import { LocationIterator } from '../../../mol-geo/util/location-iterator';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
export const OrientationEllipsoidMeshParams = {
    ...UnitsMeshParams,
    sizeFactor: PD.Numeric(1, { min: 0, max: 2, step: 0.1 }),
    detail: PD.Numeric(0, { min: 0, max: 3, step: 1 }, BaseGeometry.CustomQualityParamInfo),
};
export function OrientationEllipsoidMeshVisual(materialId) {
    return UnitsMeshVisual({
        defaultProps: PD.getDefaultValues(OrientationEllipsoidMeshParams),
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
    if (Unit.Traits.is(unit.traits, Unit.Trait.MultiChain))
        return false;
    if (Unit.Traits.is(unit.traits, Unit.Trait.Partitioned))
        return false;
    if (Unit.isCoarse(unit))
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
export function createOrientationEllipsoidMesh(ctx, unit, structure, theme, props, mesh) {
    if (!isUnitApplicable(unit))
        return Mesh.createEmpty(mesh);
    const { detail, sizeFactor } = props;
    const vertexCount = 256;
    const builderState = MeshBuilder.createState(vertexCount, vertexCount / 2, mesh);
    const axes = unit.principalAxes.boxAxes;
    const { origin, dirA, dirB } = axes;
    const size = Axes3D.size(Vec3(), axes);
    Vec3.scale(size, size, sizeFactor / 2);
    const radiusScale = Vec3.create(size[2], size[1], size[0]);
    builderState.currentGroup = 0;
    addEllipsoid(builderState, origin, dirA, dirB, radiusScale, detail + 1);
    const m = MeshBuilder.getMesh(builderState);
    const sphere = Sphere3D.expand(Sphere3D(), unit.boundary.sphere, 1 * props.sizeFactor);
    m.setBoundingSphere(sphere);
    return m;
}
//
function UnitIterator(structureGroup) {
    const { group, structure } = structureGroup;
    const groupCount = 1;
    const instanceCount = group.units.length;
    const location = StructureElement.Location.create(structure);
    const getLocation = (groupIndex, instanceIndex) => {
        const unit = group.units[instanceIndex];
        location.unit = unit;
        location.element = unit.elements[groupIndex];
        return location;
    };
    return LocationIterator(groupCount, instanceCount, 1, getLocation);
}
function getUnitLoci(pickingId, structureGroup, id) {
    const { objectId, instanceId } = pickingId;
    if (id === objectId) {
        const { structure, group } = structureGroup;
        const unit = group.units[instanceId];
        const indices = OrderedSet.ofBounds(0, unit.elements.length);
        return StructureElement.Loci(structure, [{ unit, indices }]);
    }
    return EmptyLoci;
}
function eachUnit(loci, structureGroup, apply) {
    let changed = false;
    if (!StructureElement.Loci.is(loci))
        return false;
    const { structure, group } = structureGroup;
    if (!Structure.areEquivalent(loci.structure, structure))
        return false;
    const elementCount = group.elements.length;
    for (const e of loci.elements) {
        const unitIdx = group.unitIndexMap.get(e.unit.id);
        if (unitIdx !== undefined) {
            if (OrderedSet.size(e.indices) === elementCount) {
                if (apply(Interval.ofSingleton(unitIdx)))
                    changed = true;
            }
        }
    }
    return changed;
}
