"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runLocal = runLocal;
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const console_logger_1 = require("../../../mol-util/console-logger");
const now_1 = require("../../../mol-util/now");
const performance_monitor_1 = require("../../../mol-util/performance-monitor");
const writer_1 = require("../utils/writer");
const jobs_1 = require("./jobs");
const query_1 = require("./query");
const structure_wrapper_1 = require("./structure-wrapper");
async function runLocal(input) {
    if (!input.length) {
        console_logger_1.ConsoleLogger.error('Local', 'No input');
        return;
    }
    for (const job of input) {
        const binary = /\.bcif/.test(job.output);
        jobs_1.JobManager.add({
            entries: job.queries.map(q => {
                var _a;
                return (0, jobs_1.JobEntry)({
                    entryId: q.input,
                    queryName: q.query,
                    queryParams: q.params || {},
                    modelNums: q.modelNums,
                    transform: (_a = q.transform) !== null && _a !== void 0 ? _a : linear_algebra_1.Mat4.identity(),
                    copyAllCategories: !!q.copyAllCategories
                });
            }),
            writer: job.asTarGz
                ? new writer_1.TarballFileResultWriter(job.output, job.gzipLevel)
                : new writer_1.FileResultWriter(job.output),
            options: {
                outputFilename: job.output,
                binary,
                tarball: job.asTarGz
            }
        });
    }
    jobs_1.JobManager.sort();
    const started = (0, now_1.now)();
    let job = jobs_1.JobManager.getNext();
    let key = job.entries[0].key;
    let progress = 0;
    while (job) {
        try {
            await (0, query_1.resolveJob)(job);
            job.writer.end();
            console_logger_1.ConsoleLogger.logId(job.id, 'Query', 'Written.');
            if (job.entries.length > 0)
                structure_wrapper_1.StructureCache.expireAll();
            if (jobs_1.JobManager.hasNext()) {
                job = jobs_1.JobManager.getNext();
                if (key !== job.entries[0].key)
                    structure_wrapper_1.StructureCache.expire(key);
                key = job.entries[0].key;
            }
            else {
                break;
            }
        }
        catch (e) {
            console_logger_1.ConsoleLogger.errorId(job.id, e);
            if (jobs_1.JobManager.hasNext()) {
                job = jobs_1.JobManager.getNext();
                if (key !== job.entries[0].key)
                    structure_wrapper_1.StructureCache.expire(key);
                key = job.entries[0].key;
            }
            else {
                break;
            }
        }
        console_logger_1.ConsoleLogger.log('Progress', `[${++progress}/${input.length}] after ${performance_monitor_1.PerformanceMonitor.format((0, now_1.now)() - started)}.`);
    }
    console_logger_1.ConsoleLogger.log('Progress', `Done in ${performance_monitor_1.PerformanceMonitor.format((0, now_1.now)() - started)}.`);
    structure_wrapper_1.StructureCache.expireAll();
}
