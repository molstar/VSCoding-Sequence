"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ccp4Provider = void 0;
exports.readSlices = readSlices;
const parser_1 = require("../../../../mol-io/reader/ccp4/parser");
const ccp4_1 = require("../../../../mol-model-formats/volume/ccp4");
async function readHeader(name, file) {
    const { header: ccp4Header, littleEndian } = await (0, parser_1.readCcp4Header)(file);
    const header = {
        name,
        valueType: (0, parser_1.getCcp4ValueType)(ccp4Header),
        grid: [ccp4Header.NX, ccp4Header.NY, ccp4Header.NZ],
        axisOrder: [ccp4Header.MAPC, ccp4Header.MAPR, ccp4Header.MAPS].map(i => i - 1),
        extent: [ccp4Header.NC, ccp4Header.NR, ccp4Header.NS],
        origin: (0, ccp4_1.getCcp4Origin)(ccp4Header),
        spacegroupNumber: ccp4Header.ISPG,
        cellSize: [ccp4Header.xLength, ccp4Header.yLength, ccp4Header.zLength],
        cellAngles: [ccp4Header.alpha, ccp4Header.beta, ccp4Header.gamma],
        littleEndian,
        dataOffset: (0, parser_1.getCcp4DataOffset)(ccp4Header),
        originalHeader: ccp4Header
    };
    // "normalize" the grid axis order
    header.grid = [header.grid[header.axisOrder[0]], header.grid[header.axisOrder[1]], header.grid[header.axisOrder[2]]];
    return header;
}
async function readSlices(data) {
    const { slices, header } = data;
    if (slices.isFinished) {
        return;
    }
    const { extent, originalHeader } = header;
    const sliceSize = extent[0] * extent[1];
    const sliceByteOffset = slices.buffer.elementByteSize * sliceSize * slices.slicesRead;
    const sliceCount = Math.min(slices.sliceCapacity, extent[2] - slices.slicesRead);
    const sliceByteCount = slices.buffer.elementByteSize * sliceCount * sliceSize;
    await (0, parser_1.readCcp4Slices)(originalHeader, slices.buffer, data.file, header.dataOffset + sliceByteOffset, sliceByteCount, header.littleEndian);
    slices.slicesRead += sliceCount;
    slices.sliceCount = sliceCount;
    if (slices.slicesRead >= extent[2]) {
        slices.isFinished = true;
    }
}
exports.Ccp4Provider = { readHeader, readSlices };
