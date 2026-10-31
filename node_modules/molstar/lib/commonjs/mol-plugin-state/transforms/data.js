"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Neli Fonseca <neli@ebi.ac.uk>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyVolume = exports.ParseJson = exports.ImportJson = exports.ImportString = exports.ParseDx = exports.ParseDsn6 = exports.ParseCcp4 = exports.ParsePly = exports.ParseTop = exports.ParsePrmtop = exports.ParsePsf = exports.ParseCube = exports.ParseCif = exports.ParseBlob = exports.ReadFile = exports.RawData = exports.DeflateData = exports.DownloadBlob = exports.Download = void 0;
const tslib_1 = require("tslib");
const CCP4 = tslib_1.__importStar(require("../../mol-io/reader/ccp4/parser"));
const cif_1 = require("../../mol-io/reader/cif");
const DSN6 = tslib_1.__importStar(require("../../mol-io/reader/dsn6/parser"));
const PLY = tslib_1.__importStar(require("../../mol-io/reader/ply/parser"));
const parser_1 = require("../../mol-io/reader/psf/parser");
const mol_state_1 = require("../../mol-state");
const mol_task_1 = require("../../mol-task");
const data_source_1 = require("../../mol-util/data-source");
const param_definition_1 = require("../../mol-util/param-definition");
const objects_1 = require("../objects");
const assets_1 = require("../../mol-util/assets");
const parser_2 = require("../../mol-io/reader/cube/parser");
const parser_3 = require("../../mol-io/reader/dx/parser");
const names_1 = require("../../mol-util/color/names");
const type_helpers_1 = require("../../mol-util/type-helpers");
const parser_4 = require("../../mol-io/reader/prmtop/parser");
const parser_5 = require("../../mol-io/reader/top/parser");
const zip_1 = require("../../mol-util/zip/zip");
const utf8_1 = require("../../mol-io/common/utf8");
const Download = objects_1.PluginStateTransform.BuiltIn({
    name: 'download',
    display: { name: 'Download', description: 'Download string or binary data from the specified URL' },
    from: [objects_1.PluginStateObject.Root],
    to: [objects_1.PluginStateObject.Data.String, objects_1.PluginStateObject.Data.Binary],
    params: {
        url: param_definition_1.ParamDefinition.Url('https://www.ebi.ac.uk/pdbe/static/entry/1cbs_updated.cif', { description: 'Resource URL. Must be the same domain or support CORS.' }),
        label: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text('')),
        isBinary: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Boolean(false, { description: 'If true, download data as binary (string otherwise)' }))
    }
})({
    apply({ params: p, cache }, plugin) {
        return mol_task_1.Task.create('Download', async (ctx) => {
            const url = assets_1.Asset.getUrlAsset(plugin.managers.asset, p.url);
            const asset = await plugin.managers.asset.resolve(url, p.isBinary ? 'binary' : 'string').runInContext(ctx);
            cache.asset = asset;
            return p.isBinary
                ? new objects_1.PluginStateObject.Data.Binary(asset.data, { label: p.label ? p.label : url.url })
                : new objects_1.PluginStateObject.Data.String(asset.data, { label: p.label ? p.label : url.url });
        });
    },
    dispose({ cache }) {
        var _a;
        (_a = cache === null || cache === void 0 ? void 0 : cache.asset) === null || _a === void 0 ? void 0 : _a.dispose();
    },
    update({ oldParams, newParams, b }) {
        if (oldParams.url !== newParams.url || oldParams.isBinary !== newParams.isBinary)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (oldParams.label !== newParams.label) {
            b.label = newParams.label || ((typeof newParams.url === 'string') ? newParams.url : newParams.url.url);
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        }
        return mol_state_1.StateTransformer.UpdateResult.Unchanged;
    }
});
exports.Download = Download;
const DownloadBlob = objects_1.PluginStateTransform.BuiltIn({
    name: 'download-blob',
    display: { name: 'Download Blob', description: 'Download multiple string or binary data from the specified URLs.' },
    from: objects_1.PluginStateObject.Root,
    to: objects_1.PluginStateObject.Data.Blob,
    params: {
        sources: param_definition_1.ParamDefinition.ObjectList({
            id: param_definition_1.ParamDefinition.Text('', { label: 'Unique ID' }),
            url: param_definition_1.ParamDefinition.Url('https://www.ebi.ac.uk/pdbe/static/entry/1cbs_updated.cif', { description: 'Resource URL. Must be the same domain or support CORS.' }),
            isBinary: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Boolean(false, { description: 'If true, download data as binary (string otherwise)' })),
            canFail: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Boolean(false, { description: 'Indicate whether the download can fail and not be included in the blob as a result.' }))
        }, e => `${e.id}: ${e.url}`),
        maxConcurrency: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Numeric(4, { min: 1, max: 12, step: 1 }, { description: 'The maximum number of concurrent downloads.' }))
    }
})({
    apply({ params, cache }, plugin) {
        return mol_task_1.Task.create('Download Blob', async (ctx) => {
            const entries = [];
            const data = await (0, data_source_1.ajaxGetMany)(ctx, plugin.managers.asset, params.sources, params.maxConcurrency || 4);
            const assets = [];
            for (let i = 0; i < data.length; i++) {
                const r = data[i], src = params.sources[i];
                if (r.kind === 'error')
                    plugin.log.warn(`Download ${r.id} (${src.url}) failed: ${r.error}`);
                else {
                    assets.push(r.result);
                    entries.push(src.isBinary
                        ? { id: r.id, kind: 'binary', data: r.result.data }
                        : { id: r.id, kind: 'string', data: r.result.data });
                }
            }
            cache.assets = assets;
            return new objects_1.PluginStateObject.Data.Blob(entries, { label: 'Data Blob', description: `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}` });
        });
    },
    dispose({ cache }, plugin) {
        const assets = cache === null || cache === void 0 ? void 0 : cache.assets;
        if (!assets)
            return;
        for (const a of assets) {
            a.dispose();
        }
    }
    // TODO: ??
    // update({ oldParams, newParams, b }) {
    //     return 0 as any;
    //     // if (oldParams.url !== newParams.url || oldParams.isBinary !== newParams.isBinary) return StateTransformer.UpdateResult.Recreate;
    //     // if (oldParams.label !== newParams.label) {
    //     //     (b.label as string) = newParams.label || newParams.url;
    //     //     return StateTransformer.UpdateResult.Updated;
    //     // }
    //     // return StateTransformer.UpdateResult.Unchanged;
    // }
});
exports.DownloadBlob = DownloadBlob;
const DeflateData = objects_1.PluginStateTransform.BuiltIn({
    name: 'defalate-data',
    display: { name: 'Deflate', description: 'Deflate compressed data' },
    params: {
        method: param_definition_1.ParamDefinition.Select('gzip', [['gzip', 'gzip']]), // later on we might have to add say brotli
        isString: param_definition_1.ParamDefinition.Boolean(false),
        stringEncoding: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Select('utf-8', [['utf-8', 'UTF8']])),
        label: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text(''))
    },
    from: [objects_1.PluginStateObject.Data.Binary],
    to: [objects_1.PluginStateObject.Data.Binary, objects_1.PluginStateObject.Data.String]
})({
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Gzip', async (ctx) => {
            const decompressedData = await (0, zip_1.ungzip)(ctx, a.data);
            const label = params.label ? params.label : a.label;
            // handle decoding based on stringEncoding param
            if (params.isString) {
                const textData = (0, utf8_1.utf8Read)(decompressedData, 0, decompressedData.length);
                return new objects_1.PluginStateObject.Data.String(textData, { label });
            }
            return new objects_1.PluginStateObject.Data.Binary(decompressedData, { label });
        });
    }
});
exports.DeflateData = DeflateData;
const RawData = objects_1.PluginStateTransform.BuiltIn({
    name: 'raw-data',
    display: { name: 'Raw Data', description: 'Raw data supplied by value.' },
    from: [objects_1.PluginStateObject.Root],
    to: [objects_1.PluginStateObject.Data.String, objects_1.PluginStateObject.Data.Binary],
    params: {
        data: param_definition_1.ParamDefinition.Value('', { isHidden: true }),
        label: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text(''))
    }
})({
    apply({ params: p }) {
        return mol_task_1.Task.create('Raw Data', async () => {
            if (typeof p.data === 'string') {
                return new objects_1.PluginStateObject.Data.String(p.data, { label: p.label ? p.label : 'String' });
            }
            else if (Array.isArray(p.data)) {
                return new objects_1.PluginStateObject.Data.Binary(new Uint8Array(p.data), { label: p.label ? p.label : 'Binary' });
            }
            else if (p.data instanceof ArrayBuffer) {
                return new objects_1.PluginStateObject.Data.Binary(new Uint8Array(p.data), { label: p.label ? p.label : 'Binary' });
            }
            else if (p.data instanceof Uint8Array) {
                return new objects_1.PluginStateObject.Data.Binary(p.data, { label: p.label ? p.label : 'Binary' });
            }
            else {
                (0, type_helpers_1.assertUnreachable)(p.data);
            }
        });
    },
    update({ oldParams, newParams, b }) {
        if (oldParams.data !== newParams.data)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (oldParams.label !== newParams.label) {
            b.label = newParams.label || b.label;
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        }
        return mol_state_1.StateTransformer.UpdateResult.Unchanged;
    },
    customSerialization: {
        toJSON(p) {
            if (typeof p.data === 'string' || Array.isArray(p.data)) {
                return p;
            }
            else if (p.data instanceof ArrayBuffer) {
                const v = new Uint8Array(p.data);
                const data = new Array(v.length);
                for (let i = 0, _i = v.length; i < _i; i++)
                    data[i] = v[i];
                return { data, label: p.label };
            }
            else if (p.data instanceof Uint8Array) {
                const data = new Array(p.data.length);
                for (let i = 0, _i = p.data.length; i < _i; i++)
                    data[i] = p.data[i];
                return { data, label: p.label };
            }
        },
        fromJSON(data) {
            return data;
        }
    }
});
exports.RawData = RawData;
const ReadFile = objects_1.PluginStateTransform.BuiltIn({
    name: 'read-file',
    display: { name: 'Read File', description: 'Read string or binary data from the specified file' },
    from: objects_1.PluginStateObject.Root,
    to: [objects_1.PluginStateObject.Data.String, objects_1.PluginStateObject.Data.Binary],
    params: {
        file: param_definition_1.ParamDefinition.File(),
        label: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text('')),
        isBinary: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Boolean(false, { description: 'If true, open file as as binary (string otherwise)' }))
    }
})({
    apply({ params: p, cache }, plugin) {
        return mol_task_1.Task.create('Open File', async (ctx) => {
            if (p.file === null) {
                plugin.log.error('No file(s) selected');
                return mol_state_1.StateObject.Null;
            }
            const asset = await plugin.managers.asset.resolve(p.file, p.isBinary ? 'binary' : 'string').runInContext(ctx);
            cache.asset = asset;
            const o = p.isBinary
                ? new objects_1.PluginStateObject.Data.Binary(asset.data, { label: p.label ? p.label : p.file.name })
                : new objects_1.PluginStateObject.Data.String(asset.data, { label: p.label ? p.label : p.file.name });
            return o;
        });
    },
    dispose({ cache }) {
        var _a;
        (_a = cache === null || cache === void 0 ? void 0 : cache.asset) === null || _a === void 0 ? void 0 : _a.dispose();
    },
    update({ oldParams, newParams, b }) {
        var _a;
        if (oldParams.label !== newParams.label) {
            b.label = newParams.label || ((_a = oldParams.file) === null || _a === void 0 ? void 0 : _a.name) || '';
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        }
        return mol_state_1.StateTransformer.UpdateResult.Unchanged;
    },
    isSerializable: () => ({ isSerializable: false, reason: 'Cannot serialize user loaded files.' })
});
exports.ReadFile = ReadFile;
const ParseBlob = objects_1.PluginStateTransform.BuiltIn({
    name: 'parse-blob',
    display: { name: 'Parse Blob', description: 'Parse multiple data enties' },
    from: objects_1.PluginStateObject.Data.Blob,
    to: objects_1.PluginStateObject.Format.Blob,
    params: {
        formats: param_definition_1.ParamDefinition.ObjectList({
            id: param_definition_1.ParamDefinition.Text('', { label: 'Unique ID' }),
            format: param_definition_1.ParamDefinition.Select('cif', [['cif', 'cif']])
        }, e => `${e.id}: ${e.format}`)
    }
})({
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Parse Blob', async (ctx) => {
            const map = new Map();
            for (const f of params.formats)
                map.set(f.id, f.format);
            const entries = [];
            for (const e of a.data) {
                if (!map.has(e.id))
                    continue;
                const parsed = await (e.kind === 'string' ? cif_1.CIF.parse(e.data) : cif_1.CIF.parseBinary(e.data)).runInContext(ctx);
                if (parsed.isError)
                    throw new Error(`${e.id}: ${parsed.message}`);
                entries.push({ id: e.id, kind: 'cif', data: parsed.result });
            }
            return new objects_1.PluginStateObject.Format.Blob(entries, { label: 'Format Blob', description: `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}` });
        });
    },
    // TODO: ??
    // update({ oldParams, newParams, b }) {
    //     return 0 as any;
    //     // if (oldParams.url !== newParams.url || oldParams.isBinary !== newParams.isBinary) return StateTransformer.UpdateResult.Recreate;
    //     // if (oldParams.label !== newParams.label) {
    //     //     (b.label as string) = newParams.label || newParams.url;
    //     //     return StateTransformer.UpdateResult.Updated;
    //     // }
    //     // return StateTransformer.UpdateResult.Unchanged;
    // }
});
exports.ParseBlob = ParseBlob;
const ParseCif = objects_1.PluginStateTransform.BuiltIn({
    name: 'parse-cif',
    display: { name: 'Parse CIF', description: 'Parse CIF from String or Binary data' },
    from: [objects_1.PluginStateObject.Data.String, objects_1.PluginStateObject.Data.Binary],
    to: objects_1.PluginStateObject.Format.Cif
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse CIF', async (ctx) => {
            const parsed = await (typeof a.data === 'string' ? cif_1.CIF.parse(a.data) : cif_1.CIF.parseBinary(a.data)).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            if (parsed.result.blocks.length === 0)
                return mol_state_1.StateObject.Null;
            return new objects_1.PluginStateObject.Format.Cif(parsed.result);
        });
    }
});
exports.ParseCif = ParseCif;
const ParseCube = objects_1.PluginStateTransform.BuiltIn({
    name: 'parse-cube',
    display: { name: 'Parse Cube', description: 'Parse Cube from String data' },
    from: objects_1.PluginStateObject.Data.String,
    to: objects_1.PluginStateObject.Format.Cube
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse Cube', async (ctx) => {
            const parsed = await (0, parser_2.parseCube)(a.data, a.label).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            return new objects_1.PluginStateObject.Format.Cube(parsed.result);
        });
    }
});
exports.ParseCube = ParseCube;
const ParsePsf = objects_1.PluginStateTransform.BuiltIn({
    name: 'parse-psf',
    display: { name: 'Parse PSF', description: 'Parse PSF from String data' },
    from: [objects_1.PluginStateObject.Data.String],
    to: objects_1.PluginStateObject.Format.Psf
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse PSF', async (ctx) => {
            const parsed = await (0, parser_1.parsePsf)(a.data).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            return new objects_1.PluginStateObject.Format.Psf(parsed.result);
        });
    }
});
exports.ParsePsf = ParsePsf;
const ParsePrmtop = objects_1.PluginStateTransform.BuiltIn({
    name: 'parse-prmtop',
    display: { name: 'Parse PRMTOP', description: 'Parse PRMTOP from String data' },
    from: [objects_1.PluginStateObject.Data.String],
    to: objects_1.PluginStateObject.Format.Prmtop
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse PRMTOP', async (ctx) => {
            const parsed = await (0, parser_4.parsePrmtop)(a.data).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            return new objects_1.PluginStateObject.Format.Prmtop(parsed.result);
        });
    }
});
exports.ParsePrmtop = ParsePrmtop;
const ParseTop = objects_1.PluginStateTransform.BuiltIn({
    name: 'parse-top',
    display: { name: 'Parse TOP', description: 'Parse TOP from String data' },
    from: [objects_1.PluginStateObject.Data.String],
    to: objects_1.PluginStateObject.Format.Top
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse TOP', async (ctx) => {
            const parsed = await (0, parser_5.parseTop)(a.data).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            return new objects_1.PluginStateObject.Format.Top(parsed.result);
        });
    }
});
exports.ParseTop = ParseTop;
const ParsePly = objects_1.PluginStateTransform.BuiltIn({
    name: 'parse-ply',
    display: { name: 'Parse PLY', description: 'Parse PLY from String data' },
    from: [objects_1.PluginStateObject.Data.String],
    to: objects_1.PluginStateObject.Format.Ply
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse PLY', async (ctx) => {
            const parsed = await PLY.parsePly(a.data).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            return new objects_1.PluginStateObject.Format.Ply(parsed.result, { label: parsed.result.comments[0] || 'PLY Data' });
        });
    }
});
exports.ParsePly = ParsePly;
const ParseCcp4 = objects_1.PluginStateTransform.BuiltIn({
    name: 'parse-ccp4',
    display: { name: 'Parse CCP4/MRC/MAP', description: 'Parse CCP4/MRC/MAP from Binary data' },
    from: [objects_1.PluginStateObject.Data.Binary],
    to: objects_1.PluginStateObject.Format.Ccp4
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse CCP4/MRC/MAP', async (ctx) => {
            const parsed = await CCP4.parse(a.data, a.label).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            return new objects_1.PluginStateObject.Format.Ccp4(parsed.result);
        });
    }
});
exports.ParseCcp4 = ParseCcp4;
const ParseDsn6 = objects_1.PluginStateTransform.BuiltIn({
    name: 'parse-dsn6',
    display: { name: 'Parse DSN6/BRIX', description: 'Parse CCP4/BRIX from Binary data' },
    from: [objects_1.PluginStateObject.Data.Binary],
    to: objects_1.PluginStateObject.Format.Dsn6
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse DSN6/BRIX', async (ctx) => {
            const parsed = await DSN6.parse(a.data, a.label).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            return new objects_1.PluginStateObject.Format.Dsn6(parsed.result);
        });
    }
});
exports.ParseDsn6 = ParseDsn6;
const ParseDx = objects_1.PluginStateTransform.BuiltIn({
    name: 'parse-dx',
    display: { name: 'Parse DX', description: 'Parse DX from Binary/String data' },
    from: [objects_1.PluginStateObject.Data.Binary, objects_1.PluginStateObject.Data.String],
    to: objects_1.PluginStateObject.Format.Dx
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse DX', async (ctx) => {
            const parsed = await (0, parser_3.parseDx)(a.data, a.label).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            return new objects_1.PluginStateObject.Format.Dx(parsed.result);
        });
    }
});
exports.ParseDx = ParseDx;
const ImportString = objects_1.PluginStateTransform.BuiltIn({
    name: 'import-string',
    display: { name: 'Import String', description: 'Import given data as a string' },
    from: objects_1.PluginStateObject.Root,
    to: objects_1.PluginStateObject.Data.String,
    params: {
        data: param_definition_1.ParamDefinition.Value(''),
        label: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text('')),
    }
})({
    apply({ params: { data, label } }) {
        return new objects_1.PluginStateObject.Data.String(data, { label: label || '' });
    },
    update({ oldParams, newParams, b }) {
        if (oldParams.data !== newParams.data)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (oldParams.label !== newParams.label) {
            b.label = newParams.label || '';
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        }
        return mol_state_1.StateTransformer.UpdateResult.Unchanged;
    },
    isSerializable: () => ({ isSerializable: false, reason: 'Cannot serialize user imported strings.' })
});
exports.ImportString = ImportString;
const ImportJson = objects_1.PluginStateTransform.BuiltIn({
    name: 'import-json',
    display: { name: 'Import JSON', description: 'Import given data as a JSON' },
    from: objects_1.PluginStateObject.Root,
    to: objects_1.PluginStateObject.Format.Json,
    params: {
        data: param_definition_1.ParamDefinition.Value({}),
        label: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text('')),
    }
})({
    apply({ params: { data, label } }) {
        return new objects_1.PluginStateObject.Format.Json(data, { label: label || '' });
    },
    update({ oldParams, newParams, b }) {
        if (oldParams.data !== newParams.data)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (oldParams.label !== newParams.label) {
            b.label = newParams.label || '';
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        }
        return mol_state_1.StateTransformer.UpdateResult.Unchanged;
    },
    isSerializable: () => ({ isSerializable: false, reason: 'Cannot serialize user imported JSON.' })
});
exports.ImportJson = ImportJson;
const ParseJson = objects_1.PluginStateTransform.BuiltIn({
    name: 'parse-json',
    display: { name: 'Parse JSON', description: 'Parse JSON from String data' },
    from: [objects_1.PluginStateObject.Data.String],
    to: objects_1.PluginStateObject.Format.Json
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse JSON', async (ctx) => {
            const json = await (new Response(a.data)).json(); // async JSON parsing via fetch API
            return new objects_1.PluginStateObject.Format.Json(json);
        });
    }
});
exports.ParseJson = ParseJson;
const LazyVolume = objects_1.PluginStateTransform.BuiltIn({
    name: 'lazy-volume',
    display: { name: 'Lazy Volume', description: 'A placeholder for lazy loaded volume representation' },
    from: objects_1.PluginStateObject.Root,
    to: objects_1.PluginStateObject.Volume.Lazy,
    params: {
        url: param_definition_1.ParamDefinition.Url(''),
        isBinary: param_definition_1.ParamDefinition.Boolean(false),
        format: param_definition_1.ParamDefinition.Text('ccp4'), // TODO: use Select based on available formats
        entryId: param_definition_1.ParamDefinition.Value('', { isHidden: true }),
        isovalues: param_definition_1.ParamDefinition.ObjectList({
            type: param_definition_1.ParamDefinition.Text('relative'), // TODO: Select
            value: param_definition_1.ParamDefinition.Numeric(0),
            color: param_definition_1.ParamDefinition.Color(names_1.ColorNames.black),
            alpha: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 1, step: 0.01 }),
            volumeIndex: param_definition_1.ParamDefinition.Numeric(0),
        }, e => `${e.type} ${e.value}`)
    }
})({
    apply({ a, params }) {
        return mol_task_1.Task.create('Lazy Volume', async (ctx) => {
            const entryId = Array.isArray(params.entryId) ? params.entryId.join(', ') : params.entryId;
            return new objects_1.PluginStateObject.Volume.Lazy(params, { label: `${entryId || params.url}`, description: 'Lazy Volume' });
        });
    }
});
exports.LazyVolume = LazyVolume;
