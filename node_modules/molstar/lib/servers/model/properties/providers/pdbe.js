/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as fs from 'fs';
import * as path from 'path';
import { StructureQualityReportProvider, StructureQualityReport } from '../../../../extensions/pdbe/structure-quality-report/prop';
import { fetchRetry } from '../../utils/fetch-retry';
import { UUID } from '../../../../mol-util';
import { PDBePreferredAssembly } from '../../../../extensions/pdbe/preferred-assembly';
import { PDBeStructRefDomain } from '../../../../extensions/pdbe/struct-ref-domain';
import { ConsoleLogger } from '../../../../mol-util/console-logger';
import { getParam } from '../../../common/util';
export const PDBe_structureQualityReport = async ({ model, params, cache }) => {
    const PDBe_apiSourceJson = useFileSource(params)
        ? residuewise_outlier_summary.getDataFromAggregateFile(getFilePrefix(params, 'residuewise_outlier_summary'))
        : apiQueryProvider(getApiUrl(params, 'residuewise_outlier_summary', StructureQualityReport.DefaultServerUrl), cache);
    const data = StructureQualityReport.fromJson(model, await PDBe_apiSourceJson(model));
    return StructureQualityReportProvider.set(model, { serverUrl: StructureQualityReport.DefaultServerUrl }, data);
};
export const PDBe_preferredAssembly = ({ model, params, cache }) => {
    const PDBe_apiSourceJson = apiQueryProvider(getApiUrl(params, 'preferred_assembly', 'https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary'), cache);
    return PDBePreferredAssembly.attachFromCifOrApi(model, { PDBe_apiSourceJson });
};
export const PDBe_structRefDomain = ({ model, params, cache }) => {
    const PDBe_apiSourceJson = apiQueryProvider(getApiUrl(params, 'struct_ref_domain', 'https://www.ebi.ac.uk/pdbe/api/mappings/sequence_domains'), cache);
    return PDBeStructRefDomain.attachFromCifOrApi(model, { PDBe_apiSourceJson });
};
var residuewise_outlier_summary;
(function (residuewise_outlier_summary) {
    const json = new Map();
    function getDataFromAggregateFile(pathPrefix) {
        // This is for "testing" purposes and should probably only read
        // a single file with the appropriate prop in the "production" version.
        return async (model) => {
            const key = `${model.entryId[1]}${model.entryId[2]}`;
            if (!json.has(key)) {
                const fn = path.join(pathPrefix, `${key}.json`);
                if (!fs.existsSync(fn))
                    json.set(key, {});
                // TODO: use async readFile?
                else
                    json.set(key, JSON.parse(fs.readFileSync(fn, 'utf8')));
            }
            return json.get(key)[model.entryId.toLowerCase()] || {};
        };
    }
    residuewise_outlier_summary.getDataFromAggregateFile = getDataFromAggregateFile;
})(residuewise_outlier_summary || (residuewise_outlier_summary = {}));
function getApiUrl(params, name, fallback) {
    const url = getParam(params, 'PDBe', 'API', name);
    if (!url)
        return fallback;
    if (url[url.length - 1] === '/')
        return url.substring(0, url.length - 1);
    return url;
}
function getFilePrefix(params, name) {
    const ret = getParam(params, 'PDBe', 'File', name);
    if (!ret)
        throw new Error(`PDBe file prefix '${name}' not set!`);
    return ret;
}
function useFileSource(params) {
    return !!getParam(params, 'PDBe', 'UseFileSource');
}
function apiQueryProvider(urlPrefix, cache) {
    const cacheKey = UUID.create22();
    return async (model) => {
        try {
            if (cache[cacheKey])
                return cache[cacheKey];
            const rawData = await fetchRetry(`${urlPrefix}/${model.entryId.toLowerCase()}`, 1500, 5);
            // TODO: is this ok?
            if (rawData.status !== 200)
                return {};
            const json = (await rawData.json())[model.entryId.toLowerCase()] || {};
            cache[cacheKey] = json;
            return json;
        }
        catch (e) {
            // TODO: handle better
            ConsoleLogger.warn('Props', `Could not retrieve prop @${`${urlPrefix}/${model.entryId.toLowerCase()}`}`);
            return {};
        }
    };
}
