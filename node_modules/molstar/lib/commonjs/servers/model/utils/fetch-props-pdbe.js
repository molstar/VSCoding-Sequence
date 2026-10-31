"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const argparse = tslib_1.__importStar(require("argparse"));
const make_dir_1 = require("../../../mol-util/make-dir");
const now_1 = require("../../../mol-util/now");
const performance_monitor_1 = require("../../../mol-util/performance-monitor");
const cmdParser = new argparse.ArgumentParser({
    add_help: true,
    description: 'Download JSON data from PDBe API'
});
cmdParser.add_argument('--in', { help: 'Input folder', required: true });
cmdParser.add_argument('--out', { help: 'Output folder', required: true });
const cmdArgs = cmdParser.parse_args();
function getPDBid(name) {
    let idx = name.indexOf('_');
    if (idx < 0)
        idx = name.indexOf('.');
    return name.substr(0, idx).toLowerCase();
}
function findEntries() {
    const files = fs.readdirSync(cmdArgs.in);
    const cifTest = /\.cif$/;
    const groups = new Map();
    const keys = [];
    for (const f of files) {
        if (!cifTest.test(f))
            continue;
        const id = getPDBid(f);
        const groupId = `${id[1]}${id[2]}`;
        if (groups.has(groupId))
            groups.get(groupId).push(id);
        else {
            keys.push(groupId);
            groups.set(groupId, [id]);
        }
    }
    const ret = [];
    for (const key of keys) {
        ret.push({ key, entries: groups.get(key) });
    }
    return ret;
}
async function process() {
    const entries = findEntries();
    (0, make_dir_1.makeDir)(cmdArgs.out);
    const started = (0, now_1.now)();
    let prog = 0;
    for (const e of entries) {
        const ts = (0, now_1.now)();
        console.log(`${prog}/${entries.length} ${e.entries.length} entries.`);
        const data = Object.create(null);
        for (const ee of e.entries) {
            const query = await (0, node_fetch_1.default)(`https://www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry/${ee}`);
            try {
                if (query.status === 200)
                    data[ee] = (await query.json())[ee] || {};
                else
                    console.error(ee, query.status);
            }
            catch (e) {
                console.error(ee, '' + e);
            }
        }
        // const query = await fetch(`https://www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry`, { method: 'POST', body });
        // console.log(query.status);
        // const data = await query.text();
        fs.writeFileSync(path.join(cmdArgs.out, e.key + '.json'), JSON.stringify(data));
        const time = (0, now_1.now)() - started;
        console.log(`${++prog}/${entries.length} in ${performance_monitor_1.PerformanceMonitor.format(time)} (last ${performance_monitor_1.PerformanceMonitor.format((0, now_1.now)() - ts)}, avg ${performance_monitor_1.PerformanceMonitor.format(time / prog)})`);
    }
}
process();
