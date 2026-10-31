/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure } from '../../../mol-model/structure';
import { PerformanceMonitor } from '../../../mol-util/performance-monitor';
import { Cache } from './cache';
import { ModelServerConfig as Config, mapSourceAndIdToFilename } from '../config';
import { CIF } from '../../../mol-io/reader/cif';
import * as util from 'util';
import * as fs from 'fs';
import * as zlib from 'zlib';
import { ConsoleLogger } from '../../../mol-util/console-logger';
import { trajectoryFromMmCIF } from '../../../mol-model-formats/structure/mmcif';
import { fetchRetry } from '../utils/fetch-retry';
import { Task } from '../../../mol-task';
require('util.promisify').shim();
export var StructureSourceType;
(function (StructureSourceType) {
    StructureSourceType[StructureSourceType["File"] = 0] = "File";
    StructureSourceType[StructureSourceType["Cache"] = 1] = "Cache";
})(StructureSourceType || (StructureSourceType = {}));
export async function createStructureWrapperFromJobEntry(entry, propertyProvider, allowCache = true) {
    if (allowCache && Config.cacheMaxSizeInBytes > 0) {
        const ret = StructureCache.get(entry.key);
        if (ret)
            return ret;
    }
    const ret = await readStructureWrapper(entry.key, entry.sourceId, entry.entryId, entry.job.id, propertyProvider);
    if (allowCache && Config.cacheMaxSizeInBytes > 0) {
        StructureCache.add(ret);
    }
    return ret;
}
export const StructureCache = new Cache(s => s.key, s => s.approximateSize);
const perf = new PerformanceMonitor();
const readFileAsync = util.promisify(fs.readFile);
const unzipAsync = util.promisify(zlib.unzip);
async function readFile(filename) {
    const isGz = /\.gz$/i.test(filename);
    if (filename.match(/\.bcif/)) {
        let input = await readFileAsync(filename);
        if (isGz)
            input = await unzipAsync(input);
        const data = new Uint8Array(input.byteLength);
        for (let i = 0; i < input.byteLength; i++)
            data[i] = input[i];
        return { data, isBinary: true };
    }
    else {
        if (isGz) {
            const data = await unzipAsync(await readFileAsync(filename));
            return { data: data.toString('utf8'), isBinary: false };
        }
        return { data: await readFileAsync(filename, 'utf8'), isBinary: false };
    }
}
async function parseCif(data) {
    const comp = CIF.parse(data);
    const parsed = await comp.run();
    if (parsed.isError)
        throw parsed;
    return parsed.result;
}
export async function readDataAndFrame(filename, key) {
    perf.start('read');
    let data, isBinary;
    try {
        const read = await readFile(filename);
        data = read.data;
        isBinary = read.isBinary;
    }
    catch (e) {
        ConsoleLogger.error(key || filename, '' + e);
        throw new Error(`Could not read the file for '${key || filename}' from disk.`);
    }
    perf.end('read');
    perf.start('parse');
    const frame = (await parseCif(data)).blocks[0];
    perf.end('parse');
    return { data, frame, isBinary };
}
async function fetchDataAndFrame(jobId, uri, format, key) {
    perf.start('read');
    const isBinary = format.startsWith('bcif');
    let data;
    try {
        ConsoleLogger.logId(jobId, 'Fetch', `${uri}`);
        const response = await fetchRetry(uri, 500, 3, () => ConsoleLogger.logId(jobId, 'Fetch', `Retrying to fetch '${uri}'`));
        if (format.endsWith('.gz')) {
            const input = await unzipAsync(await response.arrayBuffer());
            if (isBinary) {
                data = new Uint8Array(input.byteLength);
                for (let i = 0; i < input.byteLength; i++)
                    data[i] = input[i];
            }
            else {
                data = input.toString('utf8');
            }
        }
        else {
            data = isBinary ? new Uint8Array(await response.arrayBuffer()) : await response.text();
        }
    }
    catch (e) {
        ConsoleLogger.error(key || uri, '' + e);
        throw new Error(`Could not fetch the file for '${key || uri}'.`);
    }
    perf.end('read');
    perf.start('parse');
    const frame = (await parseCif(data)).blocks[0];
    perf.end('parse');
    return { data, frame, isBinary };
}
function readOrFetch(jobId, key, sourceId, entryId) {
    const mapped = sourceId === '_local_' ? [entryId] : mapSourceAndIdToFilename(sourceId, entryId);
    if (!mapped)
        throw new Error(`Cound not map '${key}' for a resource.`);
    const uri = mapped[0].toLowerCase();
    if (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('ftp://')) {
        return fetchDataAndFrame(jobId, mapped[0], (mapped[1] || 'cif').toLowerCase(), key);
    }
    if (!fs.existsSync(mapped[0]))
        throw new Error(`Could not find source file for '${key}'.`);
    return readDataAndFrame(mapped[0], key);
}
export async function readStructureWrapper(key, sourceId, entryId, jobId, propertyProvider) {
    const { data, frame, isBinary } = await readOrFetch(jobId || '', key, sourceId, entryId);
    perf.start('createModel');
    const trajectory = await trajectoryFromMmCIF(frame).run();
    perf.end('createModel');
    const models = [];
    const modelMap = new Map();
    for (let i = 0; i < trajectory.frameCount; i++) {
        const m = await Task.resolveInContext(trajectory.getFrameAtIndex(i));
        models.push(m);
        modelMap.set(m.modelNum, m);
    }
    const ret = {
        info: {
            sourceType: StructureSourceType.File,
            readTime: perf.time('read'),
            parseTime: perf.time('parse'),
            createModelTime: perf.time('createModel'),
            attachPropsTime: 0, // perf.time('attachProps'),
            sourceId,
            entryId
        },
        isBinary,
        key,
        approximateSize: typeof data === 'string' ? 2 * data.length : data.length,
        models,
        modelMap,
        structureModelMap: new Map(),
        cifFrame: frame,
        propertyProvider,
        cache: Object.create(null)
    };
    return ret;
}
export async function resolveStructure(wrapper, modelNum) {
    if (typeof modelNum === 'undefined')
        modelNum = wrapper.models[0].modelNum;
    if (wrapper.structureModelMap.has(modelNum))
        return wrapper.structureModelMap.get(modelNum);
    if (!wrapper.modelMap.has(modelNum)) {
        return void 0;
    }
    const model = wrapper.modelMap.get(modelNum);
    const structure = Structure.ofModel(model);
    if (wrapper.propertyProvider) {
        const modelProps = wrapper.propertyProvider(model, wrapper.cache);
        for (const p of modelProps) {
            await tryAttach(wrapper.key, p);
        }
    }
    return structure;
}
export async function resolveStructures(wrapper, modelNums) {
    const ret = [];
    for (const n of modelNums || wrapper.models.map(m => m.modelNum)) {
        const s = await resolveStructure(wrapper, n);
        if (s)
            ret.push(s);
    }
    return ret;
}
async function tryAttach(key, promise) {
    try {
        await promise;
    }
    catch (e) {
        ConsoleLogger.errorId(key, 'Custom prop:' + e);
    }
}
