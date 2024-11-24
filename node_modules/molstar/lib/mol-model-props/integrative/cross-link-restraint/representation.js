/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Representation } from '../../../mol-repr/representation';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { LocationIterator } from '../../../mol-geo/util/location-iterator';
import { EmptyLoci } from '../../../mol-model/loci';
import { Interval } from '../../../mol-data/int';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Structure, StructureElement } from '../../../mol-model/structure';
import { createLinkCylinderMesh, LinkCylinderParams } from '../../../mol-repr/structure/visual/util/link';
import { ComplexMeshParams, ComplexMeshVisual } from '../../../mol-repr/structure/complex-visual';
import { ComplexRepresentation, StructureRepresentationStateBuilder, StructureRepresentationProvider } from '../../../mol-repr/structure/representation';
import { CrossLinkRestraintProvider, CrossLinkRestraint } from './property';
import { Sphere3D } from '../../../mol-math/geometry';
function createCrossLinkRestraintCylinderMesh(ctx, structure, theme, props, mesh) {
    const crossLinks = CrossLinkRestraintProvider.get(structure).value;
    if (!crossLinks.count)
        return Mesh.createEmpty(mesh);
    const { sizeFactor } = props;
    const location = StructureElement.Location.create(structure);
    const builderProps = {
        linkCount: crossLinks.count,
        position: (posA, posB, edgeIndex) => {
            const b = crossLinks.pairs[edgeIndex];
            const uA = b.unitA, uB = b.unitB;
            uA.conformation.position(uA.elements[b.indexA], posA);
            uB.conformation.position(uB.elements[b.indexB], posB);
        },
        radius: (edgeIndex) => {
            const b = crossLinks.pairs[edgeIndex];
            location.unit = b.unitA;
            location.element = b.unitA.elements[b.indexA];
            return theme.size.size(location) * sizeFactor;
        },
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
export const CrossLinkRestraintCylinderParams = {
    ...ComplexMeshParams,
    ...LinkCylinderParams,
    sizeFactor: PD.Numeric(0.5, { min: 0, max: 10, step: 0.1 }),
};
export function CrossLinkRestraintVisual(materialId) {
    return ComplexMeshVisual({
        defaultProps: PD.getDefaultValues(CrossLinkRestraintCylinderParams),
        createGeometry: createCrossLinkRestraintCylinderMesh,
        createLocationIterator: createCrossLinkRestraintIterator,
        getLoci: getLinkLoci,
        eachLocation: eachCrossLink,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.sizeFactor !== currentProps.sizeFactor ||
                newProps.radialSegments !== currentProps.radialSegments ||
                newProps.linkCap !== currentProps.linkCap);
        }
    }, materialId);
}
function createCrossLinkRestraintIterator(structure) {
    const crossLinkRestraints = CrossLinkRestraintProvider.get(structure).value;
    const { pairs } = crossLinkRestraints;
    const groupCount = pairs.length;
    const instanceCount = 1;
    const location = CrossLinkRestraint.Location(crossLinkRestraints, structure);
    const getLocation = (groupIndex) => {
        location.element = groupIndex;
        return location;
    };
    return LocationIterator(groupCount, instanceCount, 1, getLocation, true);
}
function getLinkLoci(pickingId, structure, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const crossLinkRestraints = CrossLinkRestraintProvider.get(structure).value;
        const pair = crossLinkRestraints.pairs[groupId];
        if (pair) {
            return CrossLinkRestraint.Loci(structure, crossLinkRestraints, [groupId]);
        }
    }
    return EmptyLoci;
}
function eachCrossLink(loci, structure, apply) {
    let changed = false;
    if (CrossLinkRestraint.isLoci(loci)) {
        if (!Structure.areEquivalent(loci.data.structure, structure))
            return false;
        const crossLinkRestraints = CrossLinkRestraintProvider.get(structure).value;
        if (loci.data.crossLinkRestraints !== crossLinkRestraints)
            return false;
        for (const e of loci.elements) {
            if (apply(Interval.ofSingleton(e)))
                changed = true;
        }
    }
    return changed;
}
//
const CrossLinkRestraintVisuals = {
    'cross-link-restraint': (ctx, getParams) => ComplexRepresentation('Cross-link restraint', ctx, getParams, CrossLinkRestraintVisual),
};
export const CrossLinkRestraintParams = {
    ...CrossLinkRestraintCylinderParams,
};
export function getCrossLinkRestraintParams(ctx, structure) {
    return PD.clone(CrossLinkRestraintParams);
}
export function CrossLinkRestraintRepresentation(ctx, getParams) {
    return Representation.createMulti('CrossLinkRestraint', ctx, getParams, StructureRepresentationStateBuilder, CrossLinkRestraintVisuals);
}
export const CrossLinkRestraintRepresentationProvider = StructureRepresentationProvider({
    name: CrossLinkRestraint.Tag.CrossLinkRestraint,
    label: 'Cross Link Restraint',
    description: 'Displays cross-link restraints.',
    factory: CrossLinkRestraintRepresentation,
    getParams: getCrossLinkRestraintParams,
    defaultValues: PD.getDefaultValues(CrossLinkRestraintParams),
    defaultColorTheme: { name: CrossLinkRestraint.Tag.CrossLinkRestraint },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => CrossLinkRestraint.isApplicable(structure),
    ensureCustomProperties: {
        attach: (ctx, structure) => CrossLinkRestraintProvider.attach(ctx, structure, void 0, true),
        detach: (data) => CrossLinkRestraintProvider.ref(data, false)
    }
});
