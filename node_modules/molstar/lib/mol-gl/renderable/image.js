/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { createRenderable } from '../renderable';
import { createGraphicsRenderItem } from '../webgl/render-item';
import { AttributeSpec, GlobalUniformSchema, InternalSchema, TextureSpec, ElementsSpec, DefineSpec, BaseSchema, UniformSpec, GlobalTextureSchema } from './schema';
import { ImageShaderCode } from '../shader-code';
import { ValueCell } from '../../mol-util';
import { InterpolationTypeNames } from '../../mol-geo/geometry/image/image';
export const ImageSchema = {
    ...BaseSchema,
    aGroup: AttributeSpec('float32', 1, 0),
    aPosition: AttributeSpec('float32', 3, 0),
    aUv: AttributeSpec('float32', 2, 0),
    elements: ElementsSpec('uint32'),
    uImageTexDim: UniformSpec('v2'),
    tImageTex: TextureSpec('image-uint8', 'rgba', 'ubyte', 'nearest'),
    tGroupTex: TextureSpec('image-uint8', 'rgba', 'ubyte', 'nearest'),
    dInterpolation: DefineSpec('string', InterpolationTypeNames),
};
export function ImageRenderable(ctx, id, values, state, materialId, transparency) {
    const schema = { ...GlobalUniformSchema, ...GlobalTextureSchema, ...InternalSchema, ...ImageSchema };
    const internalValues = {
        uObjectId: ValueCell.create(id),
    };
    const shaderCode = ImageShaderCode;
    const renderItem = createGraphicsRenderItem(ctx, 'triangles', shaderCode, schema, { ...values, ...internalValues }, materialId, transparency);
    return createRenderable(renderItem, values, state);
}
