"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.superpose = superpose;
exports.alignAndSuperpose = alignAndSuperpose;
exports.getPositionTable = getPositionTable;
const minimize_rmsd_1 = require("../../../../mol-math/linear-algebra/3d/minimize-rmsd");
const element_1 = require("../element");
const int_1 = require("../../../../mol-data/int");
const sequence_1 = require("../../../sequence/alignment/sequence");
const properties_1 = require("../properties");
function superpose(xs) {
    const ret = [];
    if (xs.length <= 0)
        return ret;
    const n = getMinSize(xs);
    const input = {
        a: getPositionTable(xs[0], n),
        b: getPositionTable(xs[1], n)
    };
    ret[0] = minimize_rmsd_1.MinimizeRmsd.compute(input);
    for (let i = 2; i < xs.length; i++) {
        input.b = getPositionTable(xs[i], n);
        input.centerB = void 0;
        ret.push(minimize_rmsd_1.MinimizeRmsd.compute(input));
    }
    return ret;
}
const reProtein = /(polypeptide|cyclic-pseudo-peptide)/i;
function alignAndSuperpose(xs) {
    const ret = [];
    if (xs.length <= 0)
        return ret;
    const l = element_1.StructureElement.Loci.getFirstLocation(xs[0]);
    const subtype = properties_1.StructureProperties.entity.subtype(l);
    const substMatrix = subtype.match(reProtein) ? 'blosum62' : 'default';
    for (let i = 1; i < xs.length; i++) {
        const { a, b, score } = sequence_1.AlignSequences.compute({
            a: xs[0].elements[0],
            b: xs[i].elements[0],
        }, { substMatrix });
        const lociA = element_1.StructureElement.Loci(xs[0].structure, [a]);
        const lociB = element_1.StructureElement.Loci(xs[i].structure, [b]);
        const n = int_1.OrderedSet.size(a.indices);
        ret.push({
            ...minimize_rmsd_1.MinimizeRmsd.compute({
                a: getPositionTable(lociA, n),
                b: getPositionTable(lociB, n)
            }),
            alignmentScore: score
        });
    }
    return ret;
}
function getPositionTable(xs, n) {
    const ret = minimize_rmsd_1.MinimizeRmsd.Positions.empty(n);
    let o = 0;
    for (const u of xs.elements) {
        const { unit, indices } = u;
        const { elements, conformation: c } = unit;
        for (let i = 0, _i = int_1.OrderedSet.size(indices); i < _i; i++) {
            const e = elements[int_1.OrderedSet.getAt(indices, i)];
            ret.x[o] = c.x(e);
            ret.y[o] = c.y(e);
            ret.z[o] = c.z(e);
            o++;
            if (o >= n)
                break;
        }
        if (o >= n)
            break;
    }
    return ret;
}
function getMinSize(xs) {
    if (xs.length === 0)
        return 0;
    let s = element_1.StructureElement.Loci.size(xs[0]);
    for (let i = 1; i < xs.length; i++) {
        const t = element_1.StructureElement.Loci.size(xs[i]);
        if (t < s)
            s = t;
    }
    return s;
}
