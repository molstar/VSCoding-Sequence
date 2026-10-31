/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ReaderResult as Result } from '../result';
import { Task } from '../../../mol-task';
import { Mesh } from '../../../mol-geo/geometry/mesh/mesh';
async function parseInternal(data, ctx) {
    // TODO
    const mesh = Mesh.createEmpty();
    // Mesh.computeNormalsImmediate(mesh)
    return Result.success(mesh);
}
export function parse(data) {
    return Task.create('Parse OBJ', async (ctx) => {
        return await parseInternal(data, ctx);
    });
}
