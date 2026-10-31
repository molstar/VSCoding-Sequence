/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { createRenderable } from '../renderable';
import { createGraphicsRenderItem } from '../webgl/render-item';
import { AttributeSpec, UniformSpec, GlobalUniformSchema, InternalSchema, TextureSpec, ElementsSpec, DefineSpec, GlobalTextureSchema, BaseSchema } from './schema';
import { DirectVolumeShaderCode } from '../shader-code';
import { ValueCell } from '../../mol-util';
export const DirectVolumeSchema = {
    ...BaseSchema,
    aPosition: AttributeSpec('float32', 3, 0),
    elements: ElementsSpec('uint32'),
    uBboxMin: UniformSpec('v3'),
    uBboxMax: UniformSpec('v3'),
    uBboxSize: UniformSpec('v3'),
    uMaxSteps: UniformSpec('i'),
    uStepScale: UniformSpec('f'),
    uJumpLength: UniformSpec('f'),
    uTransform: UniformSpec('m4'),
    uGridDim: UniformSpec('v3'),
    tTransferTex: TextureSpec('image-uint8', 'alpha', 'ubyte', 'linear'),
    uTransferScale: UniformSpec('f', 'material'),
    dGridTexType: DefineSpec('string', ['2d', '3d']),
    uGridTexDim: UniformSpec('v3'),
    tGridTex: TextureSpec('texture', 'rgba', 'ubyte', 'linear'),
    uGridStats: UniformSpec('v4'), // [min, max, mean, sigma]
    uCellDim: UniformSpec('v3'),
    uCartnToUnit: UniformSpec('m4'),
    uUnitToCartn: UniformSpec('m4'),
    dPackedGroup: DefineSpec('boolean'),
    dAxisOrder: DefineSpec('string', ['012', '021', '102', '120', '201', '210']),
    dIgnoreLight: DefineSpec('boolean'),
    dCelShaded: DefineSpec('boolean'),
    dXrayShaded: DefineSpec('string', ['off', 'on', 'inverted']),
};
export function DirectVolumeRenderable(ctx, id, values, state, materialId, transparency) {
    const schema = { ...GlobalUniformSchema, ...GlobalTextureSchema, ...InternalSchema, ...DirectVolumeSchema };
    if (!ctx.isWebGL2) {
        // workaround for webgl1 limitation that loop counters need to be `const`
        schema.uMaxSteps = DefineSpec('number');
    }
    const internalValues = {
        uObjectId: ValueCell.create(id),
    };
    const shaderCode = DirectVolumeShaderCode;
    const renderItem = createGraphicsRenderItem(ctx, 'triangles', shaderCode, schema, { ...values, ...internalValues }, materialId, transparency);
    return createRenderable(renderItem, values, state);
}
