"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModelPropertiesProviderFromConfig = createModelPropertiesProviderFromConfig;
exports.createModelPropertiesProvider = createModelPropertiesProvider;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const config_1 = require("./config");
const console_logger_1 = require("../../mol-util/console-logger");
// TODO enable dynamic imports again
const pdbeProps = tslib_1.__importStar(require("./properties/pdbe"));
const wwpdbProps = tslib_1.__importStar(require("./properties/wwpdb"));
const attachModelProperties = {
    pdbe: pdbeProps.attachModelProperties,
    wwpdb: wwpdbProps.attachModelProperties
};
function createModelPropertiesProviderFromConfig() {
    return createModelPropertiesProvider(config_1.ModelServerConfig.customProperties);
}
function createModelPropertiesProvider(configOrPath) {
    let config;
    if (typeof configOrPath === 'string') {
        try {
            config = JSON.parse(fs.readFileSync(configOrPath, 'utf8'));
        }
        catch (_a) {
            console_logger_1.ConsoleLogger.error('Config', `Could not read property provider config file '${configOrPath}', ignoring.`);
            return () => [];
        }
    }
    else {
        config = configOrPath;
    }
    if (!config || !config.sources || config.sources.length === 0)
        return void 0;
    const ps = [];
    for (const p of config.sources) {
        if (p in attachModelProperties) {
            ps.push(attachModelProperties[p]);
        }
        else {
            console_logger_1.ConsoleLogger.error('Config', `Could not find property provider '${p}', ignoring.`);
        }
    }
    return (model, cache) => {
        const ret = [];
        for (const p of ps) {
            for (const e of p({ model, cache, params: config.params }))
                ret.push(e);
        }
        return ret;
    };
}
