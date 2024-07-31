/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Model } from '../../../../mol-model/structure';
import { MmcifFormat } from '../../../../mol-model-formats/structure/mmcif';
import { PluginConfig } from '../../../config';
export function getStreamingMethod(s, defaultKind = 'x-ray') {
    if (!s)
        return defaultKind;
    const model = s.models[0];
    if (!MmcifFormat.is(model.sourceData))
        return defaultKind;
    // Prefer EMDB entries over structure-factors (SF) e.g. for 'ELECTRON CRYSTALLOGRAPHY' entries
    // like 6AXZ or 6KJ3 for which EMDB entries are available but map calculation from SF is hard.
    if (Model.hasEmMap(model))
        return 'em';
    if (Model.hasXrayMap(model))
        return 'x-ray';
    // Fallbacks based on experimental method
    if (Model.isFromEm(model))
        return 'em';
    if (Model.isFromXray(model))
        return 'x-ray';
    return defaultKind;
}
/** Returns EMD ID when available, otherwise falls back to PDB ID */
export function getEmIds(model) {
    const ids = [];
    if (!MmcifFormat.is(model.sourceData))
        return [model.entryId];
    const { db_id, db_name, content_type } = model.sourceData.data.db.pdbx_database_related;
    if (!db_name.isDefined)
        return [model.entryId];
    for (let i = 0, il = db_name.rowCount; i < il; ++i) {
        if (db_name.value(i).toUpperCase() === 'EMDB' && content_type.value(i) === 'associated EM volume') {
            ids.push(db_id.value(i));
        }
    }
    return ids;
}
export function getXrayIds(model) {
    return [model.entryId];
}
export function getIds(method, s) {
    if (!s || !s.models.length)
        return [];
    const model = s.models[0];
    switch (method) {
        case 'em': return getEmIds(model);
        case 'x-ray': return getXrayIds(model);
    }
}
export async function getContourLevel(provider, plugin, taskCtx, emdbId) {
    switch (provider) {
        case 'emdb': return getContourLevelEmdb(plugin, taskCtx, emdbId);
        case 'pdbe': return getContourLevelPdbe(plugin, taskCtx, emdbId);
    }
}
export async function getContourLevelEmdb(plugin, taskCtx, emdbId) {
    const emdbHeaderServer = plugin.config.get(PluginConfig.VolumeStreaming.EmdbHeaderServer);
    const header = await plugin.fetch({ url: `${emdbHeaderServer}/${emdbId.toUpperCase()}/header/${emdbId.toLowerCase()}.xml`, type: 'xml' }).runInContext(taskCtx);
    const map = header.getElementsByTagName('map')[0];
    const contours = map.getElementsByTagName('contour');
    let primaryContour = contours[0];
    for (let i = 1; i < contours.length; i++) {
        if (contours[i].getAttribute('primary') === 'true') {
            primaryContour = contours[i];
            break;
        }
    }
    const contourLevel = parseFloat(primaryContour.getElementsByTagName('level')[0].textContent);
    return contourLevel;
}
export async function getContourLevelPdbe(plugin, taskCtx, emdbId) {
    var _a, _b, _c, _d;
    // TODO: parametrize URL in plugin settings?
    emdbId = emdbId.toUpperCase();
    const header = await plugin.fetch({ url: `https://www.ebi.ac.uk/emdb/api/entry/map/${emdbId}`, type: 'json' }).runInContext(taskCtx);
    const contours = (_b = (_a = header === null || header === void 0 ? void 0 : header.map) === null || _a === void 0 ? void 0 : _a.contour_list) === null || _b === void 0 ? void 0 : _b.contour;
    if (!contours || contours.length === 0) {
        // try fallback to the old API
        return getContourLevelPdbeLegacy(plugin, taskCtx, emdbId);
    }
    return (_d = (_c = contours.find((c) => c.primary)) === null || _c === void 0 ? void 0 : _c.level) !== null && _d !== void 0 ? _d : contours[0].level;
}
async function getContourLevelPdbeLegacy(plugin, taskCtx, emdbId) {
    var _a, _b, _c;
    // TODO: parametrize URL in plugin settings?
    emdbId = emdbId.toUpperCase();
    const header = await plugin.fetch({ url: `https://www.ebi.ac.uk/pdbe/api/emdb/entry/map/${emdbId}`, type: 'json' }).runInContext(taskCtx);
    const emdbEntry = header === null || header === void 0 ? void 0 : header[emdbId];
    let contourLevel = void 0;
    if (((_c = (_b = (_a = emdbEntry === null || emdbEntry === void 0 ? void 0 : emdbEntry[0]) === null || _a === void 0 ? void 0 : _a.map) === null || _b === void 0 ? void 0 : _b.contour_level) === null || _c === void 0 ? void 0 : _c.value) !== void 0) {
        contourLevel = +emdbEntry[0].map.contour_level.value;
    }
    return contourLevel;
}
export async function getEmdbIds(plugin, taskCtx, pdbId) {
    var _a;
    // TODO: parametrize to a differnt URL? in plugin settings perhaps
    const summary = await plugin.fetch({ url: `https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/${pdbId}`, type: 'json' }).runInContext(taskCtx);
    const summaryEntry = summary === null || summary === void 0 ? void 0 : summary[pdbId];
    const emdbIds = [];
    if ((_a = summaryEntry === null || summaryEntry === void 0 ? void 0 : summaryEntry[0]) === null || _a === void 0 ? void 0 : _a.related_structures) {
        const emdb = summaryEntry[0].related_structures.filter((s) => s.resource === 'EMDB' && s.relationship === 'associated EM volume');
        if (!emdb.length) {
            throw new Error(`No related EMDB entry found for '${pdbId}'.`);
        }
        emdbIds.push(...emdb.map((e) => e.accession));
    }
    else {
        throw new Error(`No related EMDB entry found for '${pdbId}'.`);
    }
    return emdbIds;
}
