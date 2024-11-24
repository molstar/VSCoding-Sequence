"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionsParams = exports.ContactProviderParams = exports.Interactions = void 0;
exports.computeInteractions = computeInteractions;
const param_definition_1 = require("../../../mol-util/param-definition");
const structure_1 = require("../../../mol-model/structure");
const features_1 = require("./features");
const valence_model_1 = require("../valence-model");
const common_1 = require("./common");
const contacts_builder_1 = require("./contacts-builder");
const int_1 = require("../../../mol-data/int");
const contacts_1 = require("./contacts");
const halogen_bonds_1 = require("./halogen-bonds");
const hydrogen_bonds_1 = require("./hydrogen-bonds");
const charged_1 = require("./charged");
const hydrophobic_1 = require("./hydrophobic");
const set_1 = require("../../../mol-util/set");
const metal_1 = require("./metal");
const refine_1 = require("./refine");
const location_1 = require("../../../mol-model/location");
const centroid_helper_1 = require("../../../mol-math/geometry/centroid-helper");
const loci_1 = require("../../../mol-model/loci");
const label_1 = require("../../../mol-theme/label");
const type_helpers_1 = require("../../../mol-util/type-helpers");
var Interactions;
(function (Interactions) {
    function Location(interactions, structure, unitA, indexA, unitB, indexB) {
        return (0, location_1.DataLocation)('interactions', { structure, interactions }, { unitA: unitA, indexA: indexA, unitB: unitB, indexB: indexB });
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
            return (0, common_1.interactionTypeLabel)(contacts.edgeProps.type[idx]);
        }
        else {
            const idx = contacts.getEdgeIndex(indexA, unitA.id, indexB, unitB.id);
            return (0, common_1.interactionTypeLabel)(contacts.edges[idx].props.type);
        }
    }
    function locationLabel(location) {
        return _label(location.data.interactions, location.element);
    }
    Interactions.locationLabel = locationLabel;
    function Loci(structure, interactions, elements) {
        return (0, loci_1.DataLoci)('interactions', { structure, interactions }, elements, (boundingSphere) => getBoundingSphere(interactions, elements, boundingSphere), () => getLabel(structure, interactions, elements));
    }
    Interactions.Loci = Loci;
    function isLoci(x) {
        return !!x && x.kind === 'data-loci' && x.tag === 'interactions';
    }
    Interactions.isLoci = isLoci;
    function getBoundingSphere(interactions, elements, boundingSphere) {
        const { unitsFeatures } = interactions;
        return centroid_helper_1.CentroidHelper.fromPairProvider(elements.length, (i, pA, pB) => {
            const e = elements[i];
            features_1.Features.setPosition(pA, e.unitA, e.indexA, unitsFeatures.get(e.unitA.id));
            features_1.Features.setPosition(pB, e.unitB, e.indexB, unitsFeatures.get(e.unitB.id));
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
            (0, label_1.bondLabel)(structure_1.Bond.Location(structure, unitA, mA[oA[indexA]], structure, unitB, mB[oB[indexB]]), options)
        ].join('</br>');
    }
    Interactions.getLabel = getLabel;
})(Interactions || (exports.Interactions = Interactions = {}));
const FeatureProviders = [
    hydrogen_bonds_1.HydrogenDonorProvider, hydrogen_bonds_1.WeakHydrogenDonorProvider, hydrogen_bonds_1.HydrogenAcceptorProvider,
    charged_1.NegativChargeProvider, charged_1.PositiveChargeProvider, charged_1.AromaticRingProvider,
    halogen_bonds_1.HalogenDonorProvider, halogen_bonds_1.HalogenAcceptorProvider,
    hydrophobic_1.HydrophobicAtomProvider,
    metal_1.MetalProvider, metal_1.MetalBindingProvider,
];
const ContactProviders = {
    'ionic': charged_1.IonicProvider,
    'pi-stacking': charged_1.PiStackingProvider,
    'cation-pi': charged_1.CationPiProvider,
    'halogen-bonds': halogen_bonds_1.HalogenBondsProvider,
    'hydrogen-bonds': hydrogen_bonds_1.HydrogenBondsProvider,
    'weak-hydrogen-bonds': hydrogen_bonds_1.WeakHydrogenBondsProvider,
    'hydrophobic': hydrophobic_1.HydrophobicProvider,
    'metal-coordination': metal_1.MetalCoordinationProvider,
};
function getProvidersParams(defaultOn = []) {
    const params = Object.create(null);
    Object.keys(ContactProviders).forEach(k => {
        params[k] = param_definition_1.ParamDefinition.MappedStatic(defaultOn.includes(k) ? 'on' : 'off', {
            on: param_definition_1.ParamDefinition.Group(ContactProviders[k].params),
            off: param_definition_1.ParamDefinition.Group({})
        }, { cycle: true });
    });
    return params;
}
exports.ContactProviderParams = getProvidersParams([
    // 'ionic',
    'cation-pi',
    'pi-stacking',
    'hydrogen-bonds',
    'halogen-bonds',
    // 'hydrophobic',
    'metal-coordination',
    // 'weak-hydrogen-bonds',
]);
exports.InteractionsParams = {
    providers: param_definition_1.ParamDefinition.Group(exports.ContactProviderParams, { isFlat: true }),
    contacts: param_definition_1.ParamDefinition.Group(contacts_1.ContactsParams, { label: 'Advanced Options' }),
};
async function computeInteractions(ctx, structure, props) {
    const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.InteractionsParams), ...props };
    await valence_model_1.ValenceModelProvider.attach(ctx, structure);
    const contactTesters = [];
    (0, type_helpers_1.ObjectKeys)(ContactProviders).forEach(k => {
        const { name, params } = p.providers[k];
        if (name === 'on') {
            contactTesters.push(ContactProviders[k].createTester(params));
        }
    });
    const requiredFeatures = new Set();
    contactTesters.forEach(l => set_1.SetUtils.add(requiredFeatures, l.requiredFeatures));
    const featureProviders = FeatureProviders.filter(f => set_1.SetUtils.areIntersecting(requiredFeatures, f.types));
    const unitsFeatures = int_1.IntMap.Mutable();
    const unitsContacts = int_1.IntMap.Mutable();
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
    (0, refine_1.refineInteractions)(structure, interactions);
    return interactions;
}
function findUnitFeatures(structure, unit, featureProviders) {
    const count = unit.elements.length;
    const featuresBuilder = features_1.FeaturesBuilder.create(count, count / 2);
    if (structure_1.Unit.isAtomic(unit)) {
        for (const fp of featureProviders) {
            fp.add(structure, unit, featuresBuilder);
        }
    }
    return featuresBuilder.getFeatures(count);
}
function findIntraUnitContacts(structure, unit, features, contactTesters, props) {
    const builder = contacts_builder_1.IntraContactsBuilder.create(features, unit.elements.length);
    if (structure_1.Unit.isAtomic(unit)) {
        (0, contacts_1.addUnitContacts)(structure, unit, features, builder, contactTesters, props);
    }
    return builder.getContacts();
}
function findInterUnitContacts(structure, unitsFeatures, contactTesters, props) {
    const builder = contacts_builder_1.InterContactsBuilder.create();
    structure_1.Structure.eachUnitPair(structure, (unitA, unitB) => {
        const featuresA = unitsFeatures.get(unitA.id);
        const featuresB = unitsFeatures.get(unitB.id);
        (0, contacts_1.addStructureContacts)(structure, unitA, featuresA, unitB, featuresB, builder, contactTesters, props);
    }, {
        maxRadius: Math.max(...contactTesters.map(t => t.maxDistance)),
        validUnit: (unit) => structure_1.Unit.isAtomic(unit),
        validUnitPair: (unitA, unitB) => structure_1.Structure.validUnitPair(structure, unitA, unitB)
    });
    return builder.getContacts(unitsFeatures);
}
