/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { UUID } from '../../../mol-util';
import { getQueryByName } from './api';
import { LinkedList } from '../../../mol-data/generic';
export function JobEntry(definition) {
    const queryDefinition = getQueryByName(definition.queryName);
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
export function createJob(definition) {
    var _a, _b;
    const job = {
        id: UUID.create22(),
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
        this.list = LinkedList();
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
        this.list = LinkedList();
        for (const j of jobs) {
            this.list.addLast(j);
        }
    }
}
export const JobManager = new _JobQueue();
