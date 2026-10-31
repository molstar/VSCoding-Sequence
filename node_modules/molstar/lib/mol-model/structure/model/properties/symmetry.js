/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { arrayFind } from '../../../../mol-data/util';
import { Spacegroup } from '../../../../mol-math/geometry';
import { ModelSymmetry } from '../../../../mol-model-formats/structure/property/symmetry';
import { radToDeg } from '../../../../mol-math/misc';
export class Assembly {
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
(function (Assembly) {
    function create(id, details, operatorsProvider) {
        return new Assembly(id, details, operatorsProvider);
    }
    Assembly.create = create;
})(Assembly || (Assembly = {}));
var Symmetry;
(function (Symmetry) {
    Symmetry.Default = { assemblies: [], spacegroup: Spacegroup.ZeroP1, isNonStandardCrystalFrame: false };
    function findAssembly(model, id) {
        const _id = id.toLocaleLowerCase();
        const symmetry = ModelSymmetry.Provider.get(model);
        return symmetry ? arrayFind(symmetry.assemblies, a => a.id.toLowerCase() === _id) : undefined;
    }
    Symmetry.findAssembly = findAssembly;
    function getUnitcellLabel(symmetry) {
        const { cell, name, num } = symmetry.spacegroup;
        const { size, anglesInRadians } = cell;
        const a = size[0].toFixed(2);
        const b = size[1].toFixed(2);
        const c = size[2].toFixed(2);
        const alpha = radToDeg(anglesInRadians[0]).toFixed(2);
        const beta = radToDeg(anglesInRadians[1]).toFixed(2);
        const gamma = radToDeg(anglesInRadians[2]).toFixed(2);
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
})(Symmetry || (Symmetry = {}));
export { Symmetry };
