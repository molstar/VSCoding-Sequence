/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { decodeMsgPack } from '../../mol-io/common/msgpack/decode';
import { Task } from '../../mol-task';
import { inflate } from '../../mol-util/zip/zip';
const HEADER_SIZE = 64000;
export async function getG3dHeader(ctx, urlOrData) {
    const data = await getRawData(ctx, urlOrData, { offset: 0, size: HEADER_SIZE });
    let last = data.length - 1;
    for (; last >= 0; last--) {
        if (data[last] !== 0)
            break;
    }
    const header = decodeMsgPack(data.slice(0, last + 1));
    return header;
}
export async function getG3dDataBlock(ctx, header, urlOrData, resolution) {
    if (!header.offsets[resolution])
        throw new Error(`Resolution ${resolution} not available.`);
    const data = await getRawData(ctx, urlOrData, header.offsets[resolution]);
    const unzipped = await ctx.runTask(Task.create('Unzip', ctx => inflate(ctx, data)));
    return {
        header,
        resolution,
        data: decodeMsgPack(unzipped)
    };
}
async function getRawData(ctx, urlOrData, range) {
    if (typeof urlOrData === 'string') {
        return await ctx.runTask(ctx.fetch({ url: urlOrData, headers: [['Range', `bytes=${range.offset}-${range.offset + range.size - 1}`]], type: 'binary' }));
    }
    else {
        return urlOrData.slice(range.offset, range.offset + range.size);
    }
}
