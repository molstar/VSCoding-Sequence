"use strict";
/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClashesRepresentationProvider = exports.ClashesParams = exports.InterUnitClashParams = exports.IntraUnitClashParams = void 0;
exports.IntraUnitClashVisual = IntraUnitClashVisual;
exports.InterUnitClashVisual = InterUnitClashVisual;
exports.getClashesParams = getClashesParams;
exports.ClashesRepresentation = ClashesRepresentation;
const param_definition_1 = require("../../../mol-util/param-definition");
const structure_1 = require("../../../mol-model/structure");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const loci_1 = require("../../../mol-model/loci");
const representation_1 = require("../../../mol-repr/representation");
const representation_2 = require("../../../mol-repr/structure/representation");
const link_1 = require("../../../mol-repr/structure/visual/util/link");
const units_visual_1 = require("../../../mol-repr/structure/units-visual");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const prop_1 = require("./prop");
const complex_visual_1 = require("../../../mol-repr/structure/complex-visual");
const color_1 = require("../../../mol-util/color");
const marker_action_1 = require("../../../mol-util/marker-action");
const centroid_helper_1 = require("../../../mol-math/geometry/centroid-helper");
const geometry_1 = require("../../../mol-math/geometry");
const label_1 = require("../../../mol-theme/label");
const params_1 = require("../../../mol-repr/structure/params");
//
function createIntraUnitClashCylinderMesh(ctx, unit, structure, theme, props, mesh) {
    if (!structure_1.Unit.isAtomic(unit))
        return mesh_1.Mesh.createEmpty(mesh);
    const clashes = prop_1.ClashesProvider.get(structure).value.intraUnit.get(unit.id);
    const { edgeCount, a, b, edgeProps } = clashes;
    const { magnitude } = edgeProps;
    const { sizeFactor } = props;
    if (!edgeCount)
        return mesh_1.Mesh.createEmpty(mesh);
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
exports.IntraUnitClashParams = {
    ...units_visual_1.UnitsMeshParams,
    ...link_1.LinkCylinderParams,
    linkCap: param_definition_1.ParamDefinition.Boolean(true),
    sizeFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 10, step: 0.01 }),
};
function IntraUnitClashVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.IntraUnitClashParams),
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
    return centroid_helper_1.CentroidHelper.fromPairProvider(elements.length, (i, pA, pB) => {
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
        (0, label_1.bondLabel)(structure_1.Bond.Location(structure, unit, clashes.a[idx], structure, unit, clashes.b[idx]))
    ].join('</br>');
}
function IntraClashLoci(structure, unit, clashes, elements) {
    return (0, loci_1.DataLoci)('intra-clashes', { unit, clashes }, elements, (boundingSphere) => getIntraClashBoundingSphere(unit, clashes, elements, boundingSphere), () => getIntraClashLabel(structure, unit, clashes, elements));
}
function getIntraClashLoci(pickingId, structureGroup, id) {
    const { objectId, instanceId, groupId } = pickingId;
    if (id === objectId) {
        const { structure, group } = structureGroup;
        const unit = group.units[instanceId];
        if (structure_1.Unit.isAtomic(unit)) {
            const clashes = prop_1.ClashesProvider.get(structure).value.intraUnit.get(unit.id);
            return IntraClashLoci(structure, unit, clashes, [groupId]);
        }
    }
    return loci_1.EmptyLoci;
}
function eachIntraClash(loci, structureGroup, apply) {
    const changed = false;
    // TODO
    return changed;
}
function createIntraClashIterator(structureGroup) {
    const { structure, group } = structureGroup;
    const unit = group.units[0];
    const clashes = prop_1.ClashesProvider.get(structure).value.intraUnit.get(unit.id);
    const { a } = clashes;
    const groupCount = clashes.edgeCount * 2;
    const instanceCount = group.units.length;
    const location = structure_1.StructureElement.Location.create(structure);
    const getLocation = (groupIndex, instanceIndex) => {
        const unit = group.units[instanceIndex];
        location.unit = unit;
        location.element = unit.elements[a[groupIndex]];
        return location;
    };
    return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation);
}
//
function createInterUnitClashCylinderMesh(ctx, structure, theme, props, mesh) {
    const clashes = prop_1.ClashesProvider.get(structure).value.interUnit;
    const { edges, edgeCount } = clashes;
    const { sizeFactor } = props;
    if (!edgeCount)
        return mesh_1.Mesh.createEmpty(mesh);
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
    const { mesh: m, boundingSphere } = (0, link_1.createLinkCylinderMesh)(ctx, builderProps, props, mesh);
    if (boundingSphere) {
        m.setBoundingSphere(boundingSphere);
    }
    else {
        const sphere = geometry_1.Sphere3D.expand((0, geometry_1.Sphere3D)(), structure.boundary.sphere, 1 * sizeFactor);
        m.setBoundingSphere(sphere);
    }
    return m;
}
exports.InterUnitClashParams = {
    ...complex_visual_1.ComplexMeshParams,
    ...link_1.LinkCylinderParams,
    linkCap: param_definition_1.ParamDefinition.Boolean(true),
    sizeFactor: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 10, step: 0.01 }),
};
function InterUnitClashVisual(materialId) {
    return (0, complex_visual_1.ComplexMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.InterUnitClashParams),
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
    return centroid_helper_1.CentroidHelper.fromPairProvider(elements.length, (i, pA, pB) => {
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
        (0, label_1.bondLabel)(structure_1.Bond.Location(structure, uA, c.indexA, structure, uB, c.indexB))
    ].join('</br>');
}
function InterClashLoci(structure, clashes, elements) {
    return (0, loci_1.DataLoci)('inter-clashes', clashes, elements, (boundingSphere) => getInterClashBoundingSphere(structure, clashes, elements, boundingSphere), () => getInterClashLabel(structure, clashes, elements));
}
function getInterClashLoci(pickingId, structure, id) {
    const { objectId, groupId } = pickingId;
    if (id === objectId) {
        const clashes = prop_1.ClashesProvider.get(structure).value.interUnit;
        return InterClashLoci(structure, clashes, [groupId]);
    }
    return loci_1.EmptyLoci;
}
function eachInterClash(loci, structure, apply) {
    const changed = false;
    // TODO
    return changed;
}
function createInterClashIterator(structure) {
    const clashes = prop_1.ClashesProvider.get(structure).value.interUnit;
    const groupCount = clashes.edgeCount;
    const instanceCount = 1;
    const location = structure_1.StructureElement.Location.create(structure);
    const getLocation = (groupIndex) => {
        const clash = clashes.edges[groupIndex];
        location.unit = structure.unitMap.get(clash.unitA);
        location.element = location.unit.elements[clash.indexA];
        return location;
    };
    return (0, location_iterator_1.LocationIterator)(groupCount, instanceCount, 1, getLocation, true);
}
//
const ClashesVisuals = {
    'intra-clash': (ctx, getParams) => (0, representation_2.UnitsRepresentation)('Intra-unit clash cylinder', ctx, getParams, IntraUnitClashVisual),
    'inter-clash': (ctx, getParams) => (0, representation_2.ComplexRepresentation)('Inter-unit clash cylinder', ctx, getParams, InterUnitClashVisual),
};
exports.ClashesParams = {
    ...exports.IntraUnitClashParams,
    ...exports.InterUnitClashParams,
    unitKinds: (0, params_1.getUnitKindsParam)(['atomic']),
    visuals: param_definition_1.ParamDefinition.MultiSelect(['intra-clash', 'inter-clash'], param_definition_1.ParamDefinition.objectToOptions(ClashesVisuals))
};
function getClashesParams(ctx, structure) {
    return param_definition_1.ParamDefinition.clone(exports.ClashesParams);
}
function ClashesRepresentation(ctx, getParams) {
    const repr = representation_1.Representation.createMulti('Clashes', ctx, getParams, representation_2.StructureRepresentationStateBuilder, ClashesVisuals);
    repr.setState({ markerActions: marker_action_1.MarkerActions.Highlighting });
    return repr;
}
exports.ClashesRepresentationProvider = (0, representation_2.StructureRepresentationProvider)({
    name: prop_1.ValidationReport.Tag.Clashes,
    label: 'Validation Clashes',
    description: 'Displays clashes between atoms as disks. Data from wwPDB Validation Report, obtained via RCSB PDB.',
    factory: ClashesRepresentation,
    getParams: getClashesParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.ClashesParams),
    defaultColorTheme: { name: 'uniform', props: { value: (0, color_1.Color)(0xFA28FF) } },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0,
    ensureCustomProperties: {
        attach: (ctx, structure) => prop_1.ClashesProvider.attach(ctx, structure, void 0, true),
        detach: (data) => prop_1.ClashesProvider.ref(data, false)
    }
});
