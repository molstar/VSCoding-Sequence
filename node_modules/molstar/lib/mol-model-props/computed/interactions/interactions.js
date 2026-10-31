/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Structure, Unit, Bond } from '../../../mol-model/structure';
import { Features, FeaturesBuilder } from './features';
import { ValenceModelProvider } from '../valence-model';
import { interactionTypeLabel } from './common';
import { IntraContactsBuilder, InterContactsBuilder } from './contacts-builder';
import { IntMap } from '../../../mol-data/int';
import { addUnitContacts, addStructureContacts, ContactsParams } from './contacts';
import { HalogenDonorProvider, HalogenAcceptorProvider, HalogenBondsProvider } from './halogen-bonds';
import { HydrogenDonorProvider, WeakHydrogenDonorProvider, HydrogenAcceptorProvider, HydrogenBondsProvider, WeakHydrogenBondsProvider } from './hydrogen-bonds';
import { NegativChargeProvider, PositiveChargeProvider, AromaticRingProvider, IonicProvider, PiStackingProvider, CationPiProvider } from './charged';
import { HydrophobicAtomProvider, HydrophobicProvider } from './hydrophobic';
import { SetUtils } from '../../../mol-util/set';
import { MetalCoordinationProvider, MetalProvider, MetalBindingProvider } from './metal';
import { refineInteractions } from './refine';
import { DataLocation } from '../../../mol-model/location';
import { CentroidHelper } from '../../../mol-math/geometry/centroid-helper';
import { DataLoci } from '../../../mol-model/loci';
import { bondLabel } from '../../../mol-theme/label';
import { ObjectKeys } from '../../../mol-util/type-helpers';
export { Interactions };
var Interactions;
(function (Interactions) {
    function Location(interactions, structure, unitA, indexA, unitB, indexB) {
        return DataLocation('interactions', { structure, interactions }, { unitA: unitA, indexA: indexA, unitB: unitB, indexB: indexB });
    }
    Interactions.Location = Location;
    function isLocation(x) {
        return !!x && x.kind === 'data-location' && x.tag === 'interactions';
    }
    Interactions.isLocation = isLocation;
    function areLocationsEqual(locA, locB) {
        return (locA.data.structure === locB.data.structure &&
            locA.data.interactions === locB.data.interactions &&
            locA.element.indexA === locB.element.indexA &&
            locA.element.indexB === locB.element.indexB &&
            locA.element.unitA === locB.element.unitA &&
            locA.element.unitB === locB.element.unitB);
    }
    Interactions.areLocationsEqual = areLocationsEqual;
    function _label(interactions, element) {
        const { unitA, indexA, unitB, indexB } = element;
        const { contacts, unitsContacts } = interactions;
        if (unitA === unitB) {
            const contacts = unitsContacts.get(unitA.id);
            const idx = contacts.getDirectedEdgeIndex(indexA, indexB);
            return interactionTypeLabel(contacts.edgeProps.type[idx]);
        }
        else {
            const idx = contacts.getEdgeIndex(indexA, unitA.id, indexB, unitB.id);
            return interactionTypeLabel(contacts.edges[idx].props.type);
        }
    }
    function locationLabel(location) {
        return _label(location.data.interactions, location.element);
    }
    Interactions.locationLabel = locationLabel;
    function Loci(structure, interactions, elements) {
        return DataLoci('interactions', { structure, interactions }, elements, (boundingSphere) => getBoundingSphere(interactions, elements, boundingSphere), () => getLabel(structure, interactions, elements));
    }
    Interactions.Loci = Loci;
    function isLoci(x) {
        return !!x && x.kind === 'data-loci' && x.tag === 'interactions';
    }
    Interactions.isLoci = isLoci;
    function getBoundingSphere(interactions, elements, boundingSphere) {
        const { unitsFeatures } = interactions;
        return CentroidHelper.fromPairProvider(elements.length, (i, pA, pB) => {
            const e = elements[i];
            Features.setPosition(pA, e.unitA, e.indexA, unitsFeatures.get(e.unitA.id));
            Features.setPosition(pB, e.unitB, e.indexB, unitsFeatures.get(e.unitB.id));
        }, boundingSphere);
    }
    Interactions.getBoundingSphere = getBoundingSphere;
    function getLabel(structure, interactions, elements) {
        const element = elements[0];
        if (element === undefined)
            return '';
        const { unitA, indexA, unitB, indexB } = element;
        const { unitsFeatures } = interactions;
        const { members: mA, offsets: oA } = unitsFeatures.get(unitA.id);
        const { members: mB, offsets: oB } = unitsFeatures.get(unitB.id);
        const options = { granularity: 'element' };
        if (oA[indexA + 1] - oA[indexA] > 1 || oB[indexB + 1] - oB[indexB] > 1) {
            options.granularity = 'residue';
        }
        return [
            _label(interactions, element),
            bondLabel(Bond.Location(structure, unitA, mA[oA[indexA]], structure, unitB, mB[oB[indexB]]), options)
        ].join('</br>');
    }
    Interactions.getLabel = getLabel;
})(Interactions || (Interactions = {}));
const FeatureProviders = [
    HydrogenDonorProvider, WeakHydrogenDonorProvider, HydrogenAcceptorProvider,
    NegativChargeProvider, PositiveChargeProvider, AromaticRingProvider,
    HalogenDonorProvider, HalogenAcceptorProvider,
    HydrophobicAtomProvider,
    MetalProvider, MetalBindingProvider,
];
const ContactProviders = {
    'ionic': IonicProvider,
    'pi-stacking': PiStackingProvider,
    'cation-pi': CationPiProvider,
    'halogen-bonds': HalogenBondsProvider,
    'hydrogen-bonds': HydrogenBondsProvider,
    'weak-hydrogen-bonds': WeakHydrogenBondsProvider,
    'hydrophobic': HydrophobicProvider,
    'metal-coordination': MetalCoordinationProvider,
};
function getProvidersParams(defaultOn = []) {
    const params = Object.create(null);
    Object.keys(ContactProviders).forEach(k => {
        params[k] = PD.MappedStatic(defaultOn.includes(k) ? 'on' : 'off', {
            on: PD.Group(ContactProviders[k].params),
            off: PD.Group({})
        }, { cycle: true });
    });
    return params;
}
export const ContactProviderParams = getProvidersParams([
    // 'ionic',
    'cation-pi',
    'pi-stacking',
    'hydrogen-bonds',
    'halogen-bonds',
    // 'hydrophobic',
    'metal-coordination',
    // 'weak-hydrogen-bonds',
]);
export const InteractionsParams = {
    providers: PD.Group(ContactProviderParams, { isFlat: true }),
    contacts: PD.Group(ContactsParams, { label: 'Advanced Options' }),
};
export async function computeInteractions(ctx, structure, props) {
    const p = { ...PD.getDefaultValues(InteractionsParams), ...props };
    await ValenceModelProvider.attach(ctx, structure);
    const contactTesters = [];
    ObjectKeys(ContactProviders).forEach(k => {
        const { name, params } = p.providers[k];
        if (name === 'on') {
            contactTesters.push(ContactProviders[k].createTester(params));
        }
    });
    const requiredFeatures = new Set();
    contactTesters.forEach(l => SetUtils.add(requiredFeatures, l.requiredFeatures));
    const featureProviders = FeatureProviders.filter(f => SetUtils.areIntersecting(requiredFeatures, f.types));
    const unitsFeatures = IntMap.Mutable();
    const unitsContacts = IntMap.Mutable();
    for (let i = 0, il = structure.unitSymmetryGroups.length; i < il; ++i) {
        const group = structure.unitSymmetryGroups[i];
        if (ctx.runtime.shouldUpdate) {
            await ctx.runtime.update({ message: 'computing interactions', current: i, max: il });
        }
        const features = findUnitFeatures(structure, group.units[0], featureProviders);
        const intraUnitContacts = findIntraUnitContacts(structure, group.units[0], features, contactTesters, p.contacts);
        for (let j = 0, jl = group.units.length; j < jl; ++j) {
            const u = group.units[j];
            unitsFeatures.set(u.id, features);
            unitsContacts.set(u.id, intraUnitContacts);
        }
    }
    const contacts = findInterUnitContacts(structure, unitsFeatures, contactTesters, p.contacts);
    const interactions = { unitsFeatures, unitsContacts, contacts };
    refineInteractions(structure, interactions);
    return interactions;
}
function findUnitFeatures(structure, unit, featureProviders) {
    const count = unit.elements.length;
    const featuresBuilder = FeaturesBuilder.create(count, count / 2);
    if (Unit.isAtomic(unit)) {
        for (const fp of featureProviders) {
            fp.add(structure, unit, featuresBuilder);
        }
    }
    return featuresBuilder.getFeatures(count);
}
function findIntraUnitContacts(structure, unit, features, contactTesters, props) {
    const builder = IntraContactsBuilder.create(features, unit.elements.length);
    if (Unit.isAtomic(unit)) {
        addUnitContacts(structure, unit, features, builder, contactTesters, props);
    }
    return builder.getContacts();
}
function findInterUnitContacts(structure, unitsFeatures, contactTesters, props) {
    const builder = InterContactsBuilder.create();
    Structure.eachUnitPair(structure, (unitA, unitB) => {
        const featuresA = unitsFeatures.get(unitA.id);
        const featuresB = unitsFeatures.get(unitB.id);
        addStructureContacts(structure, unitA, featuresA, unitB, featuresB, builder, contactTesters, props);
    }, {
        maxRadius: Math.max(...contactTesters.map(t => t.maxDistance)),
        validUnit: (unit) => Unit.isAtomic(unit),
        validUnitPair: (unitA, unitB) => Structure.validUnitPair(structure, unitA, unitB)
    });
    return builder.getContacts(unitsFeatures);
}
