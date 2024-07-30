"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHiZRenderable = createHiZRenderable;
const vec2_1 = require("../../mol-math/linear-algebra/3d/vec2");
const value_cell_1 = require("../../mol-util/value-cell");
const renderable_1 = require("../renderable");
const schema_1 = require("../renderable/schema");
const shader_code_1 = require("../shader-code");
const hi_z_frag_1 = require("../shader/hi-z.frag");
const quad_vert_1 = require("../shader/quad.vert");
const render_item_1 = require("../webgl/render-item");
const util_1 = require("./util");
const HiZSchema = {
    ...util_1.QuadSchema,
    tPreviousLevel: (0, schema_1.TextureSpec)('texture', 'alpha', 'float', 'nearest'),
    uInvSize: (0, schema_1.UniformSpec)('v2'),
    uOffset: (0, schema_1.UniformSpec)('v2'),
};
const HiZShaderCode = (0, shader_code_1.ShaderCode)('hi-z', quad_vert_1.quad_vert, hi_z_frag_1.hiZ_frag);
function createHiZRenderable(ctx, previousLevel) {
    const values = {
        ...util_1.QuadValues,
        tPreviousLevel: value_cell_1.ValueCell.create(previousLevel),
        uInvSize: value_cell_1.ValueCell.create((0, vec2_1.Vec2)()),
        uOffset: value_cell_1.ValueCell.create((0, vec2_1.Vec2)()),
    };
    const schema = { ...HiZSchema };
    const renderItem = (0, render_item_1.createComputeRenderItem)(ctx, 'triangles', HiZShaderCode, schema, values);
    return (0, renderable_1.createComputeRenderable)(renderItem, values);
}
