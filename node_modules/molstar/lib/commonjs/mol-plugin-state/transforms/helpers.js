"use strict";
/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistanceDataFromStructureSelections = getDistanceDataFromStructureSelections;
exports.getAngleDataFromStructureSelections = getAngleDataFromStructureSelections;
exports.getDihedralDataFromStructureSelections = getDihedralDataFromStructureSelections;
exports.getLabelDataFromStructureSelections = getLabelDataFromStructureSelections;
exports.getOrientationDataFromStructureSelections = getOrientationDataFromStructureSelections;
exports.getPlaneDataFromStructureSelections = getPlaneDataFromStructureSelections;
function getDistanceDataFromStructureSelections(s) {
    const lociA = s[0].loci;
    const lociB = s[1].loci;
    return { pairs: [{ loci: [lociA, lociB] }] };
}
function getAngleDataFromStructureSelections(s) {
    const lociA = s[0].loci;
    const lociB = s[1].loci;
    const lociC = s[2].loci;
    return { triples: [{ loci: [lociA, lociB, lociC] }] };
}
function getDihedralDataFromStructureSelections(s) {
    const lociA = s[0].loci;
    const lociB = s[1].loci;
    const lociC = s[2].loci;
    const lociD = s[3].loci;
    return { quads: [{ loci: [lociA, lociB, lociC, lociD] }] };
}
function getLabelDataFromStructureSelections(s) {
    const loci = s[0].loci;
    return { infos: [{ loci }] };
}
function getOrientationDataFromStructureSelections(s) {
    return { locis: s.map(v => v.loci) };
}
function getPlaneDataFromStructureSelections(s) {
    return { locis: s.map(v => v.loci) };
}
