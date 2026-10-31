"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Paul Pillot <paul.pillot@tandemai.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionsInterUnitParams = void 0;
exports.InteractionsInterUnitVisual = InteractionsInterUnitVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const structure_1 = require("../../../mol-model/structure");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const link_1 = require("../../../mol-repr/structure/visual/util/link");
const complex_visual_1 = require("../../../mol-repr/structure/complex-visual");
const loci_1 = require("../../../mol-model/loci");
const int_1 = require("../../../mol-data/int");
const interactions_1 = require("../interactions/interactions");
const interactions_2 = require("../interactions");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const common_1 = require("../interactions/common");
const structure_2 = require("../../../mol-model/structure/structure");
const geometry_1 = require("../../../mol-math/geometry");
const type_helpers_1 = require("../../../mol-util/type-helpers");
const shared_1 = require("./shared");
const util_1 = require("../chemistry/util");
const common_2 = require("../../../mol-repr/structure/visual/util/common");
function createInterUnitInteractionCylinderMesh(ctx, structure, theme, props, mesh) {
    if (!structure.hasAtomic)
        return mesh_1.Mesh.createEmpty(mesh);
    const l = structure_1.StructureElement.Location.create(structure);
    const interactions = interactions_2.InteractionsProvider.get(structure).value;
    const { contacts, unitsFeatures } = interactions;
    const { edgeCount, edges } = contacts;
    const { sizeFactor, ignoreHydrogens, ignoreHydrogensVariant, parentDisplay } = props;
    if (!edgeCount)
        return mesh_1.Mesh.createEmpty(mesh);
    const { child } = structure;
    const p = (0, linear_algebra_1.Vec3)();
    const pA = (0, linear_algebra_1.Vec3)();
    const pB = (0, linear_algebra_1.Vec3)();
    const builderProps = {
        linkCount: edgeCount,
        position: (posA, posB, edgeIndex) => {
            const { unitA, indexA, unitB, indexB, props: { type: t } } = edges[edgeIndex];
            const fA = unitsFeatures.get(unitA);
            const fB = unitsFeatures.get(unitB);
            const uA = structure.unitMap.get(unitA);
            const uB = structure.unitMap.get(unitB);
            if ((!ignoreHydrogens || ignoreHydrogensVariant !== 'all') && (t === common_1.InteractionType.HydrogenBond || (t === common_1.InteractionType.WeakHydrogenBond && ignoreHydrogensVariant !== 'non-polar'))) {
                const idxA = fA.members[fA.offsets[indexA]];
                const idxB = fB.members[fB.offsets[indexB]];
                uA.conformation.position(uA.elements[idxA], pA);
                uB.conformation.position(uB.elements[idxB], pB);
                let minDistA = linear_algebra_1.Vec3.distance(pA, pB);
                let minDistB = minDistA;
                linear_algebra_1.Vec3.copy(posA, pA);
                linear_algebra_1.Vec3.copy(posB, pB);
                const donorType = t === common_1.InteractionType.HydrogenBond ? 4 /* FeatureType.HydrogenDonor */ : 9 /* FeatureType.WeakHydrogenDonor */;
                const isHydrogenDonorA = fA.types[fA.offsets[indexA]] === donorType;
                if (isHydrogenDonorA) {
                    (0, util_1.eachBondedAtom)(structure, uA, idxA, (u, idx) => {
                        const eI = u.elements[idx];
                        if ((0, common_2.isHydrogen)(structure, u, eI, 'all')) {
                            u.conformation.position(eI, p);
                            const dist = linear_algebra_1.Vec3.distance(p, pB);
                            if (dist < minDistA) {
                                minDistA = dist;
                                linear_algebra_1.Vec3.copy(posA, p);
                            }
                        }
                    });
                }
                else {
                    (0, util_1.eachBondedAtom)(structure, uB, idxB, (u, idx) => {
                        const eI = u.elements[idx];
                        if ((0, common_2.isHydrogen)(structure, u, eI, 'all')) {
                            u.conformation.position(eI, p);
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
                linear_algebra_1.Vec3.set(posA, fA.x[indexA], fA.y[indexA], fA.z[indexA]);
                linear_algebra_1.Vec3.transformMat4(posA, posA, uA.conformation.operator.matrix);
                linear_algebra_1.Vec3.set(posB, fB.x[indexB], fB.y[indexB], fB.z[indexB]);
                linear_algebra_1.Vec3.transformMat4(posB, posB, uB.conformation.operator.matrix);
            }
        },
        style: (edgeIndex) => 1 /* LinkStyle.Dashed */,
        radius: (edgeIndex) => {
            const b = edges[edgeIndex];
            const fA = unitsFeatures.get(b.unitA);
            l.unit = structure.unitMap.get(b.unitA);
            l.element = l.unit.elements[fA.members[fA.offsets[b.indexA]]];
            const sizeA = theme.size.size(l);
            const fB = unitsFeatures.get(b.unitB);
            l.unit = structure.unitMap.get(b.unitB);
            l.element = l.unit.elements[fB.members[fB.offsets[b.indexB]]];
            const sizeB = theme.size.size(l);
            return Math.min(sizeA, sizeB) * sizeFactor;
        },
        ignore: (edgeIndex) => {
            if (edges[edgeIndex].props.flag === common_1.InteractionFlag.Filtered)
                return true;
            if (child) {
                const b = edges[edgeIndex];
                if (parentDisplay === 'stub') {
                    const childUnitA = child.unitMap.get(b.unitA);
                    if (!childUnitA)
                        return true;
                    const unitA = structure.unitMap.get(b.unitA);
                    const { offsets, members } = unitsFeatures.get(b.unitA);
                    for (let i = offsets[b.indexA], il = offsets[b.indexA + 1]; i < il; ++i) {
                        const eA = unitA.elements[members[i]];
                        if (!int_1.SortedArray.has(childUnitA.elements, eA))
                            return true;
                    }
                }
                else if (parentDisplay === 'full' || parentDisplay === 'between') {
                    let flagA = false;
                    let flagB = false;
                    const childUnitA = child.unitMap.get(b.unitA);
                    if (!childUnitA) {
                        flagA = true;
                    }
                    else {
                        const unitA = structure.unitMap.get(b.unitA);
                        const { offsets, members } = unitsFeatures.get(b.unitA);
                        for (let i = offsets[b.indexA], il = offsets[b.indexA + 1]; i < il; ++i) {
                            const eA = unitA.elements[members[i]];
                            if (!int_1.SortedArray.has(childUnitA.elements, eA))
                                flagA = true;
                        }
                    }
                    const childUnitB = child.unitMap.get(b.unitB);
                    if (!childUnitB) {
                        flagB = true;
                    }
                    else {
                        const unitB = structure.unitMap.get(b.unitB);
                        const { offsets, members } = unitsFeatures.get(b.unitB);
                        for (let i = offsets[b.indexB], il = offsets[b.indexB + 1]; i < il; ++i) {
                            const eB = unitB.elements[members[i]];
                            if (!int_1.SortedArray.has(childUnitB.elements, eB))
                                flagB = true;
                        }
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
        const { child } = structure;
        const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), (child !== null && child !== void 0 ? child : structure).boundary.sphere, 1 * sizeFactor);
        m.setBoundingSphere(sphere);
    }
    return m;
}
exports.InteractionsInterUnitParams = {
    ...complex_visual_1.ComplexMeshParams,
    ...link_1.LinkCylinderParams,
    ...shared_1.InteractionsSharedParams,
};
function InteractionsInterUnitVisual(materialId) {
    return (0, complex_visual_1.ComplexMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.InteractionsInterUnitParams),
        createGeometry: createInterUnitInteractionCylinderMesh,
        createLocationIterator: createInteractionsIterator,
        getLoci: getInteractionLoci,
        eachLocation: eachInteraction,
        setUpdateState: (state, newProps, currentProps, newTheme, currentTheme, newStructure, currentStructure) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.dashCount !== currentProps.dashCount ||
                newProps.dashScale !== currentProps.dashScale ||
                newProps.dashCap !== currentProps.dashCap ||
                newProps.radialSegments !== currentProps.radialSegments ||
                newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant ||
                newProps.parentDisplay !== currentProps.parentDisplay);
            const interactionsHash = interactions_2.InteractionsProvider.get(newStructure).version;
            if (state.info.interactionsHash !== interactionsHash) {
                state.createGeometry = true;
                state.updateTransform = true;
                state.updateColor = true;
                state.info.interactionsHash = interactionsHash;
            }
        }
    }, materialId);
}
function getInteractionLoci(pickingId, structure, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const interactions = interactions_2.InteractionsProvider.get(structure).value;
        const c = interactions.contacts.edges[groupId];
        const unitA = structure.unitMap.get(c.unitA);
        const unitB = structure.unitMap.get(c.unitB);
        return interactions_1.Interactions.Loci(structure, interactions, [
            { unitA: unitA, indexA: c.indexA, unitB: unitB, indexB: c.indexB },
            { unitA: unitB, indexA: c.indexB, unitB: unitA, indexB: c.indexA },
        ]);
    }
    return loci_1.EmptyLoci;
}
const __unitMap = new Map();
const __contactIndicesSet = new Set();
function eachInteraction(loci, structure, apply, isMarking) {
    let changed = false;
    if (interactions_1.Interactions.isLoci(loci)) {
        if (!structure_1.Structure.areEquivalent(loci.data.structure, structure))
            return false;
        const interactions = interactions_2.InteractionsProvider.get(structure).value;
        if (loci.data.interactions !== interactions)
            return false;
        const { contacts } = interactions;
        for (const c of loci.elements) {
            const idx = contacts.getEdgeIndex(c.indexA, c.unitA.id, c.indexB, c.unitB.id);
            if (idx !== -1) {
                if (apply(int_1.Interval.ofSingleton(idx)))
                    changed = true;
            }
        }
    }
    else if (structure_1.StructureElement.Loci.is(loci)) {
        if (!structure_1.Structure.areEquivalent(loci.structure, structure))
            return false;
        if (isMarking && loci.elements.length === 1)
            return false; // only a single unit
        const interactions = interactions_2.InteractionsProvider.get(structure).value;
        if (!interactions)
            return false;
        const { contacts, unitsFeatures } = interactions;
        for (const e of loci.elements)
            __unitMap.set(e.unit.id, e.indices);
        for (const e of loci.elements) {
            const { unit } = e;
            if (!structure_2.Unit.isAtomic(unit))
                continue;
            int_1.OrderedSet.forEach(e.indices, v => {
                for (const idx of contacts.getContactIndicesForElement(v, unit)) {
                    __contactIndicesSet.add(idx);
                }
            });
        }
        __contactIndicesSet.forEach(i => {
            if (isMarking) {
                const { indexA, unitA, indexB, unitB } = contacts.edges[i];
                const indicesA = __unitMap.get(unitA);
                const indicesB = __unitMap.get(unitB);
                if (!indicesA || !indicesB)
                    return;
                const { offsets: offsetsA, members: membersA } = unitsFeatures.get(unitA);
                for (let j = offsetsA[indexA], jl = offsetsA[indexA + 1]; j < jl; ++j) {
                    if (!int_1.OrderedSet.has(indicesA, membersA[j]))
                        return;
                }
                const { offsets: offsetsB, members: membersB } = unitsFeatures.get(unitB);
                for (let j = offsetsB[indexB], jl = offsetsB[indexB + 1]; j < jl; ++j) {
                    if (!int_1.OrderedSet.has(indicesB, membersB[j]))
                        return;
                }
            }
            if (apply(int_1.Interval.ofSingleton(i)))
                changed = true;
        });
        __unitMap.clear();
        __contactIndicesSet.clear();
    }
    return changed;
}
function createInteractionsIterator(structure) {
    const interactions = interactions_2.InteractionsProvider.get(structure).value;
    const { contacts } = interactions;
    const groupCount = contacts.edgeCount;
    const instanceCount = 1;
    const location = interactions_1.Interactions.Location(interactions, structure);
    const { element } = location;
    const getLocation = (groupIndex) => {
        const c = contacts.edges[groupIndex];
        element.unitA = structure.unitMap.get(c.unitA);
        element.indexA = c.indexA;
        element.unitB = structure.unitMap.get(c.unitB);
        element.indexB = c.indexB;
        return location;
    };
    return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation, true);
}
