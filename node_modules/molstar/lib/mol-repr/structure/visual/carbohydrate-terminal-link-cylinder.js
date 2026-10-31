/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Structure, StructureElement, Unit } from '../../../mol-model/structure';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { createLinkCylinderMesh, LinkCylinderParams } from './util/link';
import { UnitsMeshParams } from '../units-visual';
import { ComplexMeshVisual } from '../complex-visual';
import { LocationIterator } from '../../../mol-geo/util/location-iterator';
import { OrderedSet, Interval } from '../../../mol-data/int';
import { EmptyLoci } from '../../../mol-model/loci';
import { getElementIdx, MetalsSet } from '../../../mol-model/structure/structure/unit/bonds/common';
import { getAltResidueLociFromId, getAltResidueLoci } from './util/common';
import { Sphere3D } from '../../../mol-math/geometry';
function createCarbohydrateTerminalLinkCylinderMesh(ctx, structure, theme, props, mesh) {
    const { terminalLinks, elements } = structure.carbohydrates;
    const { terminalLinkSizeFactor } = props;
    const location = StructureElement.Location.create(structure);
    const builderProps = {
        linkCount: terminalLinks.length,
        position: (posA, posB, edgeIndex) => {
            const l = terminalLinks[edgeIndex];
            if (l.fromCarbohydrate) {
                Vec3.copy(posA, elements[l.carbohydrateIndex].geometry.center);
                l.elementUnit.conformation.position(l.elementUnit.elements[l.elementIndex], posB);
            }
            else {
                l.elementUnit.conformation.position(l.elementUnit.elements[l.elementIndex], posA);
                Vec3.copy(posB, elements[l.carbohydrateIndex].geometry.center);
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
            const beI = getElementIdx(l.elementUnit.model.atomicHierarchy.atoms.type_symbol.value(eI));
            return MetalsSet.has(beI) ? 1 /* LinkStyle.Dashed */ : 0 /* LinkStyle.Solid */;
        }
    };
    const { mesh: m, boundingSphere } = createLinkCylinderMesh(ctx, builderProps, props, mesh);
    if (boundingSphere) {
        m.setBoundingSphere(boundingSphere);
    }
    else if (m.triangleCount > 0) {
        const sphere = Sphere3D.expand(Sphere3D(), structure.boundary.sphere, 1 * terminalLinkSizeFactor);
        m.setBoundingSphere(sphere);
    }
    return m;
}
export const CarbohydrateTerminalLinkParams = {
    ...UnitsMeshParams,
    ...LinkCylinderParams,
    terminalLinkSizeFactor: PD.Numeric(0.2, { min: 0, max: 3, step: 0.01 }),
};
export function CarbohydrateTerminalLinkVisual(materialId) {
    return ComplexMeshVisual({
        defaultProps: PD.getDefaultValues(CarbohydrateTerminalLinkParams),
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
    const location = StructureElement.Location.create(structure);
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
    return LocationIterator(groupCount, instanceCount, 1, getLocation, true);
}
function getTerminalLinkLoci(pickingId, structure, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const { terminalLinks, elements } = structure.carbohydrates;
        const l = terminalLinks[groupId];
        const carb = elements[l.carbohydrateIndex];
        return StructureElement.Loci.union(getAltResidueLociFromId(structure, carb.unit, carb.residueIndex, carb.altId), getAltResidueLoci(structure, l.elementUnit, l.elementUnit.elements[l.elementIndex]));
    }
    return EmptyLoci;
}
const __linkIndicesSet = new Set();
function eachTerminalLink(loci, structure, apply) {
    let changed = false;
    if (!StructureElement.Loci.is(loci))
        return false;
    if (!Structure.areEquivalent(loci.structure, structure))
        return false;
    const { getTerminalLinkIndices } = structure.carbohydrates;
    for (const { unit, indices } of loci.elements) {
        if (!Unit.isAtomic(unit))
            continue;
        __linkIndicesSet.clear();
        OrderedSet.forEach(indices, v => {
            const linkIndices = getTerminalLinkIndices(unit, unit.elements[v]);
            for (let i = 0, il = linkIndices.length; i < il; ++i) {
                if (!__linkIndicesSet.has(linkIndices[i])) {
                    __linkIndicesSet.add(linkIndices[i]);
                    if (apply(Interval.ofSingleton(linkIndices[i])))
                        changed = true;
                }
            }
        });
    }
    return changed;
}
