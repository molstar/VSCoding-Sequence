"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMaster = runMaster;
exports.runChild = runChild;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const cluster_1 = tslib_1.__importDefault(require("cluster"));
const now_1 = require("../../../mol-util/now");
const performance_monitor_1 = require("../../../mol-util/performance-monitor");
const preprocess_1 = require("./preprocess");
const property_provider_1 = require("../property-provider");
function runMaster(config, entries) {
    const started = (0, now_1.now)();
    let progress = 0;
    const onMessage = (msg) => {
        if (msg.type === 'tick') {
            progress++;
            const elapsed = (0, now_1.now)() - started;
            console.log(`[${progress}/${entries.length}] in ${performance_monitor_1.PerformanceMonitor.format(elapsed)} (avg ${performance_monitor_1.PerformanceMonitor.format(elapsed / progress)}).`);
        }
        else if (msg.type === 'error') {
            console.error(`${msg.id}: ${msg.error}`);
        }
    };
    if (entries.length === 1) {
        runSingle(entries[0], config, onMessage);
    }
    else {
        const parts = partitionArray(entries, config.numProcesses || 1);
        for (const _ of parts) {
            const worker = cluster_1.default.fork();
            worker.on('message', onMessage);
        }
        let i = 0;
        for (const id in cluster_1.default.workers) {
            cluster_1.default.workers[id].send({ entries: parts[i++], config });
        }
    }
}
function runChild() {
    process.on('message', async ({ entries, config }) => {
        const props = (0, property_provider_1.createModelPropertiesProvider)(config.customProperties);
        for (const entry of entries) {
            try {
                await (0, preprocess_1.preprocessFile)(entry.source, props, entry.cif, entry.bcif);
            }
            catch (e) {
                process.send({ type: 'error', id: path.parse(entry.source).name, error: '' + e });
            }
            process.send({ type: 'tick' });
        }
        process.exit();
    });
}
async function runSingle(entry, config, onMessage) {
    const props = (0, property_provider_1.createModelPropertiesProvider)(config.customProperties);
    try {
        await (0, preprocess_1.preprocessFile)(entry.source, props, entry.cif, entry.bcif);
    }
    catch (e) {
        onMessage({ type: 'error', id: path.parse(entry.source).name, error: '' + e });
    }
    onMessage({ type: 'tick' });
}
function partitionArray(xs, count) {
    const ret = [];
    const s = Math.ceil(xs.length / count);
    for (let i = 0; i < xs.length; i += s) {
        const bucket = [];
        for (let j = i, _j = Math.min(xs.length, i + s); j < _j; j++) {
            bucket.push(xs[j]);
        }
        ret.push(bucket);
    }
    return ret;
}
