"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextSchema = void 0;
exports.TextRenderable = TextRenderable;
const renderable_1 = require("../renderable");
const render_item_1 = require("../webgl/render-item");
const schema_1 = require("./schema");
const shader_code_1 = require("../shader-code");
const mol_util_1 = require("../../mol-util");
exports.TextSchema = {
    ...schema_1.BaseSchema,
    ...schema_1.SizeSchema,
    aGroup: (0, schema_1.AttributeSpec)('float32', 1, 0),
    aPosition: (0, schema_1.AttributeSpec)('float32', 3, 0),
    aMapping: (0, schema_1.AttributeSpec)('float32', 2, 0),
    aDepth: (0, schema_1.AttributeSpec)('float32', 1, 0),
    elements: (0, schema_1.ElementsSpec)('uint32'),
    aTexCoord: (0, schema_1.AttributeSpec)('float32', 2, 0),
    tFont: (0, schema_1.TextureSpec)('image-uint8', 'alpha', 'ubyte', 'linear'),
    padding: (0, schema_1.ValueSpec)('number'),
    uBorderWidth: (0, schema_1.UniformSpec)('f', 'material'),
    uBorderColor: (0, schema_1.UniformSpec)('v3', 'material'),
    uOffsetX: (0, schema_1.UniformSpec)('f', 'material'),
    uOffsetY: (0, schema_1.UniformSpec)('f', 'material'),
    uOffsetZ: (0, schema_1.UniformSpec)('f', 'material'),
    uBackgroundColor: (0, schema_1.UniformSpec)('v3', 'material'),
    uBackgroundOpacity: (0, schema_1.UniformSpec)('f', 'material'),
};
function TextRenderable(ctx, id, values, state, materialId, transparency) {
    const schema = { ...schema_1.GlobalUniformSchema, ...schema_1.GlobalTextureSchema, ...schema_1.InternalSchema, ...exports.TextSchema };
    const internalValues = {
        uObjectId: mol_util_1.ValueCell.create(id),
    };
    const shaderCode = shader_code_1.TextShaderCode;
    const renderItem = (0, render_item_1.createGraphicsRenderItem)(ctx, 'triangles', shaderCode, schema, { ...values, ...internalValues }, materialId, transparency);
    return (0, renderable_1.createRenderable)(renderItem, values, state);
}
