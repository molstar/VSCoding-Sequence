"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshSchema = void 0;
exports.MeshRenderable = MeshRenderable;
const renderable_1 = require("../renderable");
const render_item_1 = require("../webgl/render-item");
const schema_1 = require("./schema");
const shader_code_1 = require("../shader-code");
const mol_util_1 = require("../../mol-util");
exports.MeshSchema = {
    ...schema_1.BaseSchema,
    aGroup: (0, schema_1.AttributeSpec)('float32', 1, 0),
    aPosition: (0, schema_1.AttributeSpec)('float32', 3, 0),
    aNormal: (0, schema_1.AttributeSpec)('float32', 3, 0),
    elements: (0, schema_1.ElementsSpec)('uint32'),
    dVaryingGroup: (0, schema_1.DefineSpec)('boolean'),
    dFlatShaded: (0, schema_1.DefineSpec)('boolean'),
    uDoubleSided: (0, schema_1.UniformSpec)('b', 'material'),
    dFlipSided: (0, schema_1.DefineSpec)('boolean'),
    dIgnoreLight: (0, schema_1.DefineSpec)('boolean'),
    dCelShaded: (0, schema_1.DefineSpec)('boolean'),
    dXrayShaded: (0, schema_1.DefineSpec)('string', ['off', 'on', 'inverted']),
    dTransparentBackfaces: (0, schema_1.DefineSpec)('string', ['off', 'on', 'opaque']),
    uBumpFrequency: (0, schema_1.UniformSpec)('f', 'material'),
    uBumpAmplitude: (0, schema_1.UniformSpec)('f', 'material'),
    meta: (0, schema_1.ValueSpec)('unknown')
};
function MeshRenderable(ctx, id, values, state, materialId, transparency) {
    const schema = { ...schema_1.GlobalUniformSchema, ...schema_1.GlobalTextureSchema, ...schema_1.InternalSchema, ...exports.MeshSchema };
    const internalValues = {
        uObjectId: mol_util_1.ValueCell.create(id),
    };
    const shaderCode = shader_code_1.MeshShaderCode;
    const renderItem = (0, render_item_1.createGraphicsRenderItem)(ctx, 'triangles', shaderCode, schema, { ...values, ...internalValues }, materialId, transparency);
    return (0, renderable_1.createRenderable)(renderItem, values, state);
}
