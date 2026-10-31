#!/usr/bin/env node
"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const compression_1 = tslib_1.__importDefault(require("compression"));
const express_1 = tslib_1.__importDefault(require("express"));
const console_logger_1 = require("../../mol-util/console-logger");
const config_1 = require("./config");
const state_1 = require("./server/state");
const version_1 = require("./server/version");
const web_api_1 = require("./server/web-api");
function setupShutdown() {
    if (config_1.ServerConfig.shutdownTimeoutVarianceMinutes > config_1.ServerConfig.shutdownTimeoutMinutes) {
        console_logger_1.ConsoleLogger.log('Server', 'Shutdown timeout variance is greater than the timer itself, ignoring.');
    }
    else {
        let tVar = 0;
        if (config_1.ServerConfig.shutdownTimeoutVarianceMinutes > 0) {
            tVar = 2 * (Math.random() - 0.5) * config_1.ServerConfig.shutdownTimeoutVarianceMinutes;
        }
        const tMs = (config_1.ServerConfig.shutdownTimeoutMinutes + tVar) * 60 * 1000;
        console.log(`----------------------------------------------------------------------------`);
        console.log(`  The server will shut down in ${console_logger_1.ConsoleLogger.formatTime(tMs)} to prevent slow performance.`);
        console.log(`  Please make sure a daemon is running that will automatically restart it.`);
        console.log(`----------------------------------------------------------------------------`);
        console.log();
        setTimeout(() => {
            if (state_1.State.pendingQueries > 0) {
                state_1.State.shutdownOnZeroPending = true;
            }
            else {
                console_logger_1.ConsoleLogger.log('Server', `Shut down due to timeout.`);
                process.exit(0);
            }
        }, tMs);
    }
}
(0, config_1.configureServer)();
const port = process.env.port || config_1.ServerConfig.defaultPort;
const app = (0, express_1.default)();
app.use((0, compression_1.default)({ level: 6, memLevel: 9, chunkSize: 16 * 16384, filter: () => true }));
(0, web_api_1.init)(app);
app.listen(port);
console.log(version_1.VOLUME_SERVER_HEADER);
console.log(``);
console.log(`The server is running on port ${port}.`);
console.log(``);
if (config_1.ServerConfig.shutdownTimeoutMinutes > 0) {
    setupShutdown();
}
