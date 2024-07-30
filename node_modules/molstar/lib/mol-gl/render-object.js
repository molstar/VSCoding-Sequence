/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { idFactory } from '../mol-util/id-factory';
import { DirectVolumeRenderable } from './renderable/direct-volume';
import { MeshRenderable } from './renderable/mesh';
import { PointsRenderable } from './renderable/points';
import { LinesRenderable } from './renderable/lines';
import { SpheresRenderable } from './renderable/spheres';
import { TextRenderable } from './renderable/text';
import { TextureMeshRenderable } from './renderable/texture-mesh';
import { ImageRenderable } from './renderable/image';
import { CylindersRenderable } from './renderable/cylinders';
const getNextId = idFactory(0, 0x7FFFFFFF);
export const getNextMaterialId = idFactory(0, 0x7FFFFFFF);
//
export function createRenderObject(type, values, state, materialId) {
    return { id: getNextId(), type, values, state, materialId };
}
export function createRenderable(ctx, o, transparency) {
    switch (o.type) {
        case 'mesh': return MeshRenderable(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'points': return PointsRenderable(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'spheres': return SpheresRenderable(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'cylinders': return CylindersRenderable(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'text': return TextRenderable(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'lines': return LinesRenderable(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'direct-volume': return DirectVolumeRenderable(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'image': return ImageRenderable(ctx, o.id, o.values, o.state, o.materialId, transparency);
        case 'texture-mesh': return TextureMeshRenderable(ctx, o.id, o.values, o.state, o.materialId, transparency);
    }
    throw new Error('unsupported type');
}
