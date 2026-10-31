"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsSchema = void 0;
exports.PointsRenderable = PointsRenderable;
const renderable_1 = require("../renderable");
const render_item_1 = require("../webgl/render-item");
const schema_1 = require("./schema");
const shader_code_1 = require("../shader-code");
const mol_util_1 = require("../../mol-util");
exports.PointsSchema = {
    ...schema_1.BaseSchema,
    ...schema_1.SizeSchema,
    aGroup: (0, schema_1.AttributeSpec)('float32', 1, 0),
    aPosition: (0, schema_1.AttributeSpec)('float32', 3, 0),
    dPointSizeAttenuation: (0, schema_1.DefineSpec)('boolean'),
    dPointStyle: (0, schema_1.DefineSpec)('string', ['square', 'circle', 'fuzzy']),
};
function PointsRenderable(ctx, id, values, state, materialId, transparency) {
    const schema = { ...schema_1.GlobalUniformSchema, ...schema_1.GlobalTextureSchema, ...schema_1.InternalSchema, ...exports.PointsSchema };
    const internalValues = {
        uObjectId: mol_util_1.ValueCell.create(id),
    };
    const shaderCode = shader_code_1.PointsShaderCode;
    const renderItem = (0, render_item_1.createGraphicsRenderItem)(ctx, 'points', shaderCode, schema, { ...values, ...internalValues }, materialId, transparency);
    return (0, renderable_1.createRenderable)(renderItem, values, state);
}
