"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dsn6Provider = void 0;
exports.readSlices = readSlices;
const parser_1 = require("../../../../mol-io/reader/dsn6/parser");
const typed_array_1 = require("../../../../mol-io/common/typed-array");
async function readHeader(name, file) {
    const { header: dsn6Header, littleEndian } = await (0, parser_1.readDsn6Header)(file);
    const header = {
        name,
        valueType: typed_array_1.TypedArrayValueType.Float32,
        grid: [dsn6Header.xRate, dsn6Header.yRate, dsn6Header.zRate].reverse(),
        axisOrder: [0, 1, 2].reverse(),
        extent: [dsn6Header.xExtent, dsn6Header.yExtent, dsn6Header.zExtent].reverse(),
        origin: [dsn6Header.xStart, dsn6Header.yStart, dsn6Header.zStart].reverse(),
        spacegroupNumber: 1, // set as P 1, since it is not available in DSN6 files
        cellSize: [dsn6Header.xlen, dsn6Header.ylen, dsn6Header.zlen],
        cellAngles: [dsn6Header.alpha, dsn6Header.beta, dsn6Header.gamma],
        littleEndian,
        dataOffset: parser_1.dsn6HeaderSize,
        originalHeader: dsn6Header
    };
    return header;
}
async function readSlices(data) {
    // TODO due to the dsn6 data layout we the read file into one big buffer
    //      to avoid this, either change the sampling algoritm to work with this layout or
    //      read the data into a collection of buffers that can be access like one big buffer
    //      => for now not worth putting time in, for big files better use another file format
    const { slices, header, file } = data;
    if (slices.isFinished) {
        return;
    }
    const { extent, dataOffset, originalHeader } = header;
    const sliceCount = extent[2];
    const { byteCount } = (0, parser_1.getDsn6Counts)(originalHeader);
    if (byteCount > slices.maxBlockBytes) {
        throw new Error(`dsn6 file to large, can't read ${byteCount} bytes at once, increase block size or use another file format`);
    }
    const { buffer } = await file.readBuffer(dataOffset, byteCount);
    if (!(slices.values instanceof Float32Array)) {
        throw new Error(`dsn6 reader only supports Float32Array for output values`);
    }
    await (0, parser_1.parseDsn6Values)(originalHeader, buffer, slices.values, header.littleEndian);
    slices.slicesRead += sliceCount;
    slices.sliceCount = sliceCount;
    if (slices.slicesRead >= extent[2]) {
        slices.isFinished = true;
    }
}
exports.Dsn6Provider = { readHeader, readSlices };
