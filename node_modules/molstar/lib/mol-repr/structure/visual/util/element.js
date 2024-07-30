/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Vec3 } from '../../../../mol-math/linear-algebra';
import { Unit, StructureElement, Structure } from '../../../../mol-model/structure';
import { EmptyLoci } from '../../../../mol-model/loci';
import { Interval, OrderedSet, SortedArray } from '../../../../mol-data/int';
import { Mesh } from '../../../../mol-geo/geometry/mesh/mesh';
import { sphereVertexCount } from '../../../../mol-geo/primitive/sphere';
import { MeshBuilder } from '../../../../mol-geo/geometry/mesh/mesh-builder';
import { addSphere } from '../../../../mol-geo/geometry/mesh/builder/sphere';
import { LocationIterator } from '../../../../mol-geo/util/location-iterator';
import { Spheres } from '../../../../mol-geo/geometry/spheres/spheres';
import { SpheresBuilder } from '../../../../mol-geo/geometry/spheres/spheres-builder';
import { isTrace, isHydrogen } from './common';
import { Sphere3D } from '../../../../mol-math/geometry';
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const v3add = Vec3.add;
export function makeElementIgnoreTest(structure, unit, props) {
    const { ignoreHydrogens, ignoreHydrogensVariant, traceOnly } = props;
    const isCoarse = Unit.isCoarse(unit);
    const { child } = structure;
    const childUnit = child === null || child === void 0 ? void 0 : child.unitMap.get(unit.id);
    if (child && !childUnit)
        throw new Error('expected childUnit to exist if child exists');
    if (!child && !ignoreHydrogens && !traceOnly)
        return;
    return (element) => {
        return ((!!childUnit && !SortedArray.has(childUnit.elements, element)) ||
            (!isCoarse && ignoreHydrogens && isHydrogen(structure, unit, element, ignoreHydrogensVariant)) ||
            (traceOnly && !isTrace(unit, element)));
    };
}
export function createElementSphereMesh(ctx, unit, structure, theme, props, mesh) {
    const { child } = structure;
    const childUnit = child === null || child === void 0 ? void 0 : child.unitMap.get(unit.id);
    if (child && !childUnit)
        return Mesh.createEmpty(mesh);
    const { detail, sizeFactor, stride } = props;
    const { elements, conformation: c } = unit;
    const elementCount = elements.length;
    const vertexCount = elementCount * sphereVertexCount(detail);
    const builderState = MeshBuilder.createState(vertexCount, vertexCount / 2, mesh);
    const v = Vec3();
    const ignore = makeElementIgnoreTest(structure, unit, props);
    const l = StructureElement.Location.create(structure, unit);
    const themeSize = theme.size.size;
    const center = Vec3();
    let maxSize = 0;
    let count = 0;
    for (let i = 0; i < elementCount; i++) {
        if (stride && i % stride !== 0)
            continue;
        if (ignore && ignore(elements[i]))
            continue;
        c.invariantPosition(elements[i], v);
        v3add(center, center, v);
        count += 1;
        l.element = elements[i];
        const size = themeSize(l);
        if (size > maxSize)
            maxSize = size;
        builderState.currentGroup = i;
        addSphere(builderState, v, size * sizeFactor, detail);
    }
    const oldBoundingSphere = mesh ? Sphere3D.clone(mesh.boundingSphere) : undefined;
    const m = MeshBuilder.getMesh(builderState);
    if (count === 0)
        return m;
    // re-use boundingSphere if it has not changed much
    let boundingSphere;
    Vec3.scale(center, center, 1 / count);
    if (oldBoundingSphere && Vec3.distance(center, oldBoundingSphere.center) / oldBoundingSphere.radius < 0.1) {
        boundingSphere = oldBoundingSphere;
    }
    else {
        boundingSphere = Sphere3D.expand(Sphere3D(), (childUnit !== null && childUnit !== void 0 ? childUnit : unit).boundary.sphere, maxSize * sizeFactor + 0.05);
    }
    m.setBoundingSphere(boundingSphere);
    return m;
}
export function createElementSphereImpostor(ctx, unit, structure, theme, props, spheres) {
    const { child } = structure;
    const childUnit = child === null || child === void 0 ? void 0 : child.unitMap.get(unit.id);
    if (child && !childUnit)
        return Spheres.createEmpty(spheres);
    const { sizeFactor, stride } = props;
    const { elements, conformation: c } = unit;
    const elementCount = elements.length;
    const builder = SpheresBuilder.create(elementCount, elementCount / 2, spheres);
    const v = Vec3();
    const ignore = makeElementIgnoreTest(structure, unit, props);
    const l = StructureElement.Location.create(structure, unit);
    const themeSize = theme.size.size;
    const center = Vec3();
    let maxSize = 0;
    let count = 0;
    if ((stride && stride > 1) || ignore || theme.size.granularity !== 'uniform') {
        for (let i = 0; i < elementCount; i++) {
            if (stride && i % stride !== 0)
                continue;
            if (ignore && ignore(elements[i]))
                continue;
            c.invariantPosition(elements[i], v);
            builder.add(v[0], v[1], v[2], i);
            v3add(center, center, v);
            count += 1;
            l.element = elements[i];
            const size = themeSize(l);
            if (size > maxSize)
                maxSize = size;
        }
    }
    else {
        for (let i = 0; i < elementCount; i++) {
            c.invariantPosition(elements[i], v);
            builder.add(v[0], v[1], v[2], i);
            v3add(center, center, v);
        }
        count = elementCount;
        maxSize = themeSize(l);
    }
    const oldBoundingSphere = spheres ? Sphere3D.clone(spheres.boundingSphere) : undefined;
    const s = builder.getSpheres();
    if (count === 0)
        return s;
    // re-use boundingSphere if it has not changed much
    let boundingSphere;
    Vec3.scale(center, center, 1 / count);
    if (oldBoundingSphere && Vec3.distance(center, oldBoundingSphere.center) / oldBoundingSphere.radius < 0.1) {
        boundingSphere = oldBoundingSphere;
    }
    else {
        boundingSphere = Sphere3D.expand(Sphere3D(), (childUnit !== null && childUnit !== void 0 ? childUnit : unit).boundary.sphere, maxSize * sizeFactor + 0.05);
    }
    s.setBoundingSphere(boundingSphere);
    return s;
}
export function eachElement(loci, structureGroup, apply) {
    let changed = false;
    if (!StructureElement.Loci.is(loci))
        return false;
    const { structure, group } = structureGroup;
    if (!Structure.areEquivalent(loci.structure, structure))
        return false;
    const elementCount = group.elements.length;
    const { unitIndexMap } = group;
    for (const e of loci.elements) {
        const unitIdx = unitIndexMap.get(e.unit.id);
        if (unitIdx !== undefined) {
            const offset = unitIdx * elementCount; // to target unit instance
            if (Interval.is(e.indices)) {
                const start = offset + Interval.start(e.indices);
                const end = offset + Interval.end(e.indices);
                if (apply(Interval.ofBounds(start, end)))
                    changed = true;
            }
            else {
                for (let i = 0, _i = e.indices.length; i < _i; i++) {
                    const start = e.indices[i];
                    let endI = i + 1;
                    while (endI < _i && e.indices[endI] === start)
                        endI++;
                    i = endI - 1;
                    const end = e.indices[i];
                    changed = apply(Interval.ofRange(offset + start, offset + end)) || changed;
                }
            }
        }
    }
    return changed;
}
export function getElementLoci(pickingId, structureGroup, id) {
    const { objectId, instanceId, groupId } = pickingId;
    if (id === objectId) {
        const { structure, group } = structureGroup;
        const unit = group.units[instanceId];
        const indices = OrderedSet.ofSingleton(groupId);
        return StructureElement.Loci(structure.target, [{ unit, indices }]);
    }
    return EmptyLoci;
}
//
export function createStructureElementSphereMesh(ctx, structure, theme, props, mesh) {
    const { child } = structure;
    const { detail, sizeFactor, stride } = props;
    const { getSerialIndex } = structure.serialMapping;
    const structureElementCount = structure.elementCount;
    const vertexCount = structureElementCount * sphereVertexCount(detail);
    const builderState = MeshBuilder.createState(vertexCount, vertexCount / 2, mesh);
    const themeSize = theme.size.size;
    const center = Vec3();
    let maxSize = 0;
    let count = 0;
    for (const unit of structure.units) {
        const childUnit = child === null || child === void 0 ? void 0 : child.unitMap.get(unit.id);
        if (child && !childUnit)
            continue;
        const { elements, conformation: c } = unit;
        const elementCount = elements.length;
        const v = Vec3();
        const ignore = makeElementIgnoreTest(structure, unit, props);
        const l = StructureElement.Location.create(structure, unit);
        for (let i = 0; i < elementCount; i++) {
            const eI = elements[i];
            if (stride && i % stride !== 0)
                continue;
            if (ignore && ignore(eI))
                continue;
            c.position(eI, v);
            v3add(center, center, v);
            count += 1;
            l.element = eI;
            const size = themeSize(l);
            if (size > maxSize)
                maxSize = size;
            builderState.currentGroup = getSerialIndex(unit, eI);
            addSphere(builderState, v, size * sizeFactor, detail);
        }
    }
    const oldBoundingSphere = mesh ? Sphere3D.clone(mesh.boundingSphere) : undefined;
    const m = MeshBuilder.getMesh(builderState);
    if (count === 0)
        return m;
    // re-use boundingSphere if it has not changed much
    let boundingSphere;
    Vec3.scale(center, center, 1 / count);
    if (oldBoundingSphere && Vec3.distance(center, oldBoundingSphere.center) / oldBoundingSphere.radius < 1.0) {
        boundingSphere = oldBoundingSphere;
    }
    else {
        boundingSphere = Sphere3D.expand(Sphere3D(), (child !== null && child !== void 0 ? child : structure).boundary.sphere, maxSize * sizeFactor + 0.05);
    }
    m.setBoundingSphere(boundingSphere);
    return m;
}
export function createStructureElementSphereImpostor(ctx, structure, theme, props, spheres) {
    const { child } = structure;
    const { sizeFactor, stride } = props;
    const { getSerialIndex } = structure.serialMapping;
    const structureElementCount = structure.elementCount;
    const builder = SpheresBuilder.create(structureElementCount, structureElementCount / 2, spheres);
    const themeSize = theme.size.size;
    const center = Vec3();
    let maxSize = 0;
    let count = 0;
    for (const unit of structure.units) {
        const childUnit = child === null || child === void 0 ? void 0 : child.unitMap.get(unit.id);
        if (child && !childUnit)
            return Spheres.createEmpty(spheres);
        const { elements, conformation: c } = unit;
        const elementCount = elements.length;
        const v = Vec3();
        const ignore = makeElementIgnoreTest(structure, unit, props);
        const l = StructureElement.Location.create(structure, unit);
        if ((stride && stride > 1) || ignore || theme.size.granularity !== 'uniform') {
            for (let i = 0; i < elementCount; i++) {
                const eI = elements[i];
                if (stride && i % stride !== 0)
                    continue;
                if (ignore && ignore(eI))
                    continue;
                c.position(eI, v);
                builder.add(v[0], v[1], v[2], getSerialIndex(unit, eI));
                v3add(center, center, v);
                count += 1;
                l.element = eI;
                const size = themeSize(l);
                if (size > maxSize)
                    maxSize = size;
            }
        }
        else {
            for (let i = 0; i < elementCount; i++) {
                const eI = elements[i];
                c.position(eI, v);
                builder.add(v[0], v[1], v[2], getSerialIndex(unit, eI));
                v3add(center, center, v);
            }
            count += elementCount;
            maxSize = themeSize(l);
        }
    }
    const oldBoundingSphere = spheres ? Sphere3D.clone(spheres.boundingSphere) : undefined;
    const s = builder.getSpheres();
    if (count === 0)
        return s;
    // re-use boundingSphere if it has not changed much
    let boundingSphere;
    Vec3.scale(center, center, 1 / count);
    if (oldBoundingSphere && Vec3.distance(center, oldBoundingSphere.center) / oldBoundingSphere.radius < 1.0) {
        boundingSphere = oldBoundingSphere;
    }
    else {
        boundingSphere = Sphere3D.expand(Sphere3D(), (child !== null && child !== void 0 ? child : structure).boundary.sphere, maxSize * sizeFactor + 0.05);
    }
    s.setBoundingSphere(boundingSphere);
    return s;
}
export function eachSerialElement(loci, structure, apply) {
    let changed = false;
    if (!StructureElement.Loci.is(loci))
        return false;
    if (!Structure.areEquivalent(loci.structure, structure))
        return false;
    const { cumulativeUnitElementCount } = structure.serialMapping;
    for (const e of loci.elements) {
        const unitIdx = structure.unitIndexMap.get(e.unit.id);
        if (unitIdx !== undefined) {
            if (Interval.is(e.indices)) {
                const start = cumulativeUnitElementCount[unitIdx] + Interval.start(e.indices);
                const end = cumulativeUnitElementCount[unitIdx] + Interval.end(e.indices);
                if (apply(Interval.ofBounds(start, end)))
                    changed = true;
            }
            else {
                for (let i = 0, _i = e.indices.length; i < _i; i++) {
                    const idx = cumulativeUnitElementCount[unitIdx] + e.indices[i];
                    if (apply(Interval.ofSingleton(idx)))
                        changed = true;
                }
            }
        }
    }
    return changed;
}
export function getSerialElementLoci(pickingId, structure, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const { unitIndices, cumulativeUnitElementCount } = structure.serialMapping;
        const unitIdx = unitIndices[groupId];
        const unit = structure.units[unitIdx];
        const idx = groupId - cumulativeUnitElementCount[unitIdx];
        const indices = OrderedSet.ofSingleton(idx);
        return StructureElement.Loci(structure, [{ unit, indices }]);
    }
    return EmptyLoci;
}
//
export var ElementIterator;
(function (ElementIterator) {
    function fromGroup(structureGroup) {
        const { group, structure } = structureGroup;
        const groupCount = group.elements.length;
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
    ElementIterator.fromGroup = fromGroup;
    function fromStructure(structure) {
        const { units, elementCount } = structure;
        const groupCount = elementCount;
        const instanceCount = 1;
        const { unitIndices, elementIndices } = structure.serialMapping;
        const location = StructureElement.Location.create(structure);
        const getLocation = (groupIndex) => {
            location.unit = units[unitIndices[groupIndex]];
            location.element = elementIndices[groupIndex];
            return location;
        };
        return LocationIterator(groupCount, instanceCount, 1, getLocation, true);
    }
    ElementIterator.fromStructure = fromStructure;
})(ElementIterator || (ElementIterator = {}));
