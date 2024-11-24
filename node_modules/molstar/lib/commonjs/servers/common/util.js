"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParam = getParam;
exports.healthCheck = healthCheck;
const fs_1 = require("fs");
const console_logger_1 = require("../../mol-util/console-logger");
function getParam(params, ...path) {
    try {
        let current = params;
        for (const p of path) {
            if (typeof current === 'undefined')
                return;
            current = current[p];
        }
        return current;
    }
    catch (e) {
        console_logger_1.ConsoleLogger.error('Config', `Unable to retrieve property ${path.join('.')} from ${JSON.stringify(params)}`);
    }
}
/**
 * Used to define a dedicated endpoint to monitor service health. Optionally checks whether source data from file system is readable.
 * @param res used to write response
 * @param paths array of file paths to check, may be empty
 */
async function healthCheck(res, paths) {
    if (paths.length === 0) {
        healthCheckResponse(res, true);
        return;
    }
    for (const path of paths) {
        try {
            // assert readable file
            await fs_1.promises.access(path, fs_1.constants.R_OK);
        }
        catch (e) {
            console_logger_1.ConsoleLogger.error(`Error accessing path ${path}:`, e);
            healthCheckResponse(res, false, 'Failed to access data from file system.');
            return;
        }
    }
    healthCheckResponse(res, true);
}
function healthCheckResponse(res, success, msg) {
    res.writeHead(success ? 200 : 500, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With',
    });
    res.write(success ? msg || 'true' : msg || 'false');
    res.end();
}
