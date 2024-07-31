"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionsIntraUnitParams = void 0;
exports.InteractionsIntraUnitVisual = InteractionsIntraUnitVisual;
const structure_1 = require("../../../mol-model/structure");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const loci_1 = require("../../../mol-model/loci");
const int_1 = require("../../../mol-data/int");
const param_definition_1 = require("../../../mol-util/param-definition");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const interactions_1 = require("../interactions");
const link_1 = require("../../../mol-repr/structure/visual/util/link");
const units_visual_1 = require("../../../mol-repr/structure/units-visual");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const interactions_2 = require("../interactions/interactions");
const common_1 = require("../interactions/common");
const geometry_1 = require("../../../mol-math/geometry");
const common_2 = require("../../../mol-repr/structure/visual/util/common");
const type_helpers_1 = require("../../../mol-util/type-helpers");
const shared_1 = require("./shared");
const common_3 = require("../interactions/common");
const util_1 = require("../chemistry/util");
async function createIntraUnitInteractionsCylinderMesh(ctx, unit, structure, theme, props, mesh) {
    if (!structure_1.Unit.isAtomic(unit))
        return mesh_1.Mesh.createEmpty(mesh);
    const { child } = structure;
    const childUnit = child === null || child === void 0 ? void 0 : child.unitMap.get(unit.id);
    if (child && !childUnit)
        return mesh_1.Mesh.createEmpty(mesh);
    const location = structure_1.StructureElement.Location.create(structure, unit);
    const interactions = interactions_1.InteractionsProvider.get(structure).value;
    const features = interactions.unitsFeatures.get(unit.id);
    const contacts = interactions.unitsContacts.get(unit.id);
    const { x, y, z, members, offsets, types } = features;
    const { edgeCount, a, b, edgeProps: { flag, type } } = contacts;
    const { sizeFactor, ignoreHydrogens, ignoreHydrogensVariant, parentDisplay } = props;
    if (!edgeCount)
        return mesh_1.Mesh.createEmpty(mesh);
    const { elements, conformation: c } = unit;
    const p = (0, linear_algebra_1.Vec3)();
    const pA = (0, linear_algebra_1.Vec3)();
    const pB = (0, linear_algebra_1.Vec3)();
    const builderProps = {
        linkCount: edgeCount * 2,
        position: (posA, posB, edgeIndex) => {
            const t = type[edgeIndex];
            if ((!ignoreHydrogens || ignoreHydrogensVariant !== 'all') && (t === common_3.InteractionType.HydrogenBond || (t === common_3.InteractionType.WeakHydrogenBond && ignoreHydrogensVariant !== 'non-polar'))) {
                const idxA = members[offsets[a[edgeIndex]]];
                const idxB = members[offsets[b[edgeIndex]]];
                c.invariantPosition(elements[idxA], pA);
                c.invariantPosition(elements[idxB], pB);
                let minDistA = linear_algebra_1.Vec3.distance(pA, pB);
                let minDistB = minDistA;
                linear_algebra_1.Vec3.copy(posA, pA);
                linear_algebra_1.Vec3.copy(posB, pB);
                const donorType = t === common_3.InteractionType.HydrogenBond ? 4 /* FeatureType.HydrogenDonor */ : 9 /* FeatureType.WeakHydrogenDonor */;
                const isHydrogenDonorA = types[offsets[a[edgeIndex]]] === donorType;
                if (isHydrogenDonorA) {
                    (0, util_1.eachIntraBondedAtom)(unit, idxA, (_, idx) => {
                        if ((0, common_2.isHydrogen)(structure, unit, elements[idx], 'all')) {
                            c.invariantPosition(elements[idx], p);
                            const dist = linear_algebra_1.Vec3.distance(p, pB);
                            if (dist < minDistA) {
                                minDistA = dist;
                                linear_algebra_1.Vec3.copy(posA, p);
                            }
                        }
                    });
                }
                else {
                    (0, util_1.eachIntraBondedAtom)(unit, idxB, (_, idx) => {
                        if ((0, common_2.isHydrogen)(structure, unit, elements[idx], 'all')) {
                            c.invariantPosition(elements[idx], p);
                            const dist = linear_algebra_1.Vec3.distance(p, pA);
                            if (dist < minDistB) {
                                minDistB = dist;
                                linear_algebra_1.Vec3.copy(posB, p);
                            }
                        }
                    });
                }
            }
            else {
                linear_algebra_1.Vec3.set(posA, x[a[edgeIndex]], y[a[edgeIndex]], z[a[edgeIndex]]);
                linear_algebra_1.Vec3.set(posB, x[b[edgeIndex]], y[b[edgeIndex]], z[b[edgeIndex]]);
            }
        },
        style: (edgeIndex) => 1 /* LinkStyle.Dashed */,
        radius: (edgeIndex) => {
            location.element = elements[members[offsets[a[edgeIndex]]]];
            const sizeA = theme.size.size(location);
            location.element = elements[members[offsets[b[edgeIndex]]]];
            const sizeB = theme.size.size(location);
            return Math.min(sizeA, sizeB) * sizeFactor;
        },
        ignore: (edgeIndex) => {
            if (flag[edgeIndex] === common_1.InteractionFlag.Filtered)
                return true;
            if (childUnit) {
                if (parentDisplay === 'stub') {
                    const f = a[edgeIndex];
                    for (let i = offsets[f], il = offsets[f + 1]; i < il; ++i) {
                        const e = elements[members[offsets[i]]];
                        if (!int_1.SortedArray.has(childUnit.elements, e))
                            return true;
                    }
                }
                else if (parentDisplay === 'full' || parentDisplay === 'between') {
                    let flagA = false;
                    let flagB = false;
                    const fA = a[edgeIndex];
                    for (let i = offsets[fA], il = offsets[fA + 1]; i < il; ++i) {
                        const eA = elements[members[offsets[i]]];
                        if (!int_1.SortedArray.has(childUnit.elements, eA))
                            flagA = true;
                    }
                    const fB = b[edgeIndex];
                    for (let i = offsets[fB], il = offsets[fB + 1]; i < il; ++i) {
                        const eB = elements[members[offsets[i]]];
                        if (!int_1.SortedArray.has(childUnit.elements, eB))
                            flagB = true;
                    }
                    return parentDisplay === 'full' ? flagA && flagB : flagA === flagB;
                }
                else {
                    (0, type_helpers_1.assertUnreachable)(parentDisplay);
                }
            }
            return false;
        }
    };
    const { mesh: m, boundingSphere } = (0, link_1.createLinkCylinderMesh)(ctx, builderProps, props, mesh);
    if (boundingSphere) {
        m.setBoundingSphere(boundingSphere);
    }
    else if (m.triangleCount > 0) {
        const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), (childUnit !== null && childUnit !== void 0 ? childUnit : unit).boundary.sphere, 1 * sizeFactor);
        m.setBoundingSphere(sphere);
    }
    return m;
}
exports.InteractionsIntraUnitParams = {
    ...units_visual_1.UnitsMeshParams,
    ...link_1.LinkCylinderParams,
    ...shared_1.InteractionsSharedParams,
};
function InteractionsIntraUnitVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.InteractionsIntraUnitParams),
        createGeometry: createIntraUnitInteractionsCylinderMesh,
        createLocationIterator: createInteractionsIterator,
        getLoci: getInteractionLoci,
        eachLocation: eachInteraction,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructureGroup, currentStructureGroup) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.dashCount !== currentProps.dashCount ||
                newProps.dashScale !== currentProps.dashScale ||
                newProps.dashCap !== currentProps.dashCap ||
                newProps.radialSegments !== currentProps.radialSegments ||
                newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant ||
                newProps.parentDisplay !== currentProps.parentDisplay);
            const interactionsHash = interactions_1.InteractionsProvider.get(newStructureGroup.structure).version;
            if (state.info.interactionsHash !== interactionsHash) {
                state.createGeometry = true;
                state.updateTransform = true;
                state.updateColor = true;
                state.info.interactionsHash = interactionsHash;
            }
        }
    }, materialId);
}
function getInteractionLoci(pickingId, structureGroup, id) {
    const { objectId, instanceId, groupId } = pickingId;
    if (id === objectId) {
        const { structure, group } = structureGroup;
        const unit = structure.unitMap.get(group.units[instanceId].id);
        const interactions = interactions_1.InteractionsProvider.get(structure).value;
        const { a, b } = interactions.unitsContacts.get(unit.id);
        return interactions_2.Interactions.Loci(structure, interactions, [
            { unitA: unit, indexA: a[groupId], unitB: unit, indexB: b[groupId] },
            { unitA: unit, indexA: b[groupId], unitB: unit, indexB: a[groupId] },
        ]);
    }
    return loci_1.EmptyLoci;
}
const __contactIndicesSet = new Set();
function eachInteraction(loci, structureGroup, apply, isMarking) {
    let changed = false;
    if (interactions_2.Interactions.isLoci(loci)) {
        const { structure, group } = structureGroup;
        if (!structure_1.Structure.areEquivalent(loci.data.structure, structure))
            return false;
        const interactions = interactions_1.InteractionsProvider.get(structure).value;
        if (loci.data.interactions !== interactions)
            return false;
        const unit = group.units[0];
        const contacts = interactions.unitsContacts.get(unit.id);
        const groupCount = contacts.edgeCount * 2;
        for (const e of loci.elements) {
            if (e.unitA !== e.unitB)
                continue;
            const unitIdx = group.unitIndexMap.get(e.unitA.id);
            if (unitIdx !== undefined) {
                const idx = contacts.getDirectedEdgeIndex(e.indexA, e.indexB);
                if (idx !== -1) {
                    if (apply(int_1.Interval.ofSingleton(unitIdx * groupCount + idx)))
                        changed = true;
                }
            }
        }
    }
    else if (structure_1.StructureElement.Loci.is(loci)) {
        const { structure, group } = structureGroup;
        if (!structure_1.Structure.areEquivalent(loci.structure, structure))
            return false;
        const interactions = interactions_1.InteractionsProvider.get(structure).value;
        if (!interactions)
            return false;
        const unit = group.units[0];
        const contacts = interactions.unitsContacts.get(unit.id);
        const features = interactions.unitsFeatures.get(unit.id);
        const groupCount = contacts.edgeCount * 2;
        const { offset } = contacts;
        const { offsets: fOffsets, indices: fIndices } = features.elementsIndex;
        const { members, offsets } = features;
        for (const e of loci.elements) {
            const unitIdx = group.unitIndexMap.get(e.unit.id);
            if (unitIdx === undefined)
                continue;
            int_1.OrderedSet.forEach(e.indices, v => {
                for (let i = fOffsets[v], il = fOffsets[v + 1]; i < il; ++i) {
                    const fI = fIndices[i];
                    for (let j = offset[fI], jl = offset[fI + 1]; j < jl; ++j) {
                        __contactIndicesSet.add(j);
                    }
                }
            });
            __contactIndicesSet.forEach(i => {
                if (isMarking) {
                    const fA = contacts.a[i];
                    for (let j = offsets[fA], jl = offsets[fA + 1]; j < jl; ++j) {
                        if (!int_1.OrderedSet.has(e.indices, members[j]))
                            return;
                    }
                    const fB = contacts.b[i];
                    for (let j = offsets[fB], jl = offsets[fB + 1]; j < jl; ++j) {
                        if (!int_1.OrderedSet.has(e.indices, members[j]))
                            return;
                    }
                }
                if (apply(int_1.Interval.ofSingleton(unitIdx * groupCount + i)))
                    changed = true;
            });
            __contactIndicesSet.clear();
        }
    }
    return changed;
}
function createInteractionsIterator(structureGroup) {
    const { structure, group } = structureGroup;
    const unit = group.units[0];
    const interactions = interactions_1.InteractionsProvider.get(structure).value;
    const contacts = interactions.unitsContacts.get(unit.id);
    const groupCount = contacts.edgeCount * 2;
    const instanceCount = group.units.length;
    const location = interactions_2.Interactions.Location(interactions, structure);
    const { element } = location;
    const getLocation = (groupIndex, instanceIndex) => {
        const instanceUnit = group.units[instanceIndex];
        element.unitA = instanceUnit;
        element.indexA = contacts.a[groupIndex];
        element.unitB = instanceUnit;
        element.indexB = contacts.b[groupIndex];
        return location;
    };
    return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation);
}
