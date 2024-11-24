"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbohydrateLinkParams = void 0;
exports.CarbohydrateLinkVisual = CarbohydrateLinkVisual;
const structure_1 = require("../../../mol-model/structure");
const loci_1 = require("../../../mol-model/loci");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const link_1 = require("./util/link");
const int_1 = require("../../../mol-data/int");
const complex_visual_1 = require("../complex-visual");
const units_visual_1 = require("../units-visual");
const param_definition_1 = require("../../../mol-util/param-definition");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const common_1 = require("./util/common");
const geometry_1 = require("../../../mol-math/geometry");
function createCarbohydrateLinkCylinderMesh(ctx, structure, theme, props, mesh) {
    const { links, elements } = structure.carbohydrates;
    const { linkSizeFactor } = props;
    const location = structure_1.StructureElement.Location.create(structure);
    const builderProps = {
        linkCount: links.length,
        position: (posA, posB, edgeIndex) => {
            const l = links[edgeIndex];
            linear_algebra_1.Vec3.copy(posA, elements[l.carbohydrateIndexA].geometry.center);
            linear_algebra_1.Vec3.copy(posB, elements[l.carbohydrateIndexB].geometry.center);
        },
        radius: (edgeIndex) => {
            const l = links[edgeIndex];
            const carbA = elements[l.carbohydrateIndexA];
            const ringA = carbA.unit.rings.all[carbA.ringIndex];
            location.unit = carbA.unit;
            location.element = carbA.unit.elements[ringA[0]];
            return theme.size.size(location) * linkSizeFactor;
        },
    };
    const { mesh: m, boundingSphere } = (0, link_1.createLinkCylinderMesh)(ctx, builderProps, props, mesh);
    if (boundingSphere) {
        m.setBoundingSphere(boundingSphere);
    }
    else if (m.triangleCount > 0) {
        const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), structure.boundary.sphere, 1 * linkSizeFactor);
        m.setBoundingSphere(sphere);
    }
    return m;
}
exports.CarbohydrateLinkParams = {
    ...units_visual_1.UnitsMeshParams,
    ...link_1.LinkCylinderParams,
    linkSizeFactor: param_definition_1.ParamDefinition.Numeric(0.3, { min: 0, max: 3, step: 0.01 }),
};
function CarbohydrateLinkVisual(materialId) {
    return (0, complex_visual_1.ComplexMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.CarbohydrateLinkParams),
        createGeometry: createCarbohydrateLinkCylinderMesh,
        createLocationIterator: CarbohydrateLinkIterator,
        getLoci: getLinkLoci,
        eachLocation: eachCarbohydrateLink,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.linkSizeFactor !== currentProps.linkSizeFactor ||
                newProps.radialSegments !== currentProps.radialSegments ||
                newProps.linkCap !== currentProps.linkCap);
        }
    }, materialId);
}
function CarbohydrateLinkIterator(structure) {
    const { elements, links } = structure.carbohydrates;
    const groupCount = links.length;
    const instanceCount = 1;
    const location = structure_1.StructureElement.Location.create(structure);
    const getLocation = (groupIndex) => {
        const link = links[groupIndex];
        const carbA = elements[link.carbohydrateIndexA];
        const ringA = carbA.unit.rings.all[carbA.ringIndex];
        location.unit = carbA.unit;
        location.element = carbA.unit.elements[ringA[0]];
        return location;
    };
    return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation, true);
}
function getLinkLoci(pickingId, structure, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const { links, elements } = structure.carbohydrates;
        const l = links[groupId];
        const carbA = elements[l.carbohydrateIndexA];
        const carbB = elements[l.carbohydrateIndexB];
        return structure_1.StructureElement.Loci.union((0, common_1.getAltResidueLociFromId)(structure, carbA.unit, carbA.residueIndex, carbA.altId), (0, common_1.getAltResidueLociFromId)(structure, carbB.unit, carbB.residueIndex, carbB.altId));
    }
    return loci_1.EmptyLoci;
}
const __linkIndicesSet = new Set();
function eachCarbohydrateLink(loci, structure, apply) {
    let changed = false;
    if (!structure_1.StructureElement.Loci.is(loci))
        return false;
    if (!structure_1.Structure.areEquivalent(loci.structure, structure))
        return false;
    const { getLinkIndices } = structure.carbohydrates;
    for (const { unit, indices } of loci.elements) {
        if (!structure_1.Unit.isAtomic(unit))
            continue;
        __linkIndicesSet.clear();
        int_1.OrderedSet.forEach(indices, v => {
            const linkIndices = getLinkIndices(unit, unit.elements[v]);
            for (let i = 0, il = linkIndices.length; i < il; ++i) {
                if (!__linkIndicesSet.has(linkIndices[i])) {
                    __linkIndicesSet.add(linkIndices[i]);
                    if (apply(int_1.Interval.ofSingleton(linkIndices[i])))
                        changed = true;
                }
            }
        });
    }
    return changed;
}
