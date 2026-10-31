/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export function getDistanceDataFromStructureSelections(s) {
    const lociA = s[0].loci;
    const lociB = s[1].loci;
    return { pairs: [{ loci: [lociA, lociB] }] };
}
export function getAngleDataFromStructureSelections(s) {
    const lociA = s[0].loci;
    const lociB = s[1].loci;
    const lociC = s[2].loci;
    return { triples: [{ loci: [lociA, lociB, lociC] }] };
}
export function getDihedralDataFromStructureSelections(s) {
    const lociA = s[0].loci;
    const lociB = s[1].loci;
    const lociC = s[2].loci;
    const lociD = s[3].loci;
    return { quads: [{ loci: [lociA, lociB, lociC, lociD] }] };
}
export function getLabelDataFromStructureSelections(s) {
    const loci = s[0].loci;
    return { infos: [{ loci }] };
}
export function getOrientationDataFromStructureSelections(s) {
    return { locis: s.map(v => v.loci) };
}
export function getPlaneDataFromStructureSelections(s) {
    return { locis: s.map(v => v.loci) };
}
