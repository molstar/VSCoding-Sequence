"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveJob = resolveJob;
exports.abortingObserver = abortingObserver;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const cif_1 = require("../../../mol-io/writer/cif");
const structure_1 = require("../../../mol-model/structure");
const mmcif_1 = require("../../../mol-model/structure/export/mmcif");
const console_logger_1 = require("../../../mol-util/console-logger");
const now_1 = require("../../../mol-util/now");
const performance_monitor_1 = require("../../../mol-util/performance-monitor");
const config_1 = require("../config");
const property_provider_1 = require("../property-provider");
const version_1 = require("../version");
const structure_wrapper_1 = require("./structure-wrapper");
var CifField = cif_1.CifWriter.Field;
const string_1 = require("../../../mol-util/string");
const chem_comp_1 = require("../../../mol-model-formats/structure/property/bonds/chem_comp");
const sdf_1 = require("../../../mol-io/writer/sdf");
const mol_1 = require("../../../mol-io/writer/mol");
const mol2_1 = require("../../../mol-io/writer/mol2");
const encoder_1 = require("../../../mol-io/writer/mol/encoder");
const encoder_2 = require("../../../mol-io/writer/mol2/encoder");
const chem_comp_2 = require("../../../mol-model-formats/structure/property/atoms/chem_comp");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const global_transform_1 = require("../../../mol-model/structure/model/properties/global-transform");
const perf = new performance_monitor_1.PerformanceMonitor();
let _propertyProvider;
function propertyProvider() {
    if (_propertyProvider)
        return _propertyProvider;
    _propertyProvider = (0, property_provider_1.createModelPropertiesProviderFromConfig)() || (() => []);
    return _propertyProvider;
}
async function resolveJob(job) {
    if (job.responseFormat.tarball) {
        return resolveMultiFile(job);
    }
    else {
        return resolveSingleFile(job);
    }
}
const SharedParams = {
    encoderName: `ModelServer ${version_1.VERSION}`
};
const SharedLigandWritingParams = {
    ...SharedParams,
    hydrogens: true
};
function createEncoder(job) {
    switch (job.responseFormat.encoding) {
        case 'bcif':
            return cif_1.CifWriter.createEncoder({
                ...SharedParams,
                binary: true,
                binaryAutoClassifyEncoding: true
            });
        case 'sdf':
            ensureCompatibleQueryType(job);
            return sdf_1.SdfWriter.createEncoder({
                ...SharedLigandWritingParams
            });
        case 'mol':
            ensureCompatibleQueryType(job);
            return mol_1.MolWriter.createEncoder({
                ...SharedLigandWritingParams
            });
        case 'mol2':
            ensureCompatibleQueryType(job);
            return mol2_1.Mol2Writer.createEncoder({
                ...SharedLigandWritingParams
            });
        default:
            return cif_1.CifWriter.createEncoder({
                ...SharedParams,
                binary: false,
                binaryAutoClassifyEncoding: true
            });
    }
}
function ensureCompatibleQueryType(job) {
    job.entries.forEach(e => {
        if (e.queryDefinition.niceName !== 'Ligand') {
            throw Error("sdf, mol and mol2 encoding are only available for queries of type 'Ligand'");
        }
    });
}
async function resolveSingleFile(job) {
    console_logger_1.ConsoleLogger.logId(job.id, 'Query', `Starting (format: ${job.responseFormat.encoding}).`);
    const encoder = createEncoder(job);
    const headerMap = new Map();
    for (const entry of job.entries) {
        let hasDataBlock = false;
        try {
            const structure = await (0, structure_wrapper_1.createStructureWrapperFromJobEntry)(entry, propertyProvider());
            let header = structure.cifFrame.header.toUpperCase();
            if (headerMap.has(header)) {
                const i = headerMap.get(header) + 1;
                headerMap.set(header, i);
                header += ' ' + i;
            }
            else {
                headerMap.set(header, 0);
            }
            encoder.startDataBlock(header);
            hasDataBlock = true;
            await resolveJobEntry(entry, structure, encoder);
        }
        catch (e) {
            if (job.entries.length === 1) {
                throw e;
            }
            else {
                if (!hasDataBlock) {
                    createErrorDataBlock(entry, encoder);
                }
                doError(entry, encoder, e);
                console_logger_1.ConsoleLogger.errorId(entry.job.id, '' + e);
            }
        }
    }
    console_logger_1.ConsoleLogger.logId(job.id, 'Query', 'Encoding.');
    encoder.encode();
    encoder.writeTo(job.writer);
}
function getFilename(i, entry, header, encoding) {
    return `${i}_${header.toLowerCase()}_${(0, string_1.splitCamelCase)(entry.queryDefinition.name.replace(/\s/g, '_'), '-').toLowerCase()}.${encoding}`;
}
async function resolveMultiFile(job) {
    console_logger_1.ConsoleLogger.logId(job.id, 'Query', 'Starting.');
    let i = 0;
    for (const entry of job.entries) {
        const encoder = createEncoder(job);
        let hasDataBlock = false;
        let header = '';
        try {
            const structure = await (0, structure_wrapper_1.createStructureWrapperFromJobEntry)(entry, propertyProvider());
            header = structure.cifFrame.header;
            encoder.startDataBlock(structure.cifFrame.header);
            hasDataBlock = true;
            await resolveJobEntry(entry, structure, encoder);
        }
        catch (e) {
            if (!hasDataBlock) {
                header = createErrorDataBlock(entry, encoder);
            }
            console_logger_1.ConsoleLogger.errorId(entry.job.id, '' + e);
            doError(entry, encoder, e);
        }
        console_logger_1.ConsoleLogger.logId(job.id, 'Query', `Encoding ${entry.key}/${entry.queryDefinition.name}`);
        encoder.encode();
        job.writer.beginEntry(getFilename(++i, entry, header, job.responseFormat.encoding), encoder.getSize());
        encoder.writeTo(job.writer);
        job.writer.endEntry();
        console_logger_1.ConsoleLogger.logId(job.id, 'Query', `Written ${entry.key}/${entry.queryDefinition.name}`);
        // await fileEntry;
    }
}
function createErrorDataBlock(job, encoder) {
    let header;
    if (job.sourceId === '_local_')
        header = path.basename(job.entryId).replace(/[^a-z0-9\-]/gi, '').toUpperCase();
    else
        header = job.entryId.replace(/[^a-z0-9\-]/gi, '').toUpperCase();
    encoder.startDataBlock(header);
    return header;
}
async function resolveJobEntry(entry, structure, encoder) {
    console_logger_1.ConsoleLogger.logId(entry.job.id, 'Query', `Start ${entry.key}/${entry.queryDefinition.name}.`);
    try {
        perf.start('query');
        const sourceStructures = await (0, structure_wrapper_1.resolveStructures)(structure, entry.modelNums);
        if (!sourceStructures.length)
            throw new Error('Model not available');
        let structures = sourceStructures;
        if (entry.queryDefinition.structureTransform) {
            structures = [];
            for (const s of sourceStructures) {
                structures.push(await entry.queryDefinition.structureTransform(entry.normalizedParams, s));
            }
        }
        const modelNums = entry.modelNums || structure.models.map(m => m.modelNum);
        const queries = structures.map(s => entry.queryDefinition.query(entry.normalizedParams, s, modelNums));
        const result = [];
        for (let i = 0; i < structures.length; i++) {
            const s = structure_1.StructureSelection.unionStructure(structure_1.StructureQuery.run(queries[i], structures[i], { timeoutMs: config_1.ModelServerConfig.queryTimeoutMs }));
            if (s.elementCount > 0) {
                if (!entry.transform || linear_algebra_1.Mat4.isIdentity(entry.transform)) {
                    result.push(s);
                }
                else {
                    result.push(structure_1.Structure.transform(s, entry.transform));
                }
            }
        }
        perf.end('query');
        console_logger_1.ConsoleLogger.logId(entry.job.id, 'Query', `Queried ${entry.key}/${entry.queryDefinition.name}.`);
        perf.start('encode');
        encoder.binaryEncodingProvider = getEncodingProvider(structure);
        // TODO: this actually needs to "reversible" in case of error.
        encoder.writeCategory(_model_server_result, entry);
        encoder.writeCategory(_model_server_params, entry);
        if (entry.queryDefinition.niceName === 'Ligand') {
            if (encoder instanceof encoder_1.MolEncoder || encoder instanceof encoder_2.Mol2Encoder) {
                encoder.setComponentAtomData(chem_comp_2.ComponentAtom.Provider.get(structure.models[0]));
                encoder.setComponentBondData(chem_comp_1.ComponentBond.Provider.get(structure.models[0]));
            }
        }
        // TODO propagate data for cif/bcif as well?
        if (!entry.copyAllCategories && entry.queryDefinition.filter)
            encoder.setFilter(entry.queryDefinition.filter);
        if (result.length > 0)
            (0, mmcif_1.encode_mmCIF_categories)(encoder, result, { copyAllCategories: entry.copyAllCategories });
        else
            console_logger_1.ConsoleLogger.logId(entry.job.id, 'Warning', `Empty result for Query ${entry.key}/${entry.queryDefinition.name}`);
        if (entry.transform && !linear_algebra_1.Mat4.isIdentity(entry.transform))
            global_transform_1.GlobalModelTransformInfo.writeMmCif(encoder, entry.transform);
        if (!entry.copyAllCategories && entry.queryDefinition.filter)
            encoder.setFilter();
        perf.end('encode');
        const stats = {
            structure: structure,
            queryTimeMs: perf.time('query'),
            encodeTimeMs: perf.time('encode'),
            resultSize: result.reduce((n, s) => n + s.elementCount, 0)
        };
        encoder.writeCategory(_model_server_stats, stats);
        console_logger_1.ConsoleLogger.logId(entry.job.id, 'Query', `Written ${entry.key}/${entry.queryDefinition.name}.`);
        return encoder;
    }
    catch (e) {
        console_logger_1.ConsoleLogger.errorId(entry.job.id, e);
        doError(entry, encoder, e);
    }
    finally {
        encoder.binaryEncodingProvider = void 0;
    }
}
function getEncodingProvider(structure) {
    if (!structure.isBinary)
        return void 0;
    return cif_1.CifWriter.createEncodingProviderFromCifFrame(structure.cifFrame);
}
function doError(entry, encoder, e) {
    encoder.writeCategory(_model_server_result, entry);
    encoder.writeCategory(_model_server_params, entry);
    encoder.writeCategory(_model_server_error, '' + e);
}
const maxTime = config_1.ModelServerConfig.queryTimeoutMs;
function abortingObserver(p) {
    if ((0, now_1.now)() - p.root.progress.startedTime > maxTime) {
        p.requestAbort(`Exceeded maximum allowed time for a query (${maxTime}ms)`);
    }
}
function string(name, str, isSpecified) {
    if (isSpecified) {
        return CifField.str(name, (i, d) => str(d, i), { valueKind: (i, d) => isSpecified(d) ? 0 /* Column.ValueKinds.Present */ : 1 /* Column.ValueKinds.NotPresent */ });
    }
    return CifField.str(name, (i, d) => str(d, i));
}
function int32(name, value) {
    return CifField.int(name, (i, d) => value(d));
}
const _model_server_result_fields = [
    string('job_id', ctx => '' + ctx.job.id),
    string('datetime_utc', ctx => ctx.job.datetime_utc),
    string('server_version', ctx => version_1.VERSION),
    string('query_name', ctx => ctx.queryDefinition.name),
    string('source_id', ctx => ctx.sourceId),
    string('entry_id', ctx => ctx.entryId),
];
const _model_server_params_fields = [
    string('name', (ctx, i) => ctx[i][0]),
    string('value', (ctx, i) => ctx[i][1])
];
const _model_server_error_fields = [
    string('message', (ctx, i) => ctx)
];
const _model_server_stats_fields = [
    int32('io_time_ms', ctx => ctx.structure.info.readTime | 0),
    int32('parse_time_ms', ctx => ctx.structure.info.parseTime | 0),
    // int32<Stats>('attach_props_time_ms', ctx => ctx.structure.info.attachPropsTime | 0),
    int32('create_model_time_ms', ctx => ctx.structure.info.createModelTime | 0),
    int32('query_time_ms', ctx => ctx.queryTimeMs | 0),
    int32('encode_time_ms', ctx => ctx.encodeTimeMs | 0),
    int32('element_count', ctx => ctx.resultSize | 0),
];
const _model_server_result = {
    name: 'model_server_result',
    instance: (job) => cif_1.CifWriter.categoryInstance(_model_server_result_fields, { data: job, rowCount: 1 })
};
const _model_server_error = {
    name: 'model_server_error',
    instance: (message) => cif_1.CifWriter.categoryInstance(_model_server_error_fields, { data: message, rowCount: 1 })
};
const _model_server_params = {
    name: 'model_server_params',
    instance(job) {
        const params = [];
        for (const k of Object.keys(job.normalizedParams)) {
            params.push([k, JSON.stringify(job.normalizedParams[k])]);
        }
        return cif_1.CifWriter.categoryInstance(_model_server_params_fields, { data: params, rowCount: params.length });
    }
};
const _model_server_stats = {
    name: 'model_server_stats',
    instance: (stats) => cif_1.CifWriter.categoryInstance(_model_server_stats_fields, { data: stats, rowCount: 1 })
};
