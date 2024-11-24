/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as fs from 'fs';
import { ModelServerConfig as Config } from './config';
import { ConsoleLogger } from '../../mol-util/console-logger';
// TODO enable dynamic imports again
import * as pdbeProps from './properties/pdbe';
import * as wwpdbProps from './properties/wwpdb';
const attachModelProperties = {
    pdbe: pdbeProps.attachModelProperties,
    wwpdb: wwpdbProps.attachModelProperties
};
export function createModelPropertiesProviderFromConfig() {
    return createModelPropertiesProvider(Config.customProperties);
}
export function createModelPropertiesProvider(configOrPath) {
    let config;
    if (typeof configOrPath === 'string') {
        try {
            config = JSON.parse(fs.readFileSync(configOrPath, 'utf8'));
        }
        catch (_a) {
            ConsoleLogger.error('Config', `Could not read property provider config file '${configOrPath}', ignoring.`);
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
            ConsoleLogger.error('Config', `Could not find property provider '${p}', ignoring.`);
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
