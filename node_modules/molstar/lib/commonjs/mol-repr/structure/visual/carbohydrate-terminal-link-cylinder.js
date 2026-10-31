"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbohydrateTerminalLinkParams = void 0;
exports.CarbohydrateTerminalLinkVisual = CarbohydrateTerminalLinkVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const structure_1 = require("../../../mol-model/structure");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const link_1 = require("./util/link");
const units_visual_1 = require("../units-visual");
const complex_visual_1 = require("../complex-visual");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const int_1 = require("../../../mol-data/int");
const loci_1 = require("../../../mol-model/loci");
const common_1 = require("../../../mol-model/structure/structure/unit/bonds/common");
const common_2 = require("./util/common");
const geometry_1 = require("../../../mol-math/geometry");
function createCarbohydrateTerminalLinkCylinderMesh(ctx, structure, theme, props, mesh) {
    const { terminalLinks, elements } = structure.carbohydrates;
    const { terminalLinkSizeFactor } = props;
    const location = structure_1.StructureElement.Location.create(structure);
    const builderProps = {
        linkCount: terminalLinks.length,
        position: (posA, posB, edgeIndex) => {
            const l = terminalLinks[edgeIndex];
            if (l.fromCarbohydrate) {
                linear_algebra_1.Vec3.copy(posA, elements[l.carbohydrateIndex].geometry.center);
                l.elementUnit.conformation.position(l.elementUnit.elements[l.elementIndex], posB);
            }
            else {
                l.elementUnit.conformation.position(l.elementUnit.elements[l.elementIndex], posA);
                linear_algebra_1.Vec3.copy(posB, elements[l.carbohydrateIndex].geometry.center);
            }
        },
        radius: (edgeIndex) => {
            const l = terminalLinks[edgeIndex];
            if (l.fromCarbohydrate) {
                const carb = elements[l.carbohydrateIndex];
                const ring = carb.unit.rings.all[carb.ringIndex];
                location.unit = carb.unit;
                location.element = carb.unit.elements[ring[0]];
            }
            else {
                location.unit = l.elementUnit;
                location.element = l.elementUnit.elements[l.elementIndex];
            }
            return theme.size.size(location) * terminalLinkSizeFactor;
        },
        style: (edgeIndex) => {
            const l = terminalLinks[edgeIndex];
            const eI = l.elementUnit.elements[l.elementIndex];
            const beI = (0, common_1.getElementIdx)(l.elementUnit.model.atomicHierarchy.atoms.type_symbol.value(eI));
            return common_1.MetalsSet.has(beI) ? 1 /* LinkStyle.Dashed */ : 0 /* LinkStyle.Solid */;
        }
    };
    const { mesh: m, boundingSphere } = (0, link_1.createLinkCylinderMesh)(ctx, builderProps, props, mesh);
    if (boundingSphere) {
        m.setBoundingSphere(boundingSphere);
    }
    else if (m.triangleCount > 0) {
        const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), structure.boundary.sphere, 1 * terminalLinkSizeFactor);
        m.setBoundingSphere(sphere);
    }
    return m;
}
exports.CarbohydrateTerminalLinkParams = {
    ...units_visual_1.UnitsMeshParams,
    ...link_1.LinkCylinderParams,
    terminalLinkSizeFactor: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 3, step: 0.01 }),
};
function CarbohydrateTerminalLinkVisual(materialId) {
    return (0, complex_visual_1.ComplexMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.CarbohydrateTerminalLinkParams),
        createGeometry: createCarbohydrateTerminalLinkCylinderMesh,
        createLocationIterator: CarbohydrateTerminalLinkIterator,
        getLoci: getTerminalLinkLoci,
        eachLocation: eachTerminalLink,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.terminalLinkSizeFactor !== currentProps.terminalLinkSizeFactor ||
                newProps.radialSegments !== currentProps.radialSegments ||
                newProps.linkCap !== currentProps.linkCap);
        }
    }, materialId);
}
function CarbohydrateTerminalLinkIterator(structure) {
    const { elements, terminalLinks } = structure.carbohydrates;
    const groupCount = terminalLinks.length;
    const instanceCount = 1;
    const location = structure_1.StructureElement.Location.create(structure);
    const getLocation = (groupIndex) => {
        const terminalLink = terminalLinks[groupIndex];
        if (terminalLink.fromCarbohydrate) {
            const carb = elements[terminalLink.carbohydrateIndex];
            const ring = carb.unit.rings.all[carb.ringIndex];
            location.unit = carb.unit;
            location.element = carb.unit.elements[ring[0]];
        }
        else {
            location.unit = terminalLink.elementUnit;
            location.element = terminalLink.elementUnit.elements[terminalLink.elementIndex];
        }
        return location;
    };
    return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation, true);
}
function getTerminalLinkLoci(pickingId, structure, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const { terminalLinks, elements } = structure.carbohydrates;
        const l = terminalLinks[groupId];
        const carb = elements[l.carbohydrateIndex];
        return structure_1.StructureElement.Loci.union((0, common_2.getAltResidueLociFromId)(structure, carb.unit, carb.residueIndex, carb.altId), (0, common_2.getAltResidueLoci)(structure, l.elementUnit, l.elementUnit.elements[l.elementIndex]));
    }
    return loci_1.EmptyLoci;
}
const __linkIndicesSet = new Set();
function eachTerminalLink(loci, structure, apply) {
    let changed = false;
    if (!structure_1.StructureElement.Loci.is(loci))
        return false;
    if (!structure_1.Structure.areEquivalent(loci.structure, structure))
        return false;
    const { getTerminalLinkIndices } = structure.carbohydrates;
    for (const { unit, indices } of loci.elements) {
        if (!structure_1.Unit.isAtomic(unit))
            continue;
        __linkIndicesSet.clear();
        int_1.OrderedSet.forEach(indices, v => {
            const linkIndices = getTerminalLinkIndices(unit, unit.elements[v]);
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
