/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { createRenderable } from '../renderable';
import { createGraphicsRenderItem } from '../webgl/render-item';
import { GlobalUniformSchema, BaseSchema, AttributeSpec, InternalSchema, SizeSchema, ElementsSpec, ValueSpec, DefineSpec, GlobalTextureSchema, UniformSpec } from './schema';
import { CylindersShaderCode } from '../shader-code';
import { ValueCell } from '../../mol-util';
export const CylindersSchema = {
    ...BaseSchema,
    ...SizeSchema,
    aGroup: AttributeSpec('float32', 1, 0),
    aStart: AttributeSpec('float32', 3, 0),
    aEnd: AttributeSpec('float32', 3, 0),
    aMapping: AttributeSpec('float32', 3, 0),
    aScale: AttributeSpec('float32', 1, 0),
    aCap: AttributeSpec('float32', 1, 0),
    aColorMode: AttributeSpec('float32', 1, 0),
    elements: ElementsSpec('uint32'),
    padding: ValueSpec('number'),
    uDoubleSided: UniformSpec('b', 'material'),
    dIgnoreLight: DefineSpec('boolean'),
    dCelShaded: DefineSpec('boolean'),
    dXrayShaded: DefineSpec('string', ['off', 'on', 'inverted']),
    dTransparentBackfaces: DefineSpec('string', ['off', 'on', 'opaque']),
    dSolidInterior: DefineSpec('boolean'),
    uBumpFrequency: UniformSpec('f', 'material'),
    uBumpAmplitude: UniformSpec('f', 'material'),
    dDualColor: DefineSpec('boolean'),
};
export function CylindersRenderable(ctx, id, values, state, materialId, transparency) {
    const schema = { ...GlobalUniformSchema, ...GlobalTextureSchema, ...InternalSchema, ...CylindersSchema };
    const internalValues = {
        uObjectId: ValueCell.create(id),
    };
    const shaderCode = CylindersShaderCode;
    const renderItem = createGraphicsRenderItem(ctx, 'triangles', shaderCode, schema, { ...values, ...internalValues }, materialId, transparency);
    return createRenderable(renderItem, values, state);
}
