"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
const result_1 = require("../result");
const mol_task_1 = require("../../../mol-task");
const mesh_1 = require("../../../mol-geo/geometry/mesh/mesh");
async function parseInternal(data, ctx) {
    // TODO
    const mesh = mesh_1.Mesh.createEmpty();
    // Mesh.computeNormalsImmediate(mesh)
    return result_1.ReaderResult.success(mesh);
}
function parse(data) {
    return mol_task_1.Task.create('Parse OBJ', async (ctx) => {
        return await parseInternal(data, ctx);
    });
}
