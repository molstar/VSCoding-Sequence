/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as DataFormat from '../../common/data-format';
import * as File from '../../common/file';
import * as Coords from '../algebra/coordinate';
import * as Box from '../algebra/box';
import { ConsoleLogger } from '../../../../mol-util/console-logger';
import { State } from '../state';
import { findUniqueBlocks } from './identify';
import { compose } from './compose';
import { encode } from './encode';
import { SpacegroupCell } from '../../../../mol-math/geometry';
import { Vec3 } from '../../../../mol-math/linear-algebra';
import { UUID } from '../../../../mol-util';
import { createTypedArray } from '../../../../mol-io/common/typed-array';
import { LimitsConfig } from '../../config';
import { fileHandleFromDescriptor } from '../../../common/file-handle';
export async function execute(params, outputProvider) {
    const start = getTime();
    State.pendingQueries++;
    const guid = UUID.create22();
    params.detail = Math.min(Math.max(0, params.detail | 0), LimitsConfig.maxOutputSizeInVoxelCountByPrecisionLevel.length - 1);
    ConsoleLogger.logId(guid, 'Info', `id=${params.sourceId},encoding=${params.asBinary ? 'binary' : 'text'},detail=${params.detail},${queryBoxToString(params.box)}`);
    let sourceFile;
    try {
        sourceFile = fileHandleFromDescriptor(await File.openRead(params.sourceFilename), params.sourceFilename);
        await _execute(sourceFile, params, guid, outputProvider);
        return true;
    }
    catch (e) {
        ConsoleLogger.errorId(guid, e);
        return false;
    }
    finally {
        if (sourceFile)
            sourceFile.close();
        ConsoleLogger.logId(guid, 'Time', `${Math.round(getTime() - start)}ms`);
        State.pendingQueries--;
    }
}
function getTime() {
    const t = process.hrtime();
    return t[0] * 1000 + t[1] / 1000000;
}
function blockDomain(domain, blockSize) {
    const delta = Coords.fractional(blockSize * domain.delta[0], blockSize * domain.delta[1], blockSize * domain.delta[2]);
    return Coords.domain('Block', {
        origin: domain.origin,
        dimensions: domain.dimensions,
        delta,
        sampleCount: Coords.sampleCounts(domain.dimensions, delta)
    });
}
function createSampling(header, index, dataOffset) {
    const sampling = header.sampling[index];
    const dataDomain = Coords.domain('Data', {
        origin: Coords.fractional(header.origin[0], header.origin[1], header.origin[2]),
        dimensions: Coords.fractional(header.dimensions[0], header.dimensions[1], header.dimensions[2]),
        delta: Coords.fractional(header.dimensions[0] / sampling.sampleCount[0], header.dimensions[1] / sampling.sampleCount[1], header.dimensions[2] / sampling.sampleCount[2]),
        sampleCount: sampling.sampleCount
    });
    return {
        index,
        rate: sampling.rate,
        byteOffset: sampling.byteOffset + dataOffset,
        dataDomain,
        blockDomain: blockDomain(dataDomain, header.blockSize)
    };
}
async function createDataContext(file) {
    const { header, dataOffset } = await DataFormat.readHeader(file);
    const origin = Coords.fractional(header.origin[0], header.origin[1], header.origin[2]);
    const dimensions = Coords.fractional(header.dimensions[0], header.dimensions[1], header.dimensions[2]);
    return {
        file,
        header,
        spacegroup: SpacegroupCell.create(header.spacegroup.number, Vec3.ofArray(header.spacegroup.size), Vec3.scale(Vec3.zero(), Vec3.ofArray(header.spacegroup.angles), Math.PI / 180)),
        dataBox: { a: origin, b: Coords.add(origin, dimensions) },
        sampling: header.sampling.map((s, i) => createSampling(header, i, dataOffset))
    };
}
function createQuerySampling(data, sampling, queryBox) {
    const fractionalBox = Box.gridToFractional(Box.expandGridBox(Box.fractionalToGrid(queryBox, sampling.dataDomain), 1));
    const blocks = findUniqueBlocks(data, sampling, fractionalBox);
    const ret = {
        sampling,
        fractionalBox,
        gridDomain: Box.fractionalToDomain(fractionalBox, 'Query', sampling.dataDomain.delta),
        blocks
    };
    return ret;
}
function pickSampling(data, queryBox, forcedLevel, precision) {
    if (forcedLevel > 0) {
        return createQuerySampling(data, data.sampling[Math.min(data.sampling.length, forcedLevel) - 1], queryBox);
    }
    const sizeLimit = LimitsConfig.maxOutputSizeInVoxelCountByPrecisionLevel[precision] || (2 * 1024 * 1024);
    for (const s of data.sampling) {
        const gridBox = Box.fractionalToGrid(queryBox, s.dataDomain);
        const approxSize = Box.volume(gridBox);
        if (approxSize <= sizeLimit) {
            const sampling = createQuerySampling(data, s, queryBox);
            if (sampling.blocks.length <= LimitsConfig.maxRequestBlockCount) {
                return sampling;
            }
        }
    }
    return createQuerySampling(data, data.sampling[data.sampling.length - 1], queryBox);
}
function emptyQueryContext(data, params, guid) {
    return { kind: 'Empty', guid, params, data };
}
function getQueryBox(data, queryBox) {
    switch (queryBox.kind) {
        case 'Cartesian': return Box.fractionalBoxReorderAxes(Box.cartesianToFractional(queryBox, data.spacegroup), data.header.axisOrder);
        case 'Fractional': return Box.fractionalBoxReorderAxes(queryBox, data.header.axisOrder);
        default: return data.dataBox;
    }
}
function allocateValues(domain, numChannels, valueType) {
    const values = [];
    for (let i = 0; i < numChannels; i++) {
        values[values.length] = createTypedArray(valueType, domain.sampleVolume);
    }
    return values;
}
function createQueryContext(data, params, guid) {
    const inputQueryBox = getQueryBox(data, params.box);
    let queryBox;
    if (!data.header.spacegroup.isPeriodic) {
        if (!Box.areIntersecting(data.dataBox, inputQueryBox)) {
            return emptyQueryContext(data, params, guid);
        }
        queryBox = Box.intersect(data.dataBox, inputQueryBox);
    }
    else {
        queryBox = inputQueryBox;
    }
    const dimensions = Box.dimensions(queryBox);
    if (dimensions.some(d => isNaN(d))) {
        throw new Error('The query box is not defined.');
    }
    if (dimensions[0] * dimensions[1] * dimensions[2] > LimitsConfig.maxFractionalBoxVolume) {
        throw new Error('The query box volume is too big.');
    }
    const samplingInfo = pickSampling(data, queryBox, params.forcedSamplingLevel !== void 0 ? params.forcedSamplingLevel : 0, params.detail);
    if (samplingInfo.blocks.length === 0)
        return emptyQueryContext(data, params, guid);
    return {
        kind: 'Data',
        guid,
        data,
        params,
        samplingInfo,
        values: allocateValues(samplingInfo.gridDomain, data.header.channels.length, data.header.valueType)
    };
}
async function _execute(file, params, guid, outputProvider) {
    let output = void 0;
    try {
        // Step 1a: Create data context
        const data = await createDataContext(file);
        // Step 1b: Create query context
        const query = createQueryContext(data, params, guid);
        if (query.kind === 'Data') {
            // Step 3b: Compose the result data
            await compose(query);
        }
        // Step 4: Encode the result
        output = outputProvider();
        encode(query, output);
        output.end();
    }
    catch (e) {
        const query = { kind: 'Error', guid, params, message: `${e}` };
        try {
            if (!output)
                output = outputProvider();
            encode(query, output);
        }
        catch (f) {
            throw f;
        }
        throw e;
    }
    finally {
        if (output)
            output.end();
    }
}
function roundCoord(c) {
    return Math.round(100000 * c) / 100000;
}
function queryBoxToString(queryBox) {
    switch (queryBox.kind) {
        case 'Cartesian':
        case 'Fractional':
            const { a, b } = queryBox;
            const r = roundCoord;
            return `box-type=${queryBox.kind},box-a=(${r(a[0])},${r(a[1])},${r(a[2])}),box-b=(${r(b[0])},${r(b[1])},${r(b[2])})`;
        default:
            return `box-type=${queryBox.kind}`;
    }
}
