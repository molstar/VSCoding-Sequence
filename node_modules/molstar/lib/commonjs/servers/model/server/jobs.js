"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobManager = void 0;
exports.JobEntry = JobEntry;
exports.createJob = createJob;
const mol_util_1 = require("../../../mol-util");
const api_1 = require("./api");
const generic_1 = require("../../../mol-data/generic");
function JobEntry(definition) {
    const queryDefinition = (0, api_1.getQueryByName)(definition.queryName);
    if (!queryDefinition)
        throw new Error(`Query '${definition.queryName}' is not supported.`);
    const normalizedParams = definition.queryParams;
    const sourceId = definition.sourceId || '_local_';
    return {
        job: void 0,
        key: `${sourceId}/${definition.entryId}`,
        sourceId,
        entryId: definition.entryId,
        queryDefinition,
        normalizedParams,
        modelNums: definition.modelNums,
        copyAllCategories: !!definition.copyAllCategories,
        transform: definition.transform
    };
}
function createJob(definition) {
    var _a, _b;
    const job = {
        id: mol_util_1.UUID.create22(),
        datetime_utc: `${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}`,
        entries: definition.entries,
        writer: definition.writer,
        responseFormat: {
            tarball: !!((_a = definition === null || definition === void 0 ? void 0 : definition.options) === null || _a === void 0 ? void 0 : _a.tarball),
            encoding: ((_b = definition === null || definition === void 0 ? void 0 : definition.options) === null || _b === void 0 ? void 0 : _b.encoding) ? definition.options.encoding : !!(definition.options && definition.options.binary) ? 'bcif' : 'cif'
        },
        outputFilename: definition.options && definition.options.outputFilename
    };
    definition.entries.forEach(e => e.job = job);
    return job;
}
class _JobQueue {
    constructor() {
        this.list = (0, generic_1.LinkedList)();
    }
    get size() {
        return this.list.count;
    }
    add(definition) {
        const job = createJob(definition);
        this.list.addLast(job);
        return job.id;
    }
    hasNext() {
        return this.list.count > 0;
    }
    getNext() {
        return this.list.removeFirst();
    }
    /** Sort the job list by key = sourceId/entryId */
    sort() {
        if (this.list.count === 0)
            return;
        const jobs = [];
        for (let j = this.list.first; !!j; j = j.next) {
            jobs[jobs.length] = j.value;
        }
        jobs.sort((a, b) => { var _a, _b; return ((_a = a.entries[0]) === null || _a === void 0 ? void 0 : _a.key) < ((_b = b.entries[0]) === null || _b === void 0 ? void 0 : _b.key) ? -1 : 1; });
        this.list = (0, generic_1.LinkedList)();
        for (const j of jobs) {
            this.list.addLast(j);
        }
    }
}
exports.JobManager = new _JobQueue();
