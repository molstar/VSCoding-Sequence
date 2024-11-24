/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Unit, StructureElement, Bond } from '../../../mol-model/structure';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { EmptyLoci, DataLoci } from '../../../mol-model/loci';
import { Representation } from '../../../mol-repr/representation';
import { UnitsRepresentation, StructureRepresentationStateBuilder, StructureRepresentationProvider, ComplexRepresentation } from '../../../mol-repr/structure/representation';
import { createLinkCylinderMesh, LinkCylinderParams } from '../../../mol-repr/structure/visual/util/link';
import { UnitsMeshParams, UnitsMeshVisual } from '../../../mol-repr/structure/units-visual';
import { LocationIterator } from '../../../mol-geo/util/location-iterator';
import { ClashesProvider, ValidationReport } from './prop';
import { ComplexMeshParams, ComplexMeshVisual } from '../../../mol-repr/structure/complex-visual';
import { Color } from '../../../mol-util/color';
import { MarkerActions } from '../../../mol-util/marker-action';
import { CentroidHelper } from '../../../mol-math/geometry/centroid-helper';
import { Sphere3D } from '../../../mol-math/geometry';
import { bondLabel } from '../../../mol-theme/label';
import { getUnitKindsParam } from '../../../mol-repr/structure/params';
//
function createIntraUnitClashCylinderMesh(ctx, unit, structure, theme, props, mesh) {
    if (!Unit.isAtomic(unit))
        return Mesh.createEmpty(mesh);
    const clashes = ClashesProvider.get(structure).value.intraUnit.get(unit.id);
    const { edgeCount, a, b, edgeProps } = clashes;
    const { magnitude } = edgeProps;
    const { sizeFactor } = props;
    if (!edgeCount)
        return Mesh.createEmpty(mesh);
    const { elements, conformation: c } = unit;
    const builderProps = {
        linkCount: edgeCount * 2,
        position: (posA, posB, edgeIndex) => {
            c.invariantPosition(elements[a[edgeIndex]], posA);
            c.invariantPosition(elements[b[edgeIndex]], posB);
        },
        style: (edgeIndex) => 6 /* LinkStyle.Disk */,
        radius: (edgeIndex) => magnitude[edgeIndex] * sizeFactor,
    };
    const { mesh: m, boundingSphere } = createLinkCylinderMesh(ctx, builderProps, props, mesh);
    if (boundingSphere) {
        m.setBoundingSphere(boundingSphere);
    }
    else if (m.triangleCount > 0) {
        const sphere = Sphere3D.expand(Sphere3D(), structure.boundary.sphere, 1 * sizeFactor);
        m.setBoundingSphere(sphere);
    }
    return m;
}
export const IntraUnitClashParams = {
    ...UnitsMeshParams,
    ...LinkCylinderParams,
    linkCap: PD.Boolean(true),
    sizeFactor: PD.Numeric(1, { min: 0, max: 10, step: 0.01 }),
};
export function IntraUnitClashVisual(materialId) {
    return UnitsMeshVisual({
        defaultProps: PD.getDefaultValues(IntraUnitClashParams),
        createGeometry: createIntraUnitClashCylinderMesh,
        createLocationIterator: createIntraClashIterator,
        getLoci: getIntraClashLoci,
        eachLocation: eachIntraClash,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.radialSegments !== currentProps.radialSegments ||
                newProps.linkScale !== currentProps.linkScale ||
                newProps.linkSpacing !== currentProps.linkSpacing ||
                newProps.linkCap !== currentProps.linkCap);
        }
    }, materialId);
}
function getIntraClashBoundingSphere(unit, clashes, elements, boundingSphere) {
    return CentroidHelper.fromPairProvider(elements.length, (i, pA, pB) => {
        unit.conformation.position(unit.elements[clashes.a[elements[i]]], pA);
        unit.conformation.position(unit.elements[clashes.b[elements[i]]], pB);
    }, boundingSphere);
}
function getIntraClashLabel(structure, unit, clashes, elements) {
    const idx = elements[0];
    if (idx === undefined)
        return '';
    const { edgeProps: { id, magnitude, distance } } = clashes;
    const mag = magnitude[idx].toFixed(2);
    const dist = distance[idx].toFixed(2);
    return [
        `Clash id: ${id[idx]} | Magnitude: ${mag} \u212B | Distance: ${dist} \u212B`,
        bondLabel(Bond.Location(structure, unit, clashes.a[idx], structure, unit, clashes.b[idx]))
    ].join('</br>');
}
function IntraClashLoci(structure, unit, clashes, elements) {
    return DataLoci('intra-clashes', { unit, clashes }, elements, (boundingSphere) => getIntraClashBoundingSphere(unit, clashes, elements, boundingSphere), () => getIntraClashLabel(structure, unit, clashes, elements));
}
function getIntraClashLoci(pickingId, structureGroup, id) {
    const { objectId, instanceId, groupId } = pickingId;
    if (id === objectId) {
        const { structure, group } = structureGroup;
        const unit = group.units[instanceId];
        if (Unit.isAtomic(unit)) {
            const clashes = ClashesProvider.get(structure).value.intraUnit.get(unit.id);
            return IntraClashLoci(structure, unit, clashes, [groupId]);
        }
    }
    return EmptyLoci;
}
function eachIntraClash(loci, structureGroup, apply) {
    const changed = false;
    // TODO
    return changed;
}
function createIntraClashIterator(structureGroup) {
    const { structure, group } = structureGroup;
    const unit = group.units[0];
    const clashes = ClashesProvider.get(structure).value.intraUnit.get(unit.id);
    const { a } = clashes;
    const groupCount = clashes.edgeCount * 2;
    const instanceCount = group.units.length;
    const location = StructureElement.Location.create(structure);
    const getLocation = (groupIndex, instanceIndex) => {
        const unit = group.units[instanceIndex];
        location.unit = unit;
        location.element = unit.elements[a[groupIndex]];
        return location;
    };
    return LocationIterator(groupCount, instanceCount, 1, getLocation);
}
//
function createInterUnitClashCylinderMesh(ctx, structure, theme, props, mesh) {
    const clashes = ClashesProvider.get(structure).value.interUnit;
    const { edges, edgeCount } = clashes;
    const { sizeFactor } = props;
    if (!edgeCount)
        return Mesh.createEmpty(mesh);
    const builderProps = {
        linkCount: edgeCount,
        position: (posA, posB, edgeIndex) => {
            const b = edges[edgeIndex];
            const uA = structure.unitMap.get(b.unitA);
            const uB = structure.unitMap.get(b.unitB);
            uA.conformation.position(uA.elements[b.indexA], posA);
            uB.conformation.position(uB.elements[b.indexB], posB);
        },
        style: (edgeIndex) => 6 /* LinkStyle.Disk */,
        radius: (edgeIndex) => edges[edgeIndex].props.magnitude * sizeFactor
    };
    const { mesh: m, boundingSphere } = createLinkCylinderMesh(ctx, builderProps, props, mesh);
    if (boundingSphere) {
        m.setBoundingSphere(boundingSphere);
    }
    else {
        const sphere = Sphere3D.expand(Sphere3D(), structure.boundary.sphere, 1 * sizeFactor);
        m.setBoundingSphere(sphere);
    }
    return m;
}
export const InterUnitClashParams = {
    ...ComplexMeshParams,
    ...LinkCylinderParams,
    linkCap: PD.Boolean(true),
    sizeFactor: PD.Numeric(1, { min: 0, max: 10, step: 0.01 }),
};
export function InterUnitClashVisual(materialId) {
    return ComplexMeshVisual({
        defaultProps: PD.getDefaultValues(InterUnitClashParams),
        createGeometry: createInterUnitClashCylinderMesh,
        createLocationIterator: createInterClashIterator,
        getLoci: getInterClashLoci,
        eachLocation: eachInterClash,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.radialSegments !== currentProps.radialSegments ||
                newProps.linkScale !== currentProps.linkScale ||
                newProps.linkSpacing !== currentProps.linkSpacing ||
                newProps.linkCap !== currentProps.linkCap);
        }
    }, materialId);
}
function getInterClashBoundingSphere(structure, clashes, elements, boundingSphere) {
    return CentroidHelper.fromPairProvider(elements.length, (i, pA, pB) => {
        const c = clashes.edges[elements[i]];
        const uA = structure.unitMap.get(c.unitA);
        const uB = structure.unitMap.get(c.unitB);
        uA.conformation.position(uA.elements[c.indexA], pA);
        uB.conformation.position(uB.elements[c.indexB], pB);
    }, boundingSphere);
}
function getInterClashLabel(structure, clashes, elements) {
    const idx = elements[0];
    if (idx === undefined)
        return '';
    const c = clashes.edges[idx];
    const uA = structure.unitMap.get(c.unitA);
    const uB = structure.unitMap.get(c.unitB);
    const mag = c.props.magnitude.toFixed(2);
    const dist = c.props.distance.toFixed(2);
    return [
        `Clash id: ${c.props.id} | Magnitude: ${mag} \u212B | Distance: ${dist} \u212B`,
        bondLabel(Bond.Location(structure, uA, c.indexA, structure, uB, c.indexB))
    ].join('</br>');
}
function InterClashLoci(structure, clashes, elements) {
    return DataLoci('inter-clashes', clashes, elements, (boundingSphere) => getInterClashBoundingSphere(structure, clashes, elements, boundingSphere), () => getInterClashLabel(structure, clashes, elements));
}
function getInterClashLoci(pickingId, structure, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const clashes = ClashesProvider.get(structure).value.interUnit;
        return InterClashLoci(structure, clashes, [groupId]);
    }
    return EmptyLoci;
}
function eachInterClash(loci, structure, apply) {
    const changed = false;
    // TODO
    return changed;
}
function createInterClashIterator(structure) {
    const clashes = ClashesProvider.get(structure).value.interUnit;
    const groupCount = clashes.edgeCount;
    const instanceCount = 1;
    const location = StructureElement.Location.create(structure);
    const getLocation = (groupIndex) => {
        const clash = clashes.edges[groupIndex];
        location.unit = structure.unitMap.get(clash.unitA);
        location.element = location.unit.elements[clash.indexA];
        return location;
    };
    return LocationIterator(groupCount, instanceCount, 1, getLocation, true);
}
//
const ClashesVisuals = {
    'intra-clash': (ctx, getParams) => UnitsRepresentation('Intra-unit clash cylinder', ctx, getParams, IntraUnitClashVisual),
    'inter-clash': (ctx, getParams) => ComplexRepresentation('Inter-unit clash cylinder', ctx, getParams, InterUnitClashVisual),
};
export const ClashesParams = {
    ...IntraUnitClashParams,
    ...InterUnitClashParams,
    unitKinds: getUnitKindsParam(['atomic']),
    visuals: PD.MultiSelect(['intra-clash', 'inter-clash'], PD.objectToOptions(ClashesVisuals))
};
export function getClashesParams(ctx, structure) {
    return PD.clone(ClashesParams);
}
export function ClashesRepresentation(ctx, getParams) {
    const repr = Representation.createMulti('Clashes', ctx, getParams, StructureRepresentationStateBuilder, ClashesVisuals);
    repr.setState({ markerActions: MarkerActions.Highlighting });
    return repr;
}
export const ClashesRepresentationProvider = StructureRepresentationProvider({
    name: ValidationReport.Tag.Clashes,
    label: 'Validation Clashes',
    description: 'Displays clashes between atoms as disks. Data from wwPDB Validation Report, obtained via RCSB PDB.',
    factory: ClashesRepresentation,
    getParams: getClashesParams,
    defaultValues: PD.getDefaultValues(ClashesParams),
    defaultColorTheme: { name: 'uniform', props: { value: Color(0xFA28FF) } },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0,
    ensureCustomProperties: {
        attach: (ctx, structure) => ClashesProvider.attach(ctx, structure, void 0, true),
        detach: (data) => ClashesProvider.ref(data, false)
    }
});
