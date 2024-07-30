"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCommonSurfaceProps = exports.CommonSurfaceParams = exports.UnitKindOptions = exports.UnitKindInfo = void 0;
exports.getResidueLoci = getResidueLoci;
exports.getAltResidueLoci = getAltResidueLoci;
exports.getAltResidueLociFromId = getAltResidueLociFromId;
exports.createUnitsTransform = createUnitsTransform;
exports.includesUnitKind = includesUnitKind;
exports.getVolumeSliceInfo = getVolumeSliceInfo;
exports.ensureReasonableResolution = ensureReasonableResolution;
exports.getConformation = getConformation;
exports.getUnitConformationAndRadius = getUnitConformationAndRadius;
exports.getStructureConformationAndRadius = getStructureConformationAndRadius;
exports.isHydrogen = isHydrogen;
exports.isH = isH;
exports.isTrace = isTrace;
const structure_1 = require("../../../../mol-model/structure");
const linear_algebra_1 = require("../../../../mol-math/linear-algebra");
const transform_data_1 = require("../../../../mol-geo/geometry/transform-data");
const int_1 = require("../../../../mol-data/int");
const loci_1 = require("../../../../mol-model/loci");
const atomic_1 = require("../../../../mol-model/structure/model/properties/atomic");
const array_1 = require("../../../../mol-util/array");
const param_definition_1 = require("../../../../mol-util/param-definition");
const boundary_1 = require("../../../../mol-math/geometry/boundary");
const geometry_1 = require("../../../../mol-math/geometry");
const functional_group_1 = require("../../../../mol-model-props/computed/chemistry/functional-group");
// avoiding namespace lookup improved performance in Chrome (Aug 2020)
const m4toArray = linear_algebra_1.Mat4.toArray;
/** Return a Loci for the elements of a whole residue the elementIndex belongs to. */
function getResidueLoci(structure, unit, elementIndex) {
    const { elements, model } = unit;
    if (int_1.OrderedSet.indexOf(elements, elementIndex) !== -1) {
        const { index, offsets } = model.atomicHierarchy.residueAtomSegments;
        const rI = index[elementIndex];
        const _indices = [];
        for (let i = offsets[rI], il = offsets[rI + 1]; i < il; ++i) {
            const unitIndex = int_1.OrderedSet.indexOf(elements, i);
            if (unitIndex !== -1)
                _indices.push(unitIndex);
        }
        const indices = int_1.OrderedSet.ofSortedArray(int_1.SortedArray.ofSortedArray(_indices));
        return structure_1.StructureElement.Loci(structure, [{ unit, indices }]);
    }
    return loci_1.EmptyLoci;
}
/**
 * Return a Loci for the elements of a whole residue the elementIndex belongs to but
 * restrict to elements that have the same label_alt_id or none
 */
function getAltResidueLoci(structure, unit, elementIndex) {
    const { elements, model } = unit;
    const { label_alt_id } = model.atomicHierarchy.atoms;
    const elementAltId = label_alt_id.value(elementIndex);
    if (int_1.OrderedSet.indexOf(elements, elementIndex) !== -1) {
        const { index } = model.atomicHierarchy.residueAtomSegments;
        const rI = index[elementIndex];
        return getAltResidueLociFromId(structure, unit, rI, elementAltId);
    }
    return structure_1.StructureElement.Loci(structure, []);
}
function getAltResidueLociFromId(structure, unit, residueIndex, elementAltId) {
    const { elements, model } = unit;
    const { label_alt_id } = model.atomicHierarchy.atoms;
    const { offsets } = model.atomicHierarchy.residueAtomSegments;
    const _indices = [];
    for (let i = offsets[residueIndex], il = offsets[residueIndex + 1]; i < il; ++i) {
        const unitIndex = int_1.OrderedSet.indexOf(elements, i);
        if (unitIndex !== -1) {
            const altId = label_alt_id.value(i);
            if (elementAltId === altId || altId === '') {
                _indices.push(unitIndex);
            }
        }
    }
    const indices = int_1.OrderedSet.ofSortedArray(int_1.SortedArray.ofSortedArray(_indices));
    return structure_1.StructureElement.Loci(structure, [{ unit, indices }]);
}
function createUnitsTransform(structureGroup, includeParent, invariantBoundingSphere, cellSize, batchSize, transformData) {
    const { child } = structureGroup.structure;
    const units = includeParent && child
        ? structureGroup.group.units.filter(u => child.unitMap.has(u.id))
        : structureGroup.group.units;
    const unitCount = units.length;
    const n = unitCount * 16;
    const array = transformData && transformData.aTransform.ref.value.length >= n ? transformData.aTransform.ref.value : new Float32Array(n);
    for (let i = 0; i < unitCount; i++) {
        m4toArray(units[i].conformation.operator.matrix, array, i * 16);
    }
    return (0, transform_data_1.createTransform)(array, unitCount, invariantBoundingSphere, cellSize, batchSize, transformData);
}
exports.UnitKindInfo = {
    'atomic': {},
    'spheres': {},
    'gaussians': {},
};
exports.UnitKindOptions = param_definition_1.ParamDefinition.objectToOptions(exports.UnitKindInfo);
function includesUnitKind(unitKinds, unit) {
    for (let i = 0, il = unitKinds.length; i < il; ++i) {
        if (structure_1.Unit.isAtomic(unit) && unitKinds[i] === 'atomic')
            return true;
        if (structure_1.Unit.isSpheres(unit) && unitKinds[i] === 'spheres')
            return true;
        if (structure_1.Unit.isGaussians(unit) && unitKinds[i] === 'gaussians')
            return true;
    }
    return false;
}
//
const DefaultMaxCells = 500000000;
function getVolumeSliceInfo(box, resolution, maxCells = DefaultMaxCells) {
    const size = geometry_1.Box3D.size((0, linear_algebra_1.Vec3)(), box);
    linear_algebra_1.Vec3.ceil(size, size);
    size.sort((a, b) => b - a); // descending
    const maxAreaCells = Math.floor(Math.cbrt(maxCells) * Math.cbrt(maxCells));
    const area = size[0] * size[1];
    const areaCells = Math.ceil(area / (resolution * resolution));
    return { area, areaCells, maxAreaCells };
}
/**
 * Guard against overly high resolution for the given box size.
 * Internally it uses the largest 2d slice of the box to determine the
 * maximum resolution to account for the 2d texture layout on the GPU.
 */
function ensureReasonableResolution(box, props, maxCells = DefaultMaxCells) {
    const { area, areaCells, maxAreaCells } = getVolumeSliceInfo(box, props.resolution, maxCells);
    const resolution = areaCells > maxAreaCells ? Math.sqrt(area / maxAreaCells) : props.resolution;
    return { ...props, resolution };
}
function getConformation(unit) {
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */: return unit.model.atomicConformation;
        case 1 /* Unit.Kind.Spheres */: return unit.model.coarseConformation.spheres;
        case 2 /* Unit.Kind.Gaussians */: return unit.model.coarseConformation.gaussians;
    }
}
exports.CommonSurfaceParams = {
    ignoreHydrogens: param_definition_1.ParamDefinition.Boolean(false, { description: 'Whether or not to include hydrogen atoms in the surface calculation.' }),
    ignoreHydrogensVariant: param_definition_1.ParamDefinition.Select('all', param_definition_1.ParamDefinition.arrayToOptions(['all', 'non-polar'])),
    traceOnly: param_definition_1.ParamDefinition.Boolean(false, { description: 'Whether or not to only use trace atoms in the surface calculation.' }),
    includeParent: param_definition_1.ParamDefinition.Boolean(false, { description: 'Include elements of the parent structure in surface calculation to get a surface patch of the current structure.' }),
};
exports.DefaultCommonSurfaceProps = param_definition_1.ParamDefinition.getDefaultValues(exports.CommonSurfaceParams);
const v = (0, linear_algebra_1.Vec3)();
function squaredDistance(x, y, z, center) {
    return linear_algebra_1.Vec3.squaredDistance(linear_algebra_1.Vec3.set(v, x, y, z), center);
}
/** marks `indices` for filtering/ignoring in `id` when not in `elements` */
function filterUnitId(id, elements, indices) {
    let start = 0;
    const end = elements.length;
    for (let i = 0, il = indices.length; i < il; ++i) {
        const idx = int_1.SortedArray.indexOfInRange(elements, indices[i], start, end);
        if (idx === -1) {
            id[i] = -2;
        }
        else {
            id[i] = idx;
            start = idx;
        }
    }
}
function getUnitConformationAndRadius(structure, unit, sizeTheme, props) {
    const { ignoreHydrogens, ignoreHydrogensVariant, traceOnly, includeParent } = props;
    const rootUnit = includeParent ? structure.root.unitMap.get(unit.id) : unit;
    const differentRoot = includeParent && rootUnit !== unit;
    const { x, y, z } = getConformation(rootUnit);
    const { elements } = rootUnit;
    const { center, radius: sphereRadius } = unit.boundary.sphere;
    const extraRadius = (4 + 1.5) * 2; // TODO should be twice (the max vdW/sphere radius plus the probe radius)
    const radiusSq = (sphereRadius + extraRadius) * (sphereRadius + extraRadius);
    let indices;
    let id;
    if (ignoreHydrogens || traceOnly || differentRoot) {
        const _indices = [];
        const _id = [];
        for (let i = 0, il = elements.length; i < il; ++i) {
            const eI = elements[i];
            if (ignoreHydrogens && isHydrogen(structure, rootUnit, eI, ignoreHydrogensVariant))
                continue;
            if (traceOnly && !isTrace(rootUnit, eI))
                continue;
            if (differentRoot && squaredDistance(x[eI], y[eI], z[eI], center) > radiusSq)
                continue;
            _indices.push(eI);
            _id.push(i);
        }
        indices = int_1.SortedArray.ofSortedArray(_indices);
        id = _id;
    }
    else {
        indices = elements;
        id = (0, array_1.fillSerial)(new Int32Array(indices.length));
    }
    if (includeParent && rootUnit !== unit) {
        filterUnitId(id, unit.elements, indices);
    }
    const position = { indices, x, y, z, id };
    const boundary = differentRoot ? (0, boundary_1.getBoundary)(position) : unit.boundary;
    const l = structure_1.StructureElement.Location.create(structure, rootUnit);
    const radius = (index) => {
        l.element = index;
        return sizeTheme.size(l);
    };
    return { position, boundary, radius };
}
function getStructureConformationAndRadius(structure, sizeTheme, props) {
    const { ignoreHydrogens, ignoreHydrogensVariant, traceOnly, includeParent } = props;
    const differentRoot = includeParent && !!structure.parent;
    const l = structure_1.StructureElement.Location.create(structure.root);
    const { center, radius: sphereRadius } = structure.boundary.sphere;
    const extraRadius = (4 + 1.5) * 2; // TODO should be twice (the max vdW/sphere radius plus the probe radius)
    const radiusSq = (sphereRadius + extraRadius) * (sphereRadius + extraRadius);
    let xs;
    let ys;
    let zs;
    let rs;
    let id;
    let indices;
    if (ignoreHydrogens || traceOnly || differentRoot) {
        const { getSerialIndex } = structure.serialMapping;
        const units = differentRoot ? structure.root.units : structure.units;
        const _xs = [];
        const _ys = [];
        const _zs = [];
        const _rs = [];
        const _id = [];
        for (let i = 0, il = units.length; i < il; ++i) {
            const unit = units[i];
            const { elements, conformation: c } = unit;
            const childUnit = structure.unitMap.get(unit.id);
            l.unit = unit;
            for (let j = 0, jl = elements.length; j < jl; ++j) {
                const eI = elements[j];
                if (ignoreHydrogens && isHydrogen(structure, unit, eI, ignoreHydrogensVariant))
                    continue;
                if (traceOnly && !isTrace(unit, eI))
                    continue;
                const _x = c.x(eI), _y = c.y(eI), _z = c.z(eI);
                if (differentRoot && squaredDistance(_x, _y, _z, center) > radiusSq)
                    continue;
                _xs.push(_x);
                _ys.push(_y);
                _zs.push(_z);
                l.element = eI;
                _rs.push(sizeTheme.size(l));
                if (differentRoot) {
                    const idx = childUnit ? int_1.SortedArray.indexOf(childUnit.elements, eI) : -1;
                    if (idx === -1) {
                        _id.push(-2); // mark for filtering/ignoring when not in `elements`
                    }
                    else {
                        _id.push(getSerialIndex(childUnit, eI));
                    }
                }
                else {
                    _id.push(getSerialIndex(unit, eI));
                }
            }
        }
        xs = _xs, ys = _ys, zs = _zs, rs = _rs;
        id = _id;
        indices = int_1.OrderedSet.ofRange(0, id.length);
    }
    else {
        const { elementCount } = structure;
        const _xs = new Float32Array(elementCount);
        const _ys = new Float32Array(elementCount);
        const _zs = new Float32Array(elementCount);
        const _rs = new Float32Array(elementCount);
        for (let i = 0, m = 0, il = structure.units.length; i < il; ++i) {
            const unit = structure.units[i];
            const { elements, conformation: c } = unit;
            l.unit = unit;
            for (let j = 0, jl = elements.length; j < jl; ++j) {
                const eI = elements[j];
                const mj = m + j;
                _xs[mj] = c.x(eI);
                _ys[mj] = c.y(eI);
                _zs[mj] = c.z(eI);
                l.element = eI;
                _rs[mj] = sizeTheme.size(l);
            }
            m += elements.length;
        }
        xs = _xs, ys = _ys, zs = _zs, rs = _rs;
        id = (0, array_1.fillSerial)(new Uint32Array(elementCount));
        indices = int_1.OrderedSet.ofRange(0, id.length);
    }
    const position = { indices, x: xs, y: ys, z: zs, id };
    const boundary = differentRoot ? (0, boundary_1.getBoundary)(position) : structure.boundary;
    const radius = (index) => rs[index];
    return { position, boundary, radius };
}
const _H = atomic_1.AtomicNumbers['H'];
function isHydrogen(structure, unit, element, variant) {
    if (structure_1.Unit.isCoarse(unit))
        return false;
    if (unit.model.atomicHierarchy.derived.atom.atomicNumber[element] !== _H)
        return false;
    if (variant === 'all')
        return true;
    const polar = (0, functional_group_1.hasPolarNeighbour)(structure, unit, int_1.SortedArray.indexOf(unit.elements, element));
    if (polar && variant === 'polar')
        return true;
    if (!polar && variant === 'non-polar')
        return true;
    return false;
}
function isH(atomicNumber, element) {
    return atomicNumber[element] === _H;
}
function isTrace(unit, element) {
    if (structure_1.Unit.isCoarse(unit))
        return true;
    const atomId = unit.model.atomicHierarchy.atoms.label_atom_id.value(element);
    if (atomId === 'CA' || atomId === 'BB' || atomId === 'P')
        return true;
    return false;
}
