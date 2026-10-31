/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { createRenderable } from '../renderable';
import { createGraphicsRenderItem } from '../webgl/render-item';
import { GlobalUniformSchema, BaseSchema, AttributeSpec, DefineSpec, InternalSchema, SizeSchema, GlobalTextureSchema } from './schema';
import { PointsShaderCode } from '../shader-code';
import { ValueCell } from '../../mol-util';
export const PointsSchema = {
    ...BaseSchema,
    ...SizeSchema,
    aGroup: AttributeSpec('float32', 1, 0),
    aPosition: AttributeSpec('float32', 3, 0),
    dPointSizeAttenuation: DefineSpec('boolean'),
    dPointStyle: DefineSpec('string', ['square', 'circle', 'fuzzy']),
};
export function PointsRenderable(ctx, id, values, state, materialId, transparency) {
    const schema = { ...GlobalUniformSchema, ...GlobalTextureSchema, ...InternalSchema, ...PointsSchema };
    const internalValues = {
        uObjectId: ValueCell.create(id),
    };
    const shaderCode = PointsShaderCode;
    const renderItem = createGraphicsRenderItem(ctx, 'points', shaderCode, schema, { ...values, ...internalValues }, materialId, transparency);
    return createRenderable(renderItem, values, state);
}
