"use strict";
/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Symmetry = exports.Assembly = void 0;
const util_1 = require("../../../../mol-data/util");
const geometry_1 = require("../../../../mol-math/geometry");
const symmetry_1 = require("../../../../mol-model-formats/structure/property/symmetry");
const misc_1 = require("../../../../mol-math/misc");
class Assembly {
    get operatorGroups() {
        if (this._operators)
            return this._operators;
        this._operators = this.operatorsProvider();
        return this._operators;
    }
    constructor(id, details, operatorsProvider) {
        this.operatorsProvider = operatorsProvider;
        this.id = id;
        this.details = details;
    }
}
exports.Assembly = Assembly;
(function (Assembly) {
    function create(id, details, operatorsProvider) {
        return new Assembly(id, details, operatorsProvider);
    }
    Assembly.create = create;
})(Assembly || (exports.Assembly = Assembly = {}));
var Symmetry;
(function (Symmetry) {
    Symmetry.Default = { assemblies: [], spacegroup: geometry_1.Spacegroup.ZeroP1, isNonStandardCrystalFrame: false };
    function findAssembly(model, id) {
        const _id = id.toLocaleLowerCase();
        const symmetry = symmetry_1.ModelSymmetry.Provider.get(model);
        return symmetry ? (0, util_1.arrayFind)(symmetry.assemblies, a => a.id.toLowerCase() === _id) : undefined;
    }
    Symmetry.findAssembly = findAssembly;
    function getUnitcellLabel(symmetry) {
        const { cell, name, num } = symmetry.spacegroup;
        const { size, anglesInRadians } = cell;
        const a = size[0].toFixed(2);
        const b = size[1].toFixed(2);
        const c = size[2].toFixed(2);
        const alpha = (0, misc_1.radToDeg)(anglesInRadians[0]).toFixed(2);
        const beta = (0, misc_1.radToDeg)(anglesInRadians[1]).toFixed(2);
        const gamma = (0, misc_1.radToDeg)(anglesInRadians[2]).toFixed(2);
        const label = [];
        // name
        label.push(`Unit Cell <b>${name}</b> #${num}`);
        // sizes
        label.push(`${a}\u00D7${b}\u00D7${c} \u212B`);
        // angles
        label.push(`\u03b1=${alpha}\u00B0 \u03b2=${beta}\u00B0 \u03b3=${gamma}\u00B0`);
        return label.join(' | ');
    }
    Symmetry.getUnitcellLabel = getUnitcellLabel;
})(Symmetry || (exports.Symmetry = Symmetry = {}));
