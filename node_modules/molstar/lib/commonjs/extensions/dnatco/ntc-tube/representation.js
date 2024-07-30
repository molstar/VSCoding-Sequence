"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NtCTubeRepresentationProvider = exports.NtCTubeParams = void 0;
exports.getNtCTubeParams = getNtCTubeParams;
exports.NtCTubeRepresentation = NtCTubeRepresentation;
const property_1 = require("./property");
const util_1 = require("./util");
const types_1 = require("./types");
const property_2 = require("../property");
const util_2 = require("../util");
const int_1 = require("../../../mol-data/int");
const base_1 = require("../../../mol-geo/geometry/base");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
const cylinder_1 = require("../../../mol-geo/geometry/mesh/builder/cylinder");
const mesh_builder_1 = require("../../../mol-geo/geometry/mesh/mesh-builder");
const tube_1 = require("../../../mol-geo/geometry/mesh/builder/tube");
const location_iterator_1 = require("../../../mol-geo/util/location-iterator");
const sphere3d_1 = require("../../../mol-math/geometry/primitives/sphere3d");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const interpolate_1 = require("../../../mol-math/interpolate");
const location_1 = require("../../../mol-model/location");
const loci_1 = require("../../../mol-model/loci");
const structure_1 = require("../../../mol-model/structure");
const structure_set_1 = require("../../../mol-model/structure/query/utils/structure-set");
const representation_1 = require("../../../mol-repr/representation");
const representation_2 = require("../../../mol-repr/structure/representation");
const units_visual_1 = require("../../../mol-repr/structure/units-visual");
const polymer_1 = require("../../../mol-repr/structure/visual/util/polymer");
const util_3 = require("../../../mol-repr/util");
const param_definition_1 = require("../../../mol-util/param-definition");
const v3add = linear_algebra_1.Vec3.add;
const v3copy = linear_algebra_1.Vec3.copy;
const v3cross = linear_algebra_1.Vec3.cross;
const v3fromArray = linear_algebra_1.Vec3.fromArray;
const v3matchDirection = linear_algebra_1.Vec3.matchDirection;
const v3normalize = linear_algebra_1.Vec3.normalize;
const v3orthogonalize = linear_algebra_1.Vec3.orthogonalize;
const v3scale = linear_algebra_1.Vec3.scale;
const v3slerp = linear_algebra_1.Vec3.slerp;
const v3spline = linear_algebra_1.Vec3.spline;
const v3sub = linear_algebra_1.Vec3.sub;
const v3toArray = linear_algebra_1.Vec3.toArray;
const NtCTubeMeshParams = {
    ...units_visual_1.UnitsMeshParams,
    linearSegments: param_definition_1.ParamDefinition.Numeric(4, { min: 2, max: 8, step: 1 }, base_1.BaseGeometry.CustomQualityParamInfo),
    radialSegments: param_definition_1.ParamDefinition.Numeric(22, { min: 4, max: 56, step: 2 }, base_1.BaseGeometry.CustomQualityParamInfo),
    residueMarkerWidth: param_definition_1.ParamDefinition.Numeric(0.05, { min: 0.01, max: 0.25, step: 0.01 }),
    segmentBoundaryWidth: param_definition_1.ParamDefinition.Numeric(0.05, { min: 0.01, max: 0.25, step: 0.01 }),
};
const LinearSegmentCount = {
    highest: 6,
    higher: 6,
    high: 4,
    medium: 4,
    low: 3,
    lower: 3,
    lowest: 2,
};
const RadialSegmentCount = {
    highest: 32,
    higher: 26,
    high: 22,
    medium: 18,
    low: 14,
    lower: 10,
    lowest: 6,
};
const _curvePoint = (0, linear_algebra_1.Vec3)();
const _tanA = (0, linear_algebra_1.Vec3)();
const _tanB = (0, linear_algebra_1.Vec3)();
const _firstTangentVec = (0, linear_algebra_1.Vec3)();
const _lastTangentVec = (0, linear_algebra_1.Vec3)();
const _firstNormalVec = (0, linear_algebra_1.Vec3)();
const _lastNormalVec = (0, linear_algebra_1.Vec3)();
const _tmpNormal = (0, linear_algebra_1.Vec3)();
const _tangentVec = (0, linear_algebra_1.Vec3)();
const _normalVec = (0, linear_algebra_1.Vec3)();
const _binormalVec = (0, linear_algebra_1.Vec3)();
const _prevNormal = (0, linear_algebra_1.Vec3)();
const _nextNormal = (0, linear_algebra_1.Vec3)();
function interpolatePointsAndTangents(state, p0, p1, p2, p3, tRange) {
    const { curvePoints, tangentVectors, linearSegments } = state;
    const tension = 0.5;
    const r = tRange[1] - tRange[0];
    for (let j = 0; j <= linearSegments; ++j) {
        const t = j * r / linearSegments + tRange[0];
        v3spline(_curvePoint, p0, p1, p2, p3, t, tension);
        v3spline(_tanA, p0, p1, p2, p3, t - 0.01, tension);
        v3spline(_tanB, p0, p1, p2, p3, t + 0.01, tension);
        v3toArray(_curvePoint, curvePoints, j * 3);
        v3normalize(_tangentVec, v3sub(_tangentVec, _tanA, _tanB));
        v3toArray(_tangentVec, tangentVectors, j * 3);
    }
}
function interpolateNormals(state, firstDirection, lastDirection) {
    const { curvePoints, tangentVectors, normalVectors, binormalVectors } = state;
    const n = curvePoints.length / 3;
    v3fromArray(_firstTangentVec, tangentVectors, 0);
    v3fromArray(_lastTangentVec, tangentVectors, (n - 1) * 3);
    v3orthogonalize(_firstNormalVec, _firstTangentVec, firstDirection);
    v3orthogonalize(_lastNormalVec, _lastTangentVec, lastDirection);
    v3matchDirection(_lastNormalVec, _lastNormalVec, _firstNormalVec);
    v3copy(_prevNormal, _firstNormalVec);
    const n1 = n - 1;
    for (let i = 0; i < n; ++i) {
        const j = (0, interpolate_1.smoothstep)(0, n1, i) * n1;
        const t = i === 0 ? 0 : 1 / (n - j);
        v3fromArray(_tangentVec, tangentVectors, i * 3);
        v3orthogonalize(_normalVec, _tangentVec, v3slerp(_tmpNormal, _prevNormal, _lastNormalVec, t));
        v3toArray(_normalVec, normalVectors, i * 3);
        v3copy(_prevNormal, _normalVec);
        v3normalize(_binormalVec, v3cross(_binormalVec, _tangentVec, _normalVec));
        v3toArray(_binormalVec, binormalVectors, i * 3);
    }
    for (let i = 1; i < n1; ++i) {
        v3fromArray(_prevNormal, normalVectors, (i - 1) * 3);
        v3fromArray(_normalVec, normalVectors, i * 3);
        v3fromArray(_nextNormal, normalVectors, (i + 1) * 3);
        v3scale(_normalVec, v3add(_normalVec, _prevNormal, v3add(_normalVec, _nextNormal, _normalVec)), 1 / 3);
        v3toArray(_normalVec, normalVectors, i * 3);
        v3fromArray(_tangentVec, tangentVectors, i * 3);
        v3normalize(_binormalVec, v3cross(_binormalVec, _tangentVec, _normalVec));
        v3toArray(_binormalVec, binormalVectors, i * 3);
    }
}
function interpolate(state, p0, p1, p2, p3, firstDir, lastDir, tRange = [0, 1]) {
    interpolatePointsAndTangents(state, p0, p1, p2, p3, tRange);
    interpolateNormals(state, firstDir, lastDir);
}
function createNtCTubeSegmentsIterator(structureGroup) {
    var _a, _b;
    const { structure, group } = structureGroup;
    const instanceCount = group.units.length;
    const data = (_b = (_a = property_1.NtCTubeProvider.get(structure.model)) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.data;
    if (!data)
        return (0, location_iterator_1.LocationIterator)(0, 1, 1, () => location_1.NullLocation);
    const numBlocks = data.data.steps.length * 4;
    const getLocation = (groupId, instanceId) => {
        if (groupId > numBlocks)
            return location_1.NullLocation;
        const stepIdx = Math.floor(groupId / 4);
        const step = data.data.steps[stepIdx];
        const r = groupId % 4;
        const kind = r === 0 ? 'upper' :
            r === 1 ? 'lower' :
                r === 2 ? 'residue-boundary' : 'segment-boundary';
        return types_1.NtCTubeTypes.Location({ step, kind });
    };
    return (0, location_iterator_1.LocationIterator)(totalMeshGroupsCount(data.data.steps) + 1, instanceCount, 1, getLocation);
}
function segmentCount(structure, props) {
    const quality = props.quality;
    if (quality === 'custom')
        return { linear: props.linearSegments, radial: props.radialSegments };
    else if (quality === 'auto') {
        const autoQuality = (0, util_3.getStructureQuality)(structure);
        return { linear: LinearSegmentCount[autoQuality], radial: RadialSegmentCount[autoQuality] };
    }
    else
        return { linear: LinearSegmentCount[quality], radial: RadialSegmentCount[quality] };
}
function stepBoundingSphere(step, struLoci) {
    const one = util_2.DnatcoUtil.residueToLoci(step.auth_asym_id_1, step.auth_seq_id_1, step.label_alt_id_1, step.PDB_ins_code_1, struLoci, 'auth');
    const two = util_2.DnatcoUtil.residueToLoci(step.auth_asym_id_2, step.auth_seq_id_2, step.label_alt_id_2, step.PDB_ins_code_2, struLoci, 'auth');
    if (structure_1.StructureElement.Loci.is(one) && structure_1.StructureElement.Loci.is(two)) {
        const union = (0, structure_set_1.structureUnion)(struLoci.structure, [structure_1.StructureElement.Loci.toStructure(one), structure_1.StructureElement.Loci.toStructure(two)]);
        return union.boundary.sphere;
    }
    return void 0;
}
function totalMeshGroupsCount(steps) {
    // Each segment has two blocks, Residue Boundary marker and a Segment Boundary marker
    return steps.length * 4 - 1; // Subtract one because the last Segment Boundary marker is not drawn
}
function createNtCTubeMesh(ctx, unit, structure, theme, props, mesh) {
    if (!structure_1.Unit.isAtomic(unit))
        return mesh_1.Mesh.createEmpty(mesh);
    const prop = property_1.NtCTubeProvider.get(structure.model).value;
    if (prop === undefined || prop.data === undefined)
        return mesh_1.Mesh.createEmpty(mesh);
    const { data } = prop.data;
    if (data.steps.length === 0)
        return mesh_1.Mesh.createEmpty(mesh);
    const MarkerLinearSegmentCount = 2;
    const segCount = segmentCount(structure, props);
    const vertexCount = Math.floor((segCount.linear * 4 * data.steps.length / structure.model.atomicHierarchy.chains._rowCount) * segCount.radial);
    const chunkSize = Math.floor(vertexCount / 3);
    const diameter = 1.0 * theme.size.props.value;
    const mb = mesh_builder_1.MeshBuilder.createState(vertexCount, chunkSize, mesh);
    const state = (0, polymer_1.createCurveSegmentState)(segCount.linear);
    const { curvePoints, normalVectors, binormalVectors, widthValues, heightValues } = state;
    for (let idx = 0; idx <= segCount.linear; idx++) {
        widthValues[idx] = diameter;
        heightValues[idx] = diameter;
    }
    const [normals, binormals] = [binormalVectors, normalVectors]; // Needed so that the tube is not drawn from inside out
    const markerState = (0, polymer_1.createCurveSegmentState)(MarkerLinearSegmentCount);
    const { curvePoints: mCurvePoints, normalVectors: mNormalVectors, binormalVectors: mBinormalVectors, widthValues: mWidthValues, heightValues: mHeightValues } = markerState;
    for (let idx = 0; idx <= MarkerLinearSegmentCount; idx++) {
        mWidthValues[idx] = diameter;
        mHeightValues[idx] = diameter;
    }
    const [mNormals, mBinormals] = [mBinormalVectors, mNormalVectors];
    const firstDir = (0, linear_algebra_1.Vec3)();
    const lastDir = (0, linear_algebra_1.Vec3)();
    const markerDir = (0, linear_algebra_1.Vec3)();
    const residueMarkerWidth = props.residueMarkerWidth / 2;
    const it = new util_1.NtCTubeSegmentsIterator(structure, unit);
    while (it.hasNext) {
        const segment = it.move();
        if (!segment)
            continue;
        const { p_1, p0, p1, p2, p3, p4, pP } = segment;
        const FirstBlockId = segment.stepIdx * 4;
        const SecondBlockId = FirstBlockId + 1;
        const ResidueMarkerId = FirstBlockId + 2;
        const SegmentBoundaryMarkerId = FirstBlockId + 3;
        const { rmShift, rmPos } = calcResidueMarkerShift(p2, p3, pP);
        if (segment.firstInChain) {
            v3normalize(firstDir, v3sub(firstDir, p2, p1));
            v3normalize(lastDir, v3sub(lastDir, rmPos, p2));
        }
        else {
            v3copy(firstDir, lastDir);
            v3normalize(lastDir, v3sub(lastDir, rmPos, p2));
        }
        // C5' -> O3' block
        interpolate(state, p0, p1, p2, p3, firstDir, lastDir);
        mb.currentGroup = FirstBlockId;
        (0, tube_1.addTube)(mb, curvePoints, normals, binormals, segCount.linear, segCount.radial, widthValues, heightValues, segment.firstInChain || segment.followsGap, false, 'rounded');
        // O3' -> C5' block
        v3copy(firstDir, lastDir);
        v3normalize(markerDir, v3sub(markerDir, p3, rmPos));
        v3normalize(lastDir, v3sub(lastDir, p4, p3));
        // From O3' to the residue marker
        interpolate(state, p1, p2, p3, p4, firstDir, markerDir, [0, rmShift - residueMarkerWidth]);
        mb.currentGroup = SecondBlockId;
        (0, tube_1.addTube)(mb, curvePoints, normals, binormals, segCount.linear, segCount.radial, widthValues, heightValues, false, false, 'rounded');
        // Residue marker
        interpolate(markerState, p1, p2, p3, p4, markerDir, markerDir, [rmShift - residueMarkerWidth, rmShift + residueMarkerWidth]);
        mb.currentGroup = ResidueMarkerId;
        (0, tube_1.addTube)(mb, mCurvePoints, mNormals, mBinormals, MarkerLinearSegmentCount, segCount.radial, mWidthValues, mHeightValues, false, false, 'rounded');
        if (segment.capEnd) {
            // From the residue marker to C5' of the end
            interpolate(state, p1, p2, p3, p4, markerDir, lastDir, [rmShift + residueMarkerWidth, 1]);
            mb.currentGroup = SecondBlockId;
            (0, tube_1.addTube)(mb, curvePoints, normals, binormals, segCount.linear, segCount.radial, widthValues, heightValues, false, true, 'rounded');
        }
        else {
            // From the residue marker to C5' of the step boundary marker
            interpolate(state, p1, p2, p3, p4, markerDir, lastDir, [rmShift + residueMarkerWidth, 1 - props.segmentBoundaryWidth]);
            mb.currentGroup = SecondBlockId;
            (0, tube_1.addTube)(mb, curvePoints, normals, binormals, segCount.linear, segCount.radial, widthValues, heightValues, false, false, 'rounded');
            // Step boundary marker
            interpolate(markerState, p1, p2, p3, p4, lastDir, lastDir, [1 - props.segmentBoundaryWidth, 1]);
            mb.currentGroup = SegmentBoundaryMarkerId;
            (0, tube_1.addTube)(mb, mCurvePoints, mNormals, mBinormals, MarkerLinearSegmentCount, segCount.radial, mWidthValues, mHeightValues, false, false, 'rounded');
        }
        if (segment.followsGap) {
            const cylinderProps = {
                radiusTop: diameter / 2, radiusBottom: diameter / 2, topCap: true, bottomCap: true, radialSegments: segCount.radial,
            };
            mb.currentGroup = FirstBlockId;
            (0, cylinder_1.addFixedCountDashedCylinder)(mb, p_1, p1, 1, 2 * segCount.linear, false, cylinderProps);
        }
    }
    const boundingSphere = sphere3d_1.Sphere3D.expand((0, sphere3d_1.Sphere3D)(), unit.boundary.sphere, 1.05);
    const m = mesh_builder_1.MeshBuilder.getMesh(mb);
    m.setBoundingSphere(boundingSphere);
    return m;
}
const _rmvCO = (0, linear_algebra_1.Vec3)();
const _rmvPO = (0, linear_algebra_1.Vec3)();
const _rmPos = (0, linear_algebra_1.Vec3)();
const _HalfPi = Math.PI / 2;
function calcResidueMarkerShift(pO, pC, pP) {
    v3sub(_rmvCO, pC, pO);
    v3sub(_rmvPO, pP, pO);
    // Project position of P atom on the O3' -> C5' vector
    const beta = linear_algebra_1.Vec3.angle(_rmvPO, _rmvCO);
    const alpha = _HalfPi - Math.abs(beta);
    const lengthMO = Math.cos(alpha) * linear_algebra_1.Vec3.magnitude(_rmvPO);
    const shift = lengthMO / linear_algebra_1.Vec3.magnitude(_rmvCO);
    v3scale(_rmvCO, _rmvCO, shift);
    v3add(_rmPos, _rmvCO, pO);
    return { rmShift: shift, rmPos: _rmPos };
}
function getNtCTubeSegmentLoci(pickingId, structureGroup, id) {
    var _a, _b, _c;
    const { groupId, objectId, instanceId } = pickingId;
    if (objectId !== id)
        return loci_1.EmptyLoci;
    const { structure } = structureGroup;
    const unit = structureGroup.group.units[instanceId];
    if (!structure_1.Unit.isAtomic(unit))
        return loci_1.EmptyLoci;
    const data = (_c = (_b = (_a = property_1.NtCTubeProvider.get(structure.model)) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : undefined;
    if (!data)
        return loci_1.EmptyLoci;
    const MeshGroupsCount = totalMeshGroupsCount(data.data.steps);
    if (groupId > MeshGroupsCount)
        return loci_1.EmptyLoci;
    const stepIdx = Math.floor(groupId / 4);
    const bs = stepBoundingSphere(data.data.steps[stepIdx], structure_1.Structure.toStructureElementLoci(structure));
    /*
     * NOTE 1) Each step is drawn with 4 mesh groups. We need to divide/multiply by 4 to convert between steps and mesh groups.
     * NOTE 2) Molstar will create a mesh only for the asymmetric unit. When the entire biological assembly
     *         is displayed, Molstar just copies and transforms the mesh. This means that even though the mesh
     *         might be displayed multiple times, groupIds of the individual blocks in the mesh will be the same.
     *         If there are multiple copies of a mesh, Molstar needs to be able to tell which block belongs to which copy of the mesh.
     *         To do that, Molstar adds an offset to groupIds of the copied meshes. Offset is calculated as follows:
     *
     *         offset = NumberOfBlocks * UnitIndex
     *
     *         "NumberOfBlocks" is the number of valid Location objects got from LocationIterator *or* the greatest groupId set by
     *         the mesh generator - whichever is smaller.
     *
     *         UnitIndex is the index of the Unit the mesh belongs to, starting from 0. (See "unitMap" in the Structure object).
     *         We can also get this index from the value "instanceId" of the "pickingId" object.
     *
     *         If this offset is not applied, picking a piece of one of the copied meshes would actually pick that piece in the original mesh.
     *         This is particularly apparent with highlighting - hovering over items in a copied mesh incorrectly highlights those items in the source mesh.
     *
     *         Molstar can take advantage of the fact that ElementLoci has a reference to the Unit object attached to it. Since we cannot attach ElementLoci
     *         to a step, we need to calculate the offseted groupId here and pass it as part of the DataLoci.
     */
    const offsetGroupId = stepIdx * 4 + (MeshGroupsCount + 1) * instanceId;
    return types_1.NtCTubeTypes.Loci(data.data.steps, [stepIdx], [offsetGroupId], bs);
}
function eachNtCTubeSegment(loci, structureGroup, apply) {
    if (types_1.NtCTubeTypes.isLoci(loci)) {
        const offsetGroupId = loci.elements[0];
        return apply(int_1.Interval.ofBounds(offsetGroupId, offsetGroupId + 4));
    }
    return false;
}
function NtCTubeVisual(materialId) {
    return (0, units_visual_1.UnitsMeshVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(NtCTubeMeshParams),
        createGeometry: createNtCTubeMesh,
        createLocationIterator: createNtCTubeSegmentsIterator,
        getLoci: getNtCTubeSegmentLoci,
        eachLocation: eachNtCTubeSegment,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.quality !== currentProps.quality ||
                newProps.residueMarkerWidth !== currentProps.residueMarkerWidth ||
                newProps.segmentBoundaryWidth !== currentProps.segmentBoundaryWidth ||
                newProps.doubleSided !== currentProps.doubleSided ||
                newProps.alpha !== currentProps.alpha ||
                newProps.linearSegments !== currentProps.linearSegments ||
                newProps.radialSegments !== currentProps.radialSegments);
        }
    }, materialId);
}
const NtCTubeVisuals = {
    'ntc-tube-symbol': (ctx, getParams) => (0, representation_2.UnitsRepresentation)('NtC Tube Mesh', ctx, getParams, NtCTubeVisual),
};
exports.NtCTubeParams = {
    ...NtCTubeMeshParams
};
function getNtCTubeParams(ctx, structure) {
    return param_definition_1.ParamDefinition.clone(exports.NtCTubeParams);
}
function NtCTubeRepresentation(ctx, getParams) {
    return representation_1.Representation.createMulti('NtC Tube', ctx, getParams, representation_2.StructureRepresentationStateBuilder, NtCTubeVisuals);
}
exports.NtCTubeRepresentationProvider = (0, representation_2.StructureRepresentationProvider)({
    name: 'ntc-tube',
    label: 'NtC Tube',
    description: 'Displays schematic representation of NtC conformers',
    factory: NtCTubeRepresentation,
    getParams: getNtCTubeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.NtCTubeParams),
    defaultColorTheme: { name: 'ntc-tube' },
    defaultSizeTheme: { name: 'uniform', props: { value: 2.0 } },
    isApplicable: (structure) => structure.models.every(m => property_2.Dnatco.isApplicable(m)),
    ensureCustomProperties: {
        attach: async (ctx, structure) => structure.models.forEach(m => property_1.NtCTubeProvider.attach(ctx, m, void 0, true)),
        detach: (data) => data.models.forEach(m => property_1.NtCTubeProvider.ref(m, false)),
    },
});
