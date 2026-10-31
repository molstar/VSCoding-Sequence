"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossLinkRestraintRepresentationProvider = exports.CrossLinkRestraintParams = exports.CrossLinkRestraintCylinderParams = void 0;
exports.CrossLinkRestraintVisual = CrossLinkRestraintVisual;
exports.getCrossLinkRestraintParams = getCrossLinkRestraintParams;
exports.CrossLinkRestraintRepresentation = CrossLinkRestraintRepresentation;
const representation_1 = require("../../../mol-repr/representation");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const loci_1 = require("../../../mol-model/loci");
const int_1 = require("../../../mol-data/int");
const param_definition_1 = require("../../../mol-util/param-definition");
const structure_1 = require("../../../mol-model/structure");
const link_1 = require("../../../mol-repr/structure/visual/util/link");
const complex_visual_1 = require("../../../mol-repr/structure/complex-visual");
const representation_2 = require("../../../mol-repr/structure/representation");
const property_1 = require("./property");
const geometry_1 = require("../../../mol-math/geometry");
function createCrossLinkRestraintCylinderMesh(ctx, structure, theme, props, mesh) {
    const crossLinks = property_1.CrossLinkRestraintProvider.get(structure).value;
    if (!crossLinks.count)
        return mesh_1.Mesh.createEmpty(mesh);
    const { sizeFactor } = props;
    const location = structure_1.StructureElement.Location.create(structure);
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
    const { mesh: m, boundingSphere } = (0, link_1.createLinkCylinderMesh)(ctx, builderProps, props, mesh);
    if (boundingSphere) {
        m.setBoundingSphere(boundingSphere);
    }
    else if (m.triangleCount > 0) {
        const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), structure.boundary.sphere, 1 * sizeFactor);
        m.setBoundingSphere(sphere);
    }
    return m;
}
exports.CrossLinkRestraintCylinderParams = {
    ...complex_visual_1.ComplexMeshParams,
    ...link_1.LinkCylinderParams,
    sizeFactor: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 10, step: 0.1 }),
};
function CrossLinkRestraintVisual(materialId) {
    return (0, complex_visual_1.ComplexMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.CrossLinkRestraintCylinderParams),
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
    const crossLinkRestraints = property_1.CrossLinkRestraintProvider.get(structure).value;
    const { pairs } = crossLinkRestraints;
    const groupCount = pairs.length;
    const instanceCount = 1;
    const location = property_1.CrossLinkRestraint.Location(crossLinkRestraints, structure);
    const getLocation = (groupIndex) => {
        location.element = groupIndex;
        return location;
    };
    return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation, true);
}
function getLinkLoci(pickingId, structure, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const crossLinkRestraints = property_1.CrossLinkRestraintProvider.get(structure).value;
        const pair = crossLinkRestraints.pairs[groupId];
        if (pair) {
            return property_1.CrossLinkRestraint.Loci(structure, crossLinkRestraints, [groupId]);
        }
    }
    return loci_1.EmptyLoci;
}
function eachCrossLink(loci, structure, apply) {
    let changed = false;
    if (property_1.CrossLinkRestraint.isLoci(loci)) {
        if (!structure_1.Structure.areEquivalent(loci.data.structure, structure))
            return false;
        const crossLinkRestraints = property_1.CrossLinkRestraintProvider.get(structure).value;
        if (loci.data.crossLinkRestraints !== crossLinkRestraints)
            return false;
        for (const e of loci.elements) {
            if (apply(int_1.Interval.ofSingleton(e)))
                changed = true;
        }
    }
    return changed;
}
//
const CrossLinkRestraintVisuals = {
    'cross-link-restraint': (ctx, getParams) => (0, representation_2.ComplexRepresentation)('Cross-link restraint', ctx, getParams, CrossLinkRestraintVisual),
};
exports.CrossLinkRestraintParams = {
    ...exports.CrossLinkRestraintCylinderParams,
};
function getCrossLinkRestraintParams(ctx, structure) {
    return param_definition_1.ParamDefinition.clone(exports.CrossLinkRestraintParams);
}
function CrossLinkRestraintRepresentation(ctx, getParams) {
    return representation_1.Representation.createMulti('CrossLinkRestraint', ctx, getParams, representation_2.StructureRepresentationStateBuilder, CrossLinkRestraintVisuals);
}
exports.CrossLinkRestraintRepresentationProvider = (0, representation_2.StructureRepresentationProvider)({
    name: property_1.CrossLinkRestraint.Tag.CrossLinkRestraint,
    label: 'Cross Link Restraint',
    description: 'Displays cross-link restraints.',
    factory: CrossLinkRestraintRepresentation,
    getParams: getCrossLinkRestraintParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.CrossLinkRestraintParams),
    defaultColorTheme: { name: property_1.CrossLinkRestraint.Tag.CrossLinkRestraint },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => property_1.CrossLinkRestraint.isApplicable(structure),
    ensureCustomProperties: {
        attach: (ctx, structure) => property_1.CrossLinkRestraintProvider.attach(ctx, structure, void 0, true),
        detach: (data) => property_1.CrossLinkRestraintProvider.ref(data, false)
    }
});
