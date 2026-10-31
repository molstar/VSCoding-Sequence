/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { createRenderable } from '../renderable';
import { createGraphicsRenderItem } from '../webgl/render-item';
import { GlobalUniformSchema, BaseSchema, AttributeSpec, UniformSpec, InternalSchema, SizeSchema, TextureSpec, ElementsSpec, ValueSpec, GlobalTextureSchema } from './schema';
import { TextShaderCode } from '../shader-code';
import { ValueCell } from '../../mol-util';
export const TextSchema = {
    ...BaseSchema,
    ...SizeSchema,
    aGroup: AttributeSpec('float32', 1, 0),
    aPosition: AttributeSpec('float32', 3, 0),
    aMapping: AttributeSpec('float32', 2, 0),
    aDepth: AttributeSpec('float32', 1, 0),
    elements: ElementsSpec('uint32'),
    aTexCoord: AttributeSpec('float32', 2, 0),
    tFont: TextureSpec('image-uint8', 'alpha', 'ubyte', 'linear'),
    padding: ValueSpec('number'),
    uBorderWidth: UniformSpec('f', 'material'),
    uBorderColor: UniformSpec('v3', 'material'),
    uOffsetX: UniformSpec('f', 'material'),
    uOffsetY: UniformSpec('f', 'material'),
    uOffsetZ: UniformSpec('f', 'material'),
    uBackgroundColor: UniformSpec('v3', 'material'),
    uBackgroundOpacity: UniformSpec('f', 'material'),
};
export function TextRenderable(ctx, id, values, state, materialId, transparency) {
    const schema = { ...GlobalUniformSchema, ...GlobalTextureSchema, ...InternalSchema, ...TextSchema };
    const internalValues = {
        uObjectId: ValueCell.create(id),
    };
    const shaderCode = TextShaderCode;
    const renderItem = createGraphicsRenderItem(ctx, 'triangles', shaderCode, schema, { ...values, ...internalValues }, materialId, transparency);
    return createRenderable(renderItem, values, state);
}
