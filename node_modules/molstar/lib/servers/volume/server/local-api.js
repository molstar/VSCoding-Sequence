/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as Api from './api';
import * as Coordinate from './algebra/coordinate';
import * as fs from 'fs';
import * as path from 'path';
export async function run(jobs) {
    let progress = 0;
    const started = getTime();
    for (const job of jobs) {
        try {
            await query(job);
        }
        catch (e) {
            console.error(e);
        }
        progress++;
        const elapsed = (getTime() - started) / 1000;
        console.log(`[Progress] ${progress}/${jobs.length} in ${elapsed.toFixed(2)}s`);
    }
}
function getTime() {
    const t = process.hrtime();
    return t[0] * 1000 + t[1] / 1000000;
}
async function query(job) {
    var _a;
    let box;
    if (job.query.kind.toLocaleLowerCase() === 'cell') {
        box = { kind: 'Cell' };
    }
    else if (job.query.space === 'fractional') {
        box = {
            kind: 'Fractional',
            a: Coordinate.fractional(job.query.bottomLeft[0], job.query.bottomLeft[1], job.query.bottomLeft[2]),
            b: Coordinate.fractional(job.query.topRight[0], job.query.topRight[1], job.query.topRight[2]),
        };
    }
    else {
        box = {
            kind: 'Cartesian',
            a: Coordinate.cartesian(job.query.bottomLeft[0], job.query.bottomLeft[1], job.query.bottomLeft[2]),
            b: Coordinate.cartesian(job.query.topRight[0], job.query.topRight[1], job.query.topRight[2]),
        };
    }
    const params = {
        sourceFilename: job.source.filename,
        sourceId: job.source.id,
        asBinary: job.params.asBinary,
        box,
        detail: !job.params.detail ? 0 : job.params.detail,
        forcedSamplingLevel: job.params.forcedSamplingLevel
    };
    if (!fs.existsSync(job.outputFolder)) {
        makeDir(job.outputFolder);
    }
    const filename = path.join(job.outputFolder, (_a = job.outputFilename) !== null && _a !== void 0 ? _a : Api.getOutputFilename(job.source.name, job.source.id, params));
    const res = () => wrapFile(filename);
    await Api.queryBox(params, res);
}
function makeDir(path, root) {
    const dirs = path.split(/\/|\\/g), dir = dirs.shift();
    root = (root || '') + dir + '/';
    try {
        fs.mkdirSync(root);
    }
    catch (e) {
        if (!fs.statSync(root).isDirectory())
            throw new Error(e);
    }
    return !dirs.length || makeDir(dirs.join('/'), root);
}
function wrapFile(fn) {
    const w = {
        open() {
            if (this.opened)
                return;
            this.file = fs.openSync(fn, 'w');
            this.opened = true;
        },
        writeBinary(data) {
            this.open();
            fs.writeSync(this.file, Buffer.from(data));
            return true;
        },
        writeString(data) {
            this.open();
            fs.writeSync(this.file, data);
            return true;
        },
        end() {
            if (!this.opened || this.ended)
                return;
            fs.close(this.file, function () { });
            this.ended = true;
        },
        file: 0,
        ended: false,
        opened: false
    };
    return w;
}
