"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDBe_structRefDomain = exports.PDBe_preferredAssembly = exports.PDBe_structureQualityReport = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const prop_1 = require("../../../../extensions/pdbe/structure-quality-report/prop");
const fetch_retry_1 = require("../../utils/fetch-retry");
const mol_util_1 = require("../../../../mol-util");
const preferred_assembly_1 = require("../../../../extensions/pdbe/preferred-assembly");
const struct_ref_domain_1 = require("../../../../extensions/pdbe/struct-ref-domain");
const console_logger_1 = require("../../../../mol-util/console-logger");
const util_1 = require("../../../common/util");
const PDBe_structureQualityReport = async ({ model, params, cache }) => {
    const PDBe_apiSourceJson = useFileSource(params)
        ? residuewise_outlier_summary.getDataFromAggregateFile(getFilePrefix(params, 'residuewise_outlier_summary'))
        : apiQueryProvider(getApiUrl(params, 'residuewise_outlier_summary', prop_1.StructureQualityReport.DefaultServerUrl), cache);
    const data = prop_1.StructureQualityReport.fromJson(model, await PDBe_apiSourceJson(model));
    return prop_1.StructureQualityReportProvider.set(model, { serverUrl: prop_1.StructureQualityReport.DefaultServerUrl }, data);
};
exports.PDBe_structureQualityReport = PDBe_structureQualityReport;
const PDBe_preferredAssembly = ({ model, params, cache }) => {
    const PDBe_apiSourceJson = apiQueryProvider(getApiUrl(params, 'preferred_assembly', 'https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary'), cache);
    return preferred_assembly_1.PDBePreferredAssembly.attachFromCifOrApi(model, { PDBe_apiSourceJson });
};
exports.PDBe_preferredAssembly = PDBe_preferredAssembly;
const PDBe_structRefDomain = ({ model, params, cache }) => {
    const PDBe_apiSourceJson = apiQueryProvider(getApiUrl(params, 'struct_ref_domain', 'https://www.ebi.ac.uk/pdbe/api/mappings/sequence_domains'), cache);
    return struct_ref_domain_1.PDBeStructRefDomain.attachFromCifOrApi(model, { PDBe_apiSourceJson });
};
exports.PDBe_structRefDomain = PDBe_structRefDomain;
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
    const url = (0, util_1.getParam)(params, 'PDBe', 'API', name);
    if (!url)
        return fallback;
    if (url[url.length - 1] === '/')
        return url.substring(0, url.length - 1);
    return url;
}
function getFilePrefix(params, name) {
    const ret = (0, util_1.getParam)(params, 'PDBe', 'File', name);
    if (!ret)
        throw new Error(`PDBe file prefix '${name}' not set!`);
    return ret;
}
function useFileSource(params) {
    return !!(0, util_1.getParam)(params, 'PDBe', 'UseFileSource');
}
function apiQueryProvider(urlPrefix, cache) {
    const cacheKey = mol_util_1.UUID.create22();
    return async (model) => {
        try {
            if (cache[cacheKey])
                return cache[cacheKey];
            const rawData = await (0, fetch_retry_1.fetchRetry)(`${urlPrefix}/${model.entryId.toLowerCase()}`, 1500, 5);
            // TODO: is this ok?
            if (rawData.status !== 200)
                return {};
            const json = (await rawData.json())[model.entryId.toLowerCase()] || {};
            cache[cacheKey] = json;
            return json;
        }
        catch (e) {
            // TODO: handle better
            console_logger_1.ConsoleLogger.warn('Props', `Could not retrieve prop @${`${urlPrefix}/${model.entryId.toLowerCase()}`}`);
            return {};
        }
    };
}
