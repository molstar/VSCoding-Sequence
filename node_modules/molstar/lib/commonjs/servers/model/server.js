#!/usr/bin/env node
"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const compression_1 = tslib_1.__importDefault(require("compression"));
const express_1 = tslib_1.__importDefault(require("express"));
const console_logger_1 = require("../../mol-util/console-logger");
const performance_monitor_1 = require("../../mol-util/performance-monitor");
const config_1 = require("./config");
const api_web_1 = require("./server/api-web");
const version_1 = require("./version");
function setupShutdown() {
    if (config_1.ModelServerConfig.shutdownTimeoutVarianceMinutes > config_1.ModelServerConfig.shutdownTimeoutMinutes) {
        console_logger_1.ConsoleLogger.log('Server', 'Shutdown timeout variance is greater than the timer itself, ignoring.');
    }
    else {
        let tVar = 0;
        if (config_1.ModelServerConfig.shutdownTimeoutVarianceMinutes > 0) {
            tVar = 2 * (Math.random() - 0.5) * config_1.ModelServerConfig.shutdownTimeoutVarianceMinutes;
        }
        const tMs = (config_1.ModelServerConfig.shutdownTimeoutMinutes + tVar) * 60 * 1000;
        console.log(`----------------------------------------------------------------------------`);
        console.log(`  The server will shut down in ${performance_monitor_1.PerformanceMonitor.format(tMs)} to prevent slow performance.`);
        console.log(`  Please make sure a daemon is running that will automatically restart it.`);
        console.log(`----------------------------------------------------------------------------`);
        console.log();
        setTimeout(() => {
            // if (WebApi.ApiState.pendingQueries > 0) {
            //     WebApi.ApiState.shutdownOnZeroPending = true;
            // } else {
            console_logger_1.ConsoleLogger.log('Server', `Shut down due to timeout.`);
            process.exit(0);
            // }
        }, tMs);
    }
}
(0, config_1.configureServer)();
function startServer() {
    const app = (0, express_1.default)();
    app.use((0, compression_1.default)({
        level: 6, memLevel: 9, chunkSize: 16 * 16384,
        filter: (req, res) => {
            const ct = res.getHeader('Content-Type');
            if (typeof ct === 'string' && ct.indexOf('tar+gzip') > 0)
                return false;
            return true;
        }
    }));
    (0, api_web_1.initWebApi)(app);
    const port = process.env.port || config_1.ModelServerConfig.defaultPort;
    app.listen(port).setTimeout(config_1.ModelServerConfig.requestTimeoutMs);
    console.log(`Mol* ModelServer ${version_1.VERSION}`);
    console.log(``);
    console.log(`The server is running on port ${port}.`);
    console.log(``);
}
startServer();
if (config_1.ModelServerConfig.shutdownTimeoutMinutes > 0) {
    setupShutdown();
}
