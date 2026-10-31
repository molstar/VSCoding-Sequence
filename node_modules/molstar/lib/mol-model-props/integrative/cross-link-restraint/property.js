/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ModelCrossLinkRestraint } from './format';
import { Bond } from '../../../mol-model/structure';
import { PairRestraints } from '../pair-restraints';
import { CustomStructureProperty } from '../../common/custom-structure-property';
import { DataLocation } from '../../../mol-model/location';
import { DataLoci } from '../../../mol-model/loci';
import { CentroidHelper } from '../../../mol-math/geometry/centroid-helper';
import { bondLabel } from '../../../mol-theme/label';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
export const CrossLinkRestraintProvider = CustomStructureProperty.createProvider({
    label: 'Cross Link Restraint',
    descriptor: CustomPropertyDescriptor({
        name: 'integrative-cross-link-restraint',
        // TODO `cifExport` and `symbol`
    }),
    type: 'local',
    defaultParams: {},
    getParams: (data) => ({}),
    isApplicable: (data) => data.models.some(m => !!ModelCrossLinkRestraint.Provider.get(m)),
    obtain: async (ctx, data, props) => {
        return { value: extractCrossLinkRestraints(data) };
    }
});
export { CrossLinkRestraint };
var CrossLinkRestraint;
(function (CrossLinkRestraint) {
    let Tag;
    (function (Tag) {
        Tag["CrossLinkRestraint"] = "cross-link-restraint";
    })(Tag = CrossLinkRestraint.Tag || (CrossLinkRestraint.Tag = {}));
    function isApplicable(structure) {
        return structure.models.some(m => !!ModelCrossLinkRestraint.Provider.get(m));
    }
    CrossLinkRestraint.isApplicable = isApplicable;
    const distVecA = Vec3(), distVecB = Vec3();
    function distance(pair) {
        pair.unitA.conformation.position(pair.unitA.elements[pair.indexA], distVecA);
        pair.unitB.conformation.position(pair.unitB.elements[pair.indexB], distVecB);
        return Vec3.distance(distVecA, distVecB);
    }
    CrossLinkRestraint.distance = distance;
    function Location(crossLinkRestraints, structure, index) {
        return DataLocation('cross-link-restraints', { structure, crossLinkRestraints }, index);
    }
    CrossLinkRestraint.Location = Location;
    function isLocation(x) {
        return !!x && x.kind === 'data-location' && x.tag === 'cross-link-restraints';
    }
    CrossLinkRestraint.isLocation = isLocation;
    function areLocationsEqual(locA, locB) {
        return (locA.data.structure === locB.data.structure &&
            locA.data.crossLinkRestraints === locB.data.crossLinkRestraints &&
            locA.element === locB.element);
    }
    CrossLinkRestraint.areLocationsEqual = areLocationsEqual;
    function _label(crossLinkRestraints, element) {
        const p = crossLinkRestraints.pairs[element];
        return `Cross Link Restraint | Type: ${p.restraintType} | Threshold: ${p.distanceThreshold} \u212B | Psi: ${p.psi} | Sigma 1: ${p.sigma1} | Sigma 2: ${p.sigma2} | Distance: ${distance(p).toFixed(2)} \u212B`;
    }
    function locationLabel(location) {
        return _label(location.data.crossLinkRestraints, location.element);
    }
    CrossLinkRestraint.locationLabel = locationLabel;
    function Loci(structure, crossLinkRestraints, elements) {
        return DataLoci('cross-link-restraints', { structure, crossLinkRestraints }, elements, (boundingSphere) => getBoundingSphere(crossLinkRestraints, elements, boundingSphere), () => getLabel(structure, crossLinkRestraints, elements));
    }
    CrossLinkRestraint.Loci = Loci;
    function isLoci(x) {
        return !!x && x.kind === 'data-loci' && x.tag === 'interactions';
    }
    CrossLinkRestraint.isLoci = isLoci;
    function getBoundingSphere(crossLinkRestraints, elements, boundingSphere) {
        return CentroidHelper.fromPairProvider(elements.length, (i, pA, pB) => {
            const p = crossLinkRestraints.pairs[elements[i]];
            p.unitA.conformation.position(p.unitA.elements[p.indexA], pA);
            p.unitB.conformation.position(p.unitB.elements[p.indexB], pB);
        }, boundingSphere);
    }
    CrossLinkRestraint.getBoundingSphere = getBoundingSphere;
    function getLabel(structure, crossLinkRestraints, elements) {
        const element = elements[0];
        if (element === undefined)
            return '';
        const p = crossLinkRestraints.pairs[element];
        return [
            _label(crossLinkRestraints, element),
            bondLabel(Bond.Location(structure, p.unitA, p.indexA, structure, p.unitB, p.indexB))
        ].join('</br>');
    }
    CrossLinkRestraint.getLabel = getLabel;
})(CrossLinkRestraint || (CrossLinkRestraint = {}));
//
function _addRestraints(map, unit, restraints) {
    const { elements } = unit;
    const elementCount = elements.length;
    const kind = unit.kind;
    for (let i = 0; i < elementCount; i++) {
        const e = elements[i];
        restraints.getIndicesByElement(e, kind).forEach(ri => map.set(ri, i));
    }
}
function extractInter(pairs, unitA, unitB) {
    if (unitA.model !== unitB.model)
        return;
    if (unitA.model.sourceData.kind !== 'mmCIF')
        return;
    const restraints = ModelCrossLinkRestraint.Provider.get(unitA.model);
    if (!restraints)
        return;
    const rA = new Map();
    const rB = new Map();
    _addRestraints(rA, unitA, restraints);
    _addRestraints(rB, unitB, restraints);
    rA.forEach((indexA, ri) => {
        const indexB = rB.get(ri);
        if (indexB !== undefined) {
            pairs.push(createCrossLinkRestraint(unitA, indexA, unitB, indexB, restraints, ri), createCrossLinkRestraint(unitB, indexB, unitA, indexA, restraints, ri));
        }
    });
}
function extractIntra(pairs, unit) {
    if (unit.model.sourceData.kind !== 'mmCIF')
        return;
    const restraints = ModelCrossLinkRestraint.Provider.get(unit.model);
    if (!restraints)
        return;
    const { elements } = unit;
    const elementCount = elements.length;
    const kind = unit.kind;
    const r = new Map();
    for (let i = 0; i < elementCount; i++) {
        const e = elements[i];
        restraints.getIndicesByElement(e, kind).forEach(ri => {
            const il = r.get(ri);
            if (il)
                il.push(i);
            else
                r.set(ri, [i]);
        });
    }
    r.forEach((il, ri) => {
        if (il.length < 2)
            return;
        const [indexA, indexB] = il;
        pairs.push(createCrossLinkRestraint(unit, indexA, unit, indexB, restraints, ri), createCrossLinkRestraint(unit, indexB, unit, indexA, restraints, ri));
    });
}
function createCrossLinkRestraint(unitA, indexA, unitB, indexB, restraints, row) {
    return {
        unitA, indexA, unitB, indexB,
        restraintType: restraints.data.restraint_type.value(row),
        distanceThreshold: restraints.data.distance_threshold.value(row),
        psi: restraints.data.psi.value(row),
        sigma1: restraints.data.sigma_1.value(row),
        sigma2: restraints.data.sigma_2.value(row),
    };
}
function extractCrossLinkRestraints(structure) {
    const pairs = [];
    if (!structure.models.some(m => ModelCrossLinkRestraint.Provider.get(m))) {
        return new PairRestraints(pairs);
    }
    const n = structure.units.length;
    for (let i = 0; i < n; ++i) {
        const unitA = structure.units[i];
        extractIntra(pairs, unitA);
        for (let j = i + 1; j < n; ++j) {
            const unitB = structure.units[j];
            if (unitA.model === unitB.model) {
                extractInter(pairs, unitA, unitB);
            }
        }
    }
    return new PairRestraints(pairs);
}
