"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinesSchema = void 0;
exports.LinesRenderable = LinesRenderable;
const renderable_1 = require("../renderable");
const render_item_1 = require("../webgl/render-item");
const schema_1 = require("./schema");
const mol_util_1 = require("../../mol-util");
const shader_code_1 = require("../shader-code");
exports.LinesSchema = {
    ...schema_1.BaseSchema,
    ...schema_1.SizeSchema,
    aGroup: (0, schema_1.AttributeSpec)('float32', 1, 0),
    aMapping: (0, schema_1.AttributeSpec)('float32', 2, 0),
    aStart: (0, schema_1.AttributeSpec)('float32', 3, 0),
    aEnd: (0, schema_1.AttributeSpec)('float32', 3, 0),
    elements: (0, schema_1.ElementsSpec)('uint32'),
    dLineSizeAttenuation: (0, schema_1.DefineSpec)('boolean'),
    uDoubleSided: (0, schema_1.UniformSpec)('b', 'material'),
    dFlipSided: (0, schema_1.DefineSpec)('boolean'),
};
function LinesRenderable(ctx, id, values, state, materialId, transparency) {
    const schema = { ...schema_1.GlobalUniformSchema, ...schema_1.GlobalTextureSchema, ...schema_1.InternalSchema, ...exports.LinesSchema };
    const internalValues = {
        uObjectId: mol_util_1.ValueCell.create(id),
    };
    const shaderCode = shader_code_1.LinesShaderCode;
    const renderItem = (0, render_item_1.createGraphicsRenderItem)(ctx, 'triangles', shaderCode, schema, { ...values, ...internalValues }, materialId, transparency);
    return (0, renderable_1.createRenderable)(renderItem, values, state);
}
