"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeBlockLayer = writeBlockLayer;
const typed_array_1 = require("../../../mol-io/common/typed-array");
const simple_buffer_1 = require("../../../mol-io/common/simple-buffer");
/** Converts a layer to blocks and writes them to the output file. */
async function writeBlockLayer(ctx, sampling) {
    const nU = Math.ceil(sampling.sampleCount[0] / ctx.blockSize);
    const nV = Math.ceil(sampling.sampleCount[1] / ctx.blockSize);
    const startOffset = ctx.dataByteOffset + sampling.byteOffset;
    for (let v = 0; v < nV; v++) {
        for (let u = 0; u < nU; u++) {
            const size = fillCubeBuffer(ctx, sampling, u, v);
            await ctx.file.writeBuffer(startOffset + sampling.writeByteOffset, ctx.litteEndianCubeBuffer, size);
            sampling.writeByteOffset += size;
            updateProgress(ctx.progress, 1);
        }
    }
    sampling.blocks.slicesWritten = 0;
}
/** Fill a cube at position (u,v) with values from each of the channel */
function fillCubeBuffer(ctx, sampling, u, v) {
    const { blockSize, cubeBuffer } = ctx;
    const { sampleCount } = sampling;
    const { buffers, slicesWritten } = sampling.blocks;
    const elementSize = (0, typed_array_1.getElementByteSize)(ctx.valueType);
    const sizeH = sampleCount[0], sizeHK = sampleCount[0] * sampleCount[1];
    const offsetH = u * blockSize, offsetK = v * blockSize;
    const copyH = Math.min(blockSize, sampleCount[0] - offsetH) * elementSize, maxK = offsetK + Math.min(blockSize, sampleCount[1] - offsetK), maxL = slicesWritten;
    let writeOffset = 0;
    for (const src of buffers) {
        for (let l = 0; l < maxL; l++) {
            for (let k = offsetK; k < maxK; k++) {
                // copying the bytes direct is faster than using buffer.write* functions.
                const start = (l * sizeHK + k * sizeH + offsetH) * elementSize;
                src.copy(cubeBuffer, writeOffset, start, start + copyH);
                writeOffset += copyH;
            }
        }
    }
    // flip the byte order if needed.
    simple_buffer_1.SimpleBuffer.ensureLittleEndian(ctx.cubeBuffer, ctx.litteEndianCubeBuffer, writeOffset, elementSize, 0);
    return writeOffset;
}
function updateProgress(progress, progressDone) {
    const old = (100 * progress.current / progress.max).toFixed(0);
    progress.current += progressDone;
    const $new = (100 * progress.current / progress.max).toFixed(0);
    if (old !== $new) {
        process.stdout.write(`\rWriting data...    ${$new}%`);
    }
}
