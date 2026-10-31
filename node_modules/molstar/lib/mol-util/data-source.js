/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 *
 * Adapted from LiteMol
 */
import { utf8Read } from '../mol-io/common/utf8';
import { Task } from '../mol-task';
import { Asset } from './assets';
import { File_ as File, RUNNING_IN_NODEJS, XMLHttpRequest_ as XMLHttpRequest } from './nodejs-shims';
import { ungzip, unzip } from './zip/zip';
export var DataCompressionMethod;
(function (DataCompressionMethod) {
    DataCompressionMethod[DataCompressionMethod["None"] = 0] = "None";
    DataCompressionMethod[DataCompressionMethod["Gzip"] = 1] = "Gzip";
    DataCompressionMethod[DataCompressionMethod["Zip"] = 2] = "Zip";
})(DataCompressionMethod || (DataCompressionMethod = {}));
export function readStringFromFile(file) {
    return readFromFileInternal(file, 'string');
}
export function readUint8ArrayFromFile(file) {
    return readFromFileInternal(file, 'binary');
}
export function readFromFile(file, type) {
    return readFromFileInternal(file, type);
}
export function ajaxGet(params) {
    if (typeof params === 'string')
        return ajaxGetInternal(params, params, 'string');
    return ajaxGetInternal(params.title, params.url, params.type || 'string', params.body, params.headers);
}
function isDone(data) {
    if (!RUNNING_IN_NODEJS && data instanceof FileReader) { // FileReader is not available in Node.js
        return data.readyState === FileReader.DONE;
    }
    else if (data instanceof XMLHttpRequest) {
        return data.readyState === XMLHttpRequest.DONE;
    }
    throw new Error('unknown data type');
}
function genericError(isDownload) {
    if (isDownload)
        return 'Failed to download data. Possible reasons: Resource is not available, or CORS is not allowed on the server.';
    return 'Failed to open file.';
}
function readData(ctx, action, data) {
    return new Promise((resolve, reject) => {
        // first check if data reading is already done
        if (isDone(data)) {
            const { error } = data;
            if (error !== null && error !== undefined) {
                reject(error !== null && error !== void 0 ? error : genericError(data instanceof XMLHttpRequest));
            }
            else {
                resolve(data);
            }
            return;
        }
        let hasError = false;
        data.onerror = (e) => {
            if (hasError)
                return;
            const { error } = e.target;
            reject(error !== null && error !== void 0 ? error : genericError(data instanceof XMLHttpRequest));
        };
        data.onprogress = (e) => {
            if (!ctx.shouldUpdate || hasError)
                return;
            try {
                if (e.lengthComputable) {
                    ctx.update({ message: action, isIndeterminate: false, current: e.loaded, max: e.total });
                }
                else {
                    ctx.update({ message: `${action} ${(e.loaded / 1024 / 1024).toFixed(2)} MB`, isIndeterminate: true });
                }
            }
            catch (e) {
                hasError = true;
                reject(e);
            }
        };
        data.onload = (e) => {
            resolve(data);
        };
    });
}
function getCompression(name) {
    return /\.gz$/i.test(name) ? DataCompressionMethod.Gzip :
        /\.zip$/i.test(name) ? DataCompressionMethod.Zip :
            DataCompressionMethod.None;
}
const reFilterPath = /^(__MACOSX|.DS_Store)/;
async function decompress(ctx, data, compression) {
    switch (compression) {
        case DataCompressionMethod.None: return data;
        case DataCompressionMethod.Gzip: return ungzip(ctx, data);
        case DataCompressionMethod.Zip:
            const parsed = await unzip(ctx, data.buffer);
            const names = Object.keys(parsed).filter(n => !reFilterPath.test(n));
            if (names.length !== 1)
                throw new Error('can only decompress zip files with a single entry');
            return parsed[names[0]];
    }
}
async function processFile(ctx, fileContent, type, compression) {
    let data = fileContent instanceof ArrayBuffer ? new Uint8Array(fileContent) : fileContent;
    if (data === null)
        throw new Error('no data given');
    if (compression !== DataCompressionMethod.None) {
        if (!(data instanceof Uint8Array))
            throw new Error('need Uint8Array for decompression');
        const decompressed = await decompress(ctx, data, compression);
        if (type === 'string') {
            await ctx.update({ message: 'Decoding text...' });
            data = utf8Read(decompressed, 0, decompressed.length);
        }
        else {
            data = decompressed;
        }
    }
    if (type === 'binary' && data instanceof Uint8Array) {
        return data;
    }
    else if (type === 'zip' && data instanceof Uint8Array) {
        return await unzip(ctx, data.buffer);
    }
    else if (type === 'string' && typeof data === 'string') {
        return data;
    }
    else if (type === 'xml' && typeof data === 'string') {
        const parser = new DOMParser();
        return parser.parseFromString(data, 'application/xml');
    }
    else if (type === 'json' && typeof data === 'string') {
        return JSON.parse(data);
    }
    throw new Error(`could not get requested response data '${type}'`);
}
function readFromFileInternal(file, type) {
    if (RUNNING_IN_NODEJS) {
        return readFromFileInternal_NodeJS(file, type);
    }
    let reader = void 0;
    return Task.create('Read File', async (ctx) => {
        try {
            reader = new FileReader();
            // unzipping for type 'zip' handled explicitly in `processFile`
            const compression = type === 'zip' ? DataCompressionMethod.None : getCompression(file.name);
            if (type === 'binary' || type === 'zip' || compression !== DataCompressionMethod.None) {
                reader.readAsArrayBuffer(file);
            }
            else {
                reader.readAsText(file);
            }
            await ctx.update({ message: 'Opening file...', canAbort: true });
            const fileReader = await readData(ctx, 'Reading...', reader);
            await ctx.update({ message: 'Processing file...', canAbort: false });
            return await processFile(ctx, fileReader.result, type, compression);
        }
        finally {
            reader = void 0;
        }
    }, () => {
        if (reader)
            reader.abort();
    });
}
function readFromFileInternal_NodeJS(file, type) {
    return Task.create('Read File', async (ctx) => {
        // unzipping for type 'zip' handled explicitly in `processFile`
        const compression = type === 'zip' ? DataCompressionMethod.None : getCompression(file.name);
        await ctx.update({ message: 'Opening file...', canAbort: false });
        let content;
        if (type === 'binary' || type === 'zip' || compression !== DataCompressionMethod.None) {
            content = await file.arrayBuffer();
        }
        else {
            content = await file.text();
        }
        await ctx.update({ message: 'Processing file...', canAbort: false });
        return await processFile(ctx, content, type, compression);
    });
}
class RequestPool {
    static get() {
        if (this.pool.length) {
            return this.pool.pop();
        }
        return new XMLHttpRequest();
    }
    static emptyFunc() { }
    static deposit(req) {
        if (this.pool.length < this.poolSize) {
            req.onabort = RequestPool.emptyFunc;
            req.onerror = RequestPool.emptyFunc;
            req.onload = RequestPool.emptyFunc;
            req.onprogress = RequestPool.emptyFunc;
            this.pool.push(req);
        }
    }
}
RequestPool.pool = [];
RequestPool.poolSize = 15;
function processAjax(req, type) {
    if (req.status >= 200 && req.status < 400) {
        const { response } = req;
        RequestPool.deposit(req);
        if ((type === 'binary' || type === 'zip') && response instanceof ArrayBuffer) {
            return new Uint8Array(response);
        }
        else if (type === 'string' && typeof response === 'string') {
            return response;
        }
        else if (type === 'xml' && response instanceof XMLDocument) {
            return response;
        }
        else if (type === 'json' && typeof response === 'object') {
            return response;
        }
        throw new Error(`could not get requested response data '${type}'`);
    }
    else {
        RequestPool.deposit(req);
        throw new Error(`Download failed with status code ${req.status}`);
    }
}
function getRequestResponseType(type) {
    switch (type) {
        case 'json': return 'json';
        case 'xml': return 'document';
        case 'string': return 'text';
        case 'binary': return 'arraybuffer';
        case 'zip': return 'arraybuffer';
    }
}
function ajaxGetInternal(title, url, type, body, headers) {
    if (RUNNING_IN_NODEJS && url.startsWith('file://')) {
        return ajaxGetInternal_file_NodeJS(title, url, type, body, headers);
    }
    let xhttp = void 0;
    return Task.create(title ? title : 'Download', async (ctx) => {
        xhttp = RequestPool.get();
        xhttp.open(body ? 'post' : 'get', url, true);
        if (headers) {
            for (const [name, value] of headers) {
                xhttp.setRequestHeader(name, value);
            }
        }
        xhttp.responseType = getRequestResponseType(type);
        xhttp.send(body);
        await ctx.update({ message: 'Waiting for server...', canAbort: true });
        const req = await readData(ctx, 'Downloading...', xhttp);
        xhttp = void 0; // guard against reuse, help garbage collector
        await ctx.update({ message: 'Parsing response...', canAbort: false });
        const result = processAjax(req, type);
        return result;
    }, () => {
        if (xhttp) {
            xhttp.abort();
            xhttp = void 0; // guard against reuse, help garbage collector
        }
    });
}
// NOTE: a workaround for using this in Node.js
let _fs = undefined;
function getFS() {
    if (!_fs) {
        throw new Error('When running in Node.js and reading from files, call mol-util/data-source\'s setFSModule function first.');
    }
    return _fs;
}
export function setFSModule(fs) {
    _fs = fs;
}
/** Alternative implementation of ajaxGetInternal (because xhr2 does not support file:// protocol) */
function ajaxGetInternal_file_NodeJS(title, url, type, body, headers) {
    if (!RUNNING_IN_NODEJS)
        throw new Error('This function should only be used when running in Node.js');
    if (!url.startsWith('file://'))
        throw new Error('This function is only for URLs with protocol file://');
    const filename = url.substring('file://'.length);
    const data = getFS().readFileSync(filename);
    const file = new File([data], 'raw-data');
    return readFromFile(file, type);
}
export async function ajaxGetMany(ctx, assetManager, sources, maxConcurrency) {
    const len = sources.length;
    const slots = new Array(sources.length);
    await ctx.update({ message: 'Downloading...', current: 0, max: len });
    let promises = [], promiseKeys = [];
    let currentSrc = 0;
    for (let _i = Math.min(len, maxConcurrency); currentSrc < _i; currentSrc++) {
        const current = sources[currentSrc];
        promises.push(wrapPromise(currentSrc, current.id, assetManager.resolve(Asset.getUrlAsset(assetManager, current.url), current.isBinary ? 'binary' : 'string').runAsChild(ctx)));
        promiseKeys.push(currentSrc);
    }
    let done = 0;
    while (promises.length > 0) {
        const r = await Promise.race(promises);
        const src = sources[r.index];
        const idx = promiseKeys.indexOf(r.index);
        done++;
        if (r.kind === 'error' && !src.canFail) {
            // TODO: cancel other downloads
            throw new Error(`${src.url}: ${r.error}`);
        }
        if (ctx.shouldUpdate) {
            await ctx.update({ message: 'Downloading...', current: done, max: len });
        }
        slots[r.index] = r;
        promises = promises.filter(_filterRemoveIndex, idx);
        promiseKeys = promiseKeys.filter(_filterRemoveIndex, idx);
        if (currentSrc < len) {
            const current = sources[currentSrc];
            const asset = assetManager.resolve(Asset.getUrlAsset(assetManager, current.url), current.isBinary ? 'binary' : 'string').runAsChild(ctx);
            promises.push(wrapPromise(currentSrc, current.id, asset));
            promiseKeys.push(currentSrc);
            currentSrc++;
        }
    }
    return slots;
}
function _filterRemoveIndex(_, i) {
    return this !== i;
}
async function wrapPromise(index, id, p) {
    try {
        const result = await p;
        return { kind: 'ok', result, index, id };
    }
    catch (error) {
        return { kind: 'error', error, index, id };
    }
}
