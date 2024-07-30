/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ColorNames } from '../../../mol-util/color/names';
import { ShapeRepresentation } from '../representation';
import { Representation } from '../../representation';
import { Shape } from '../../../mol-model/shape';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
import { MeshBuilder } from '../../../mol-geo/geometry/mesh/mesh-builder';
import { structureElementLociLabelMany } from '../../../mol-theme/label';
import { Mat4, Vec3 } from '../../../mol-math/linear-algebra';
import { MarkerActions } from '../../../mol-util/marker-action';
import { Plane } from '../../../mol-geo/primitive/plane';
import { StructureElement } from '../../../mol-model/structure';
import { Axes3D } from '../../../mol-math/geometry';
const _PlaneParams = {
    ...Mesh.Params,
    color: PD.Color(ColorNames.orange),
    scaleFactor: PD.Numeric(1, { min: 0.1, max: 10, step: 0.1 }),
};
const PlaneVisuals = {
    'plane': (ctx, getParams) => ShapeRepresentation(getPlaneShape, Mesh.Utils),
};
export const PlaneParams = {
    ..._PlaneParams,
    visuals: PD.MultiSelect(['plane'], PD.objectToOptions(PlaneVisuals)),
};
//
function getPlaneName(locis) {
    const label = structureElementLociLabelMany(locis, { countsOnly: true });
    return `Best Fit Plane of ${label}`;
}
const tmpMat = Mat4();
const tmpV = Vec3();
function buildPlaneMesh(data, props, mesh) {
    const state = MeshBuilder.createState(256, 128, mesh);
    const principalAxes = StructureElement.Loci.getPrincipalAxesMany(data.locis);
    const axes = principalAxes.boxAxes;
    const plane = Plane();
    Vec3.add(tmpV, axes.origin, axes.dirC);
    Mat4.targetTo(tmpMat, tmpV, axes.origin, axes.dirB);
    Mat4.scale(tmpMat, tmpMat, Axes3D.size(tmpV, axes));
    Mat4.scaleUniformly(tmpMat, tmpMat, props.scaleFactor);
    Mat4.setTranslation(tmpMat, axes.origin);
    state.currentGroup = 0;
    MeshBuilder.addPrimitive(state, tmpMat, plane);
    MeshBuilder.addPrimitiveFlipped(state, tmpMat, plane);
    return MeshBuilder.getMesh(state);
}
function getPlaneShape(ctx, data, props, shape) {
    const mesh = buildPlaneMesh(data, props, shape && shape.geometry);
    const name = getPlaneName(data.locis);
    return Shape.create(name, data, mesh, () => props.color, () => 1, () => name);
}
export function PlaneRepresentation(ctx, getParams) {
    const repr = Representation.createMulti('Plane', ctx, getParams, Representation.StateBuilder, PlaneVisuals);
    repr.setState({ markerActions: MarkerActions.Highlighting });
    return repr;
}
