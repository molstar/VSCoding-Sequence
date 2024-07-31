"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripedResidues = void 0;
const custom_element_property_1 = require("../../mol-model-props/common/custom-element-property");
const color_1 = require("../../mol-util/color");
exports.StripedResidues = custom_element_property_1.CustomElementProperty.create({
    label: 'Residue Stripes',
    name: 'basic-wrapper-residue-striping',
    getData(model) {
        const map = new Map();
        const residueIndex = model.atomicHierarchy.residueAtomSegments.index;
        for (let i = 0, _i = model.atomicHierarchy.atoms._rowCount; i < _i; i++) {
            map.set(i, residueIndex[i] % 2);
        }
        return { value: map };
    },
    coloring: {
        getColor(e) { return e === 0 ? (0, color_1.Color)(0xff0000) : (0, color_1.Color)(0x0000ff); },
        defaultColor: (0, color_1.Color)(0x777777)
    },
    getLabel(e) {
        return e === 0 ? 'Odd stripe' : 'Even stripe';
    }
});
