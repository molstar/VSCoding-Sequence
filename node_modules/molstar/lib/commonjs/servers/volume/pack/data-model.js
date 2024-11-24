"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHeader = createHeader;
exports.samplingBlockCount = samplingBlockCount;
const FORMAT_VERSION = '1.0.0';
function createHeader(ctx) {
    const header = ctx.channels[0].data.header;
    const grid = header.grid;
    function normalize(data) {
        return [data[0] / grid[0], data[1] / grid[1], data[2] / grid[2]];
    }
    return {
        formatVersion: FORMAT_VERSION,
        valueType: header.valueType,
        blockSize: ctx.blockSize,
        axisOrder: header.axisOrder,
        origin: normalize(header.origin),
        dimensions: normalize(header.extent),
        spacegroup: { number: header.spacegroupNumber, size: header.cellSize, angles: header.cellAngles, isPeriodic: ctx.isPeriodic },
        channels: ctx.channels.map(c => c.data.header.name),
        sampling: ctx.sampling.map(s => {
            const N = s.sampleCount[0] * s.sampleCount[1] * s.sampleCount[2];
            const valuesInfo = [];
            for (const { sum, sqSum, min, max } of s.valuesInfo) {
                const mean = sum / N;
                const sigma = Math.sqrt(Math.max(0, sqSum / N - mean * mean));
                valuesInfo.push({ mean, sigma, min, max });
            }
            return {
                byteOffset: s.byteOffset,
                rate: s.rate,
                valuesInfo,
                sampleCount: s.sampleCount,
            };
        })
    };
}
function samplingBlockCount(sampling, blockSize) {
    return sampling.sampleCount.map(c => Math.ceil(c / blockSize)).reduce((c, v) => c * v, 1);
}
