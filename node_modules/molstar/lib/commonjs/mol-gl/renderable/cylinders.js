"use strict";
/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CylindersSchema = void 0;
exports.CylindersRenderable = CylindersRenderable;
const renderable_1 = require("../renderable");
const render_item_1 = require("../webgl/render-item");
const schema_1 = require("./schema");
const shader_code_1 = require("../shader-code");
const mol_util_1 = require("../../mol-util");
exports.CylindersSchema = {
    ...schema_1.BaseSchema,
    ...schema_1.SizeSchema,
    aGroup: (0, schema_1.AttributeSpec)('float32', 1, 0),
    aStart: (0, schema_1.AttributeSpec)('float32', 3, 0),
    aEnd: (0, schema_1.AttributeSpec)('float32', 3, 0),
    aMapping: (0, schema_1.AttributeSpec)('float32', 3, 0),
    aScale: (0, schema_1.AttributeSpec)('float32', 1, 0),
    aCap: (0, schema_1.AttributeSpec)('float32', 1, 0),
    aColorMode: (0, schema_1.AttributeSpec)('float32', 1, 0),
    elements: (0, schema_1.ElementsSpec)('uint32'),
    padding: (0, schema_1.ValueSpec)('number'),
    uDoubleSided: (0, schema_1.UniformSpec)('b', 'material'),
    dIgnoreLight: (0, schema_1.DefineSpec)('boolean'),
    dCelShaded: (0, schema_1.DefineSpec)('boolean'),
    dXrayShaded: (0, schema_1.DefineSpec)('string', ['off', 'on', 'inverted']),
    dTransparentBackfaces: (0, schema_1.DefineSpec)('string', ['off', 'on', 'opaque']),
    dSolidInterior: (0, schema_1.DefineSpec)('boolean'),
    uBumpFrequency: (0, schema_1.UniformSpec)('f', 'material'),
    uBumpAmplitude: (0, schema_1.UniformSpec)('f', 'material'),
    dDualColor: (0, schema_1.DefineSpec)('boolean'),
};
function CylindersRenderable(ctx, id, values, state, materialId, transparency) {
    const schema = { ...schema_1.GlobalUniformSchema, ...schema_1.GlobalTextureSchema, ...schema_1.InternalSchema, ...exports.CylindersSchema };
    const internalValues = {
        uObjectId: mol_util_1.ValueCell.create(id),
    };
    const shaderCode = shader_code_1.CylindersShaderCode;
    const renderItem = (0, render_item_1.createGraphicsRenderItem)(ctx, 'triangles', shaderCode, schema, { ...values, ...internalValues }, materialId, transparency);
    return (0, renderable_1.createRenderable)(renderItem, values, state);
}
