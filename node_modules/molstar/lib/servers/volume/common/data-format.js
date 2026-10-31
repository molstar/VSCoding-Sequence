/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as Schema from './binary-schema';
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
export function encodeHeader(header) {
    return Schema.encode(headerSchema, header);
}
export async function readHeader(file) {
    let { buffer } = await file.readBuffer(0, 4 * 4096);
    const headerSize = buffer.readInt32LE(0);
    if (headerSize > buffer.byteLength - 4) {
        buffer = (await file.readBuffer(0, headerSize + 4)).buffer;
    }
    const header = Schema.decode(headerSchema, buffer, 4);
    return { header, dataOffset: headerSize + 4 };
}
