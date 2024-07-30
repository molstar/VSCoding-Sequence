/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { ConfalPyramidsProvider } from './property';
import { ConfalPyramidsIterator } from './util';
import { ConfalPyramidsTypes as CPT } from './types';
import { Dnatco } from '../property';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../../mol-geo/geometry/mesh/mesh-builder';
import { PrimitiveBuilder } from '../../../mol-geo/primitive/primitive';
import { LocationIterator } from '../../../mol-geo/util/location-iterator';
import { Mat4, Vec3 } from '../../../mol-math/linear-algebra';
import { EmptyLoci } from '../../../mol-model/loci';
import { Unit } from '../../../mol-model/structure';
import { Representation } from '../../../mol-repr/representation';
import { StructureRepresentationProvider, StructureRepresentationStateBuilder, UnitsRepresentation } from '../../../mol-repr/structure/representation';
import { UnitsMeshParams, UnitsMeshVisual } from '../../../mol-repr/structure/units-visual';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { NullLocation } from '../../../mol-model/location';
const t = Mat4.identity();
const w = Vec3.zero();
const mp = Vec3.zero();
const posO3 = Vec3();
const posP = Vec3();
const posOP1 = Vec3();
const posOP2 = Vec3();
const posO5 = Vec3();
function calcMidpoint(mp, v, w) {
    Vec3.sub(mp, v, w);
    Vec3.scale(mp, mp, 0.5);
    Vec3.add(mp, mp, w);
}
function shiftVertex(vec, ref, scale) {
    Vec3.sub(w, vec, ref);
    Vec3.scale(w, w, scale);
    Vec3.add(vec, vec, w);
}
const ConfalPyramidsMeshParams = {
    ...UnitsMeshParams
};
function createConfalPyramidsIterator(structureGroup) {
    var _a, _b;
    const { structure, group } = structureGroup;
    const instanceCount = group.units.length;
    const data = (_b = (_a = ConfalPyramidsProvider.get(structure.model)) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.data;
    if (!data)
        return LocationIterator(0, 1, 1, () => NullLocation);
    const halfPyramidsCount = data.steps.length * 2;
    const getLocation = (groupIndex, instanceIndex) => {
        if (halfPyramidsCount <= groupIndex)
            return NullLocation;
        const idx = Math.floor(groupIndex / 2); // Map groupIndex to a step, see createConfalPyramidsMesh() for full explanation
        return CPT.Location(data.steps[idx], groupIndex % 2 === 1);
    };
    return LocationIterator(halfPyramidsCount, instanceCount, 1, getLocation);
}
function createConfalPyramidsMesh(ctx, unit, structure, theme, props, mesh) {
    var _a, _b;
    if (!Unit.isAtomic(unit))
        return Mesh.createEmpty(mesh);
    const data = (_b = (_a = ConfalPyramidsProvider.get(structure.model)) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.data;
    if (!data)
        return Mesh.createEmpty(mesh);
    const { steps, mapping } = data;
    if (steps.length === 0)
        return Mesh.createEmpty(mesh);
    const vertexCount = (6 * steps.length) / mapping.length;
    const mb = MeshBuilder.createState(vertexCount, vertexCount / 10, mesh);
    const it = new ConfalPyramidsIterator(structure, unit);
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
            let pb = PrimitiveBuilder(3);
            /* Upper part (for first residue in step) */
            pb.add(posO3, posOP1, posOP2);
            pb.add(posO3, mp, posOP1);
            pb.add(posO3, posOP2, mp);
            MeshBuilder.addPrimitive(mb, t, pb.getPrimitive());
            /* Lower part (for second residue in step) */
            mb.currentGroup = groupIdx + 1;
            pb = PrimitiveBuilder(3);
            pb.add(mp, posO5, posOP1);
            pb.add(mp, posOP2, posO5);
            pb.add(posO5, posOP2, posOP1);
            MeshBuilder.addPrimitive(mb, t, pb.getPrimitive());
        }
    }
    return MeshBuilder.getMesh(mb);
}
function getConfalPyramidLoci(pickingId, structureGroup, id) {
    var _a, _b;
    const { groupId, objectId, instanceId } = pickingId;
    if (objectId !== id)
        return EmptyLoci;
    const { structure } = structureGroup;
    const unit = structureGroup.group.units[instanceId];
    if (!Unit.isAtomic(unit))
        return EmptyLoci;
    const data = (_b = (_a = ConfalPyramidsProvider.get(structure.model)) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.data;
    if (!data)
        return EmptyLoci;
    const halfPyramidsCount = data.steps.length * 2;
    if (halfPyramidsCount <= groupId)
        return EmptyLoci;
    const idx = Math.floor(groupId / 2); // Map groupIndex to a step, see createConfalPyramidsMesh() for full explanation
    return CPT.Loci(data.steps, [idx]);
}
function eachConfalPyramid(loci, structureGroup, apply) {
    return false; // TODO: Implement me
}
function ConfalPyramidsVisual(materialId) {
    return UnitsMeshVisual({
        defaultProps: PD.getDefaultValues(ConfalPyramidsMeshParams),
        createGeometry: createConfalPyramidsMesh,
        createLocationIterator: createConfalPyramidsIterator,
        getLoci: getConfalPyramidLoci,
        eachLocation: eachConfalPyramid,
        setUpdateState: (state, newProps, currentProps) => {
        }
    }, materialId);
}
const ConfalPyramidsVisuals = {
    'confal-pyramids-symbol': (ctx, getParams) => UnitsRepresentation('Confal Pyramids Symbol Mesh', ctx, getParams, ConfalPyramidsVisual),
};
export const ConfalPyramidsParams = {
    ...UnitsMeshParams
};
export function getConfalPyramidsParams(ctx, structure) {
    return PD.clone(ConfalPyramidsParams);
}
export function ConfalPyramidsRepresentation(ctx, getParams) {
    const repr = Representation.createMulti('Confal Pyramids', ctx, getParams, StructureRepresentationStateBuilder, ConfalPyramidsVisuals);
    return repr;
}
export const ConfalPyramidsRepresentationProvider = StructureRepresentationProvider({
    name: 'confal-pyramids',
    label: 'Confal Pyramids',
    description: 'Displays schematic depiction of conformer classes and confal values',
    factory: ConfalPyramidsRepresentation,
    getParams: getConfalPyramidsParams,
    defaultValues: PD.getDefaultValues(ConfalPyramidsParams),
    defaultColorTheme: { name: 'confal-pyramids' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.models.some(m => Dnatco.isApplicable(m)),
    ensureCustomProperties: {
        attach: (ctx, structure) => ConfalPyramidsProvider.attach(ctx, structure.model, void 0, true),
        detach: (data) => ConfalPyramidsProvider.ref(data.model, false),
    }
});
