"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeHeader = encodeHeader;
exports.readHeader = readHeader;
const tslib_1 = require("tslib");
const Schema = tslib_1.__importStar(require("./binary-schema"));
var _schema;
(function (_schema) {
    const { array, obj, int, bool, float, str } = Schema;
    _schema.schema = obj([
        ['formatVersion', str],
        ['axisOrder', array(int)],
        ['origin', array(float)],
        ['dimensions', array(float)],
        ['spacegroup', obj([
                ['number', int],
                ['size', array(float)],
                ['angles', array(float)],
                ['isPeriodic', bool],
            ])],
        ['channels', array(str)],
        ['valueType', str],
        ['blockSize', int],
        ['sampling', array(obj([
                ['byteOffset', float],
                ['rate', int],
                ['valuesInfo', array(obj([
                        ['mean', float],
                        ['sigma', float],
                        ['min', float],
                        ['max', float]
                    ]))],
                ['sampleCount', array(int)]
            ]))]
    ]);
})(_schema || (_schema = {}));
const headerSchema = _schema.schema;
function encodeHeader(header) {
    return Schema.encode(headerSchema, header);
}
async function readHeader(file) {
    let { buffer } = await file.readBuffer(0, 4 * 4096);
    const headerSize = buffer.readInt32LE(0);
    if (headerSize > buffer.byteLength - 4) {
        buffer = (await file.readBuffer(0, headerSize + 4)).buffer;
    }
    const header = Schema.decode(headerSchema, buffer, 4);
    return { header, dataOffset: headerSize + 4 };
}
