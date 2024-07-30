/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { splitEntryId } from './helpers';
/** Try to get author-defined contour value for isosurface from EMDB API. Return relative value 1.0, if not applicable or fails.  */
export async function tryGetIsovalue(entryId) {
    var _a, _b;
    const split = splitEntryId(entryId);
    if (split.source === 'emdb') {
        try {
            const response = await fetch(`https://www.ebi.ac.uk/emdb/api/entry/map/${split.entryNumber}`);
            const json = await response.json();
            const contours = (_b = (_a = json === null || json === void 0 ? void 0 : json.map) === null || _a === void 0 ? void 0 : _a.contour_list) === null || _b === void 0 ? void 0 : _b.contour;
            if (contours && contours.length > 0) {
                const theContour = contours.find(c => c.primary) || contours[0];
                if (theContour.level === undefined)
                    throw new Error('EMDB API response missing contour level.');
                return { kind: 'absolute', value: theContour.level };
            }
        }
        catch (_c) {
            // do nothing
        }
    }
    return undefined;
}
export async function getPdbIdsForEmdbEntry(entryId) {
    var _a, _b, _c;
    const split = splitEntryId(entryId);
    const result = [];
    if (split.source === 'emdb') {
        entryId = entryId.toUpperCase();
        const apiUrl = `https://www.ebi.ac.uk/pdbe/api/emdb/entry/fitted/${entryId}`;
        try {
            const response = await fetch(apiUrl);
            if (response.ok) {
                const json = await response.json();
                const jsonEntry = (_a = json[entryId]) !== null && _a !== void 0 ? _a : [];
                for (const record of jsonEntry) {
                    const pdbs = (_c = (_b = record === null || record === void 0 ? void 0 : record.fitted_emdb_id_list) === null || _b === void 0 ? void 0 : _b.pdb_id) !== null && _c !== void 0 ? _c : [];
                    result.push(...pdbs);
                }
            }
        }
        catch (ex) {
            // do nothing
        }
    }
    return result;
}
