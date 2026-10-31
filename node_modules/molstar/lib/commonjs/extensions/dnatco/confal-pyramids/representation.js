"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfalPyramidsRepresentationProvider = exports.ConfalPyramidsParams = void 0;
exports.getConfalPyramidsParams = getConfalPyramidsParams;
exports.ConfalPyramidsRepresentation = ConfalPyramidsRepresentation;
const property_1 = require("./property");
const util_1 = require("./util");
const types_1 = require("./types");
const property_2 = require("../property");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const primitive_1 = require("../../../mol-geo/primitive/primitive");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const loci_1 = require("../../../mol-model/loci");
const structure_1 = require("../../../mol-model/structure");
const representation_1 = require("../../../mol-repr/representation");
const representation_2 = require("../../../mol-repr/structure/representation");
const units_visual_1 = require("../../../mol-repr/structure/units-visual");
const param_definition_1 = require("../../../mol-util/param-definition");
const location_1 = require("../../../mol-model/location");
const t = linear_algebra_1.Mat4.identity();
const w = linear_algebra_1.Vec3.zero();
const mp = linear_algebra_1.Vec3.zero();
const posO3 = (0, linear_algebra_1.Vec3)();
const posP = (0, linear_algebra_1.Vec3)();
const posOP1 = (0, linear_algebra_1.Vec3)();
const posOP2 = (0, linear_algebra_1.Vec3)();
const posO5 = (0, linear_algebra_1.Vec3)();
function calcMidpoint(mp, v, w) {
    linear_algebra_1.Vec3.sub(mp, v, w);
    linear_algebra_1.Vec3.scale(mp, mp, 0.5);
    linear_algebra_1.Vec3.add(mp, mp, w);
}
function shiftVertex(vec, ref, scale) {
    linear_algebra_1.Vec3.sub(w, vec, ref);
    linear_algebra_1.Vec3.scale(w, w, scale);
    linear_algebra_1.Vec3.add(vec, vec, w);
}
const ConfalPyramidsMeshParams = {
    ...units_visual_1.UnitsMeshParams
};
function createConfalPyramidsIterator(structureGroup) {
    var _a, _b;
    const { structure, group } = structureGroup;
    const instanceCount = group.units.length;
    const data = (_b = (_a = property_1.ConfalPyramidsProvider.get(structure.model)) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.data;
    if (!data)
        return (0, location_iterator_1.LocationIterator)(0, 1, 1, () => location_1.NullLocation);
    const halfPyramidsCount = data.steps.length * 2;
    const getLocation = (groupIndex, instanceIndex) => {
        if (halfPyramidsCount <= groupIndex)
            return location_1.NullLocation;
        const idx = Math.floor(groupIndex / 2); // Map groupIndex to a step, see createConfalPyramidsMesh() for full explanation
        return types_1.ConfalPyramidsTypes.Location(data.steps[idx], groupIndex % 2 === 1);
    };
    return (0, location_iterator_1.LocationIterator)(halfPyramidsCount, instanceCount, 1, getLocation);
}
function createConfalPyramidsMesh(ctx, unit, structure, theme, props, mesh) {
    var _a, _b;
    if (!structure_1.Unit.isAtomic(unit))
        return mesh_1.Mesh.createEmpty(mesh);
    const data = (_b = (_a = property_1.ConfalPyramidsProvider.get(structure.model)) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.data;
    if (!data)
        return mesh_1.Mesh.createEmpty(mesh);
    const { steps, mapping } = data;
    if (steps.length === 0)
        return mesh_1.Mesh.createEmpty(mesh);
    const vertexCount = (6 * steps.length) / mapping.length;
    const mb = mesh_builder_1.MeshBuilder.createState(vertexCount, vertexCount / 10, mesh);
    const it = new util_1.ConfalPyramidsIterator(structure, unit);
    while (it.hasNext) {
        const allPoints = it.move();
        if (!allPoints)
            continue;
        for (const points of allPoints) {
            const { O3, P, OP1, OP2, O5, confalScore } = points;
            const scale = (confalScore - 20.0) / 100.0;
            // Steps can be drawn in a different order than they are stored.
            // To make sure that we can get from the drawn pyramid back to the step in represents,
            // we need to use an appropriate groupId. The stepIdx passed from the iterator
            // is an index into the array of all steps in the structure.
            // Since a step is drawn as two "half-pyramids" we need two ids to map to a single step.
            // To do that, we just multiply the index by 2. idx*2 marks the "upper" half-pyramid,
            // (idx*2)+1 the "lower" half-pyramid.
            const groupIdx = points.stepIdx * 2;
            unit.conformation.invariantPosition(O3, posO3);
            unit.conformation.invariantPosition(P, posP);
            unit.conformation.invariantPosition(OP1, posOP1);
            unit.conformation.invariantPosition(OP2, posOP2);
            unit.conformation.invariantPosition(O5, posO5);
            shiftVertex(posO3, posP, scale);
            shiftVertex(posOP1, posP, scale);
            shiftVertex(posOP2, posP, scale);
            shiftVertex(posO5, posP, scale);
            calcMidpoint(mp, posO3, posO5);
            mb.currentGroup = groupIdx;
            let pb = (0, primitive_1.PrimitiveBuilder)(3);
            /* Upper part (for first residue in step) */
            pb.add(posO3, posOP1, posOP2);
            pb.add(posO3, mp, posOP1);
            pb.add(posO3, posOP2, mp);
            mesh_builder_1.MeshBuilder.addPrimitive(mb, t, pb.getPrimitive());
            /* Lower part (for second residue in step) */
            mb.currentGroup = groupIdx + 1;
            pb = (0, primitive_1.PrimitiveBuilder)(3);
            pb.add(mp, posO5, posOP1);
            pb.add(mp, posOP2, posO5);
            pb.add(posO5, posOP2, posOP1);
            mesh_builder_1.MeshBuilder.addPrimitive(mb, t, pb.getPrimitive());
        }
    }
    return mesh_builder_1.MeshBuilder.getMesh(mb);
}
function getConfalPyramidLoci(pickingId, structureGroup, id) {
    var _a, _b;
    const { groupId, objectId, instanceId } = pickingId;
    if (objectId !== id)
        return loci_1.EmptyLoci;
    const { structure } = structureGroup;
    const unit = structureGroup.group.units[instanceId];
    if (!structure_1.Unit.isAtomic(unit))
        return loci_1.EmptyLoci;
    const data = (_b = (_a = property_1.ConfalPyramidsProvider.get(structure.model)) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.data;
    if (!data)
        return loci_1.EmptyLoci;
    const halfPyramidsCount = data.steps.length * 2;
    if (halfPyramidsCount <= groupId)
        return loci_1.EmptyLoci;
    const idx = Math.floor(groupId / 2); // Map groupIndex to a step, see createConfalPyramidsMesh() for full explanation
    return types_1.ConfalPyramidsTypes.Loci(data.steps, [idx]);
}
function eachConfalPyramid(loci, structureGroup, apply) {
    return false; // TODO: Implement me
}
function ConfalPyramidsVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(ConfalPyramidsMeshParams),
        createGeometry: createConfalPyramidsMesh,
        createLocationIterator: createConfalPyramidsIterator,
        getLoci: getConfalPyramidLoci,
        eachLocation: eachConfalPyramid,
        setUpdateState: (state, newProps, currentProps) => {
        }
    }, materialId);
}
const ConfalPyramidsVisuals = {
    'confal-pyramids-symbol': (ctx, getParams) => (0, representation_2.UnitsRepresentation)('Confal Pyramids Symbol Mesh', ctx, getParams, ConfalPyramidsVisual),
};
exports.ConfalPyramidsParams = {
    ...units_visual_1.UnitsMeshParams
};
function getConfalPyramidsParams(ctx, structure) {
    return param_definition_1.ParamDefinition.clone(exports.ConfalPyramidsParams);
}
function ConfalPyramidsRepresentation(ctx, getParams) {
    const repr = representation_1.Representation.createMulti('Confal Pyramids', ctx, getParams, representation_2.StructureRepresentationStateBuilder, ConfalPyramidsVisuals);
    return repr;
}
exports.ConfalPyramidsRepresentationProvider = (0, representation_2.StructureRepresentationProvider)({
    name: 'confal-pyramids',
    label: 'Confal Pyramids',
    description: 'Displays schematic depiction of conformer classes and confal values',
    factory: ConfalPyramidsRepresentation,
    getParams: getConfalPyramidsParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.ConfalPyramidsParams),
    defaultColorTheme: { name: 'confal-pyramids' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.models.some(m => property_2.Dnatco.isApplicable(m)),
    ensureCustomProperties: {
        attach: (ctx, structure) => property_1.ConfalPyramidsProvider.attach(ctx, structure.model, void 0, true),
        detach: (data) => property_1.ConfalPyramidsProvider.ref(data.model, false),
    }
});
