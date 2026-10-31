"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureGroup = exports.FeatureTypes = exports.InteractionType = exports.InteractionFlag = exports.InteractionsInterContacts = exports.InteractionsIntraContacts = void 0;
exports.interactionTypeLabel = interactionTypeLabel;
exports.featureTypeLabel = featureTypeLabel;
exports.featureGroupLabel = featureGroupLabel;
const inter_unit_graph_1 = require("../../../mol-math/graph/inter-unit-graph");
var InteractionsIntraContacts;
(function (InteractionsIntraContacts) {
    /**
     * Note: assumes that feature members of a contact are non-overlapping
     */
    function createElementsIndex(contacts, features, elementsCount) {
        const offsets = new Int32Array(elementsCount + 1);
        const bucketFill = new Int32Array(elementsCount);
        const bucketSizes = new Int32Array(elementsCount);
        const { members, offsets: featureOffsets } = features;
        for (let i = 0, il = contacts.edgeCount * 2; i < il; ++i) {
            const aI = contacts.a[i];
            const bI = contacts.b[i];
            if (aI > bI)
                continue;
            for (let j = featureOffsets[aI], jl = featureOffsets[aI + 1]; j < jl; ++j) {
                ++bucketSizes[members[j]];
            }
            for (let j = featureOffsets[bI], jl = featureOffsets[bI + 1]; j < jl; ++j) {
                ++bucketSizes[members[j]];
            }
        }
        let offset = 0;
        for (let i = 0; i < elementsCount; i++) {
            offsets[i] = offset;
            offset += bucketSizes[i];
        }
        offsets[elementsCount] = offset;
        const indices = new Int32Array(offset);
        for (let i = 0, il = contacts.edgeCount * 2; i < il; ++i) {
            const aI = contacts.a[i];
            const bI = contacts.b[i];
            if (aI > bI)
                continue;
            for (let j = featureOffsets[aI], jl = featureOffsets[aI + 1]; j < jl; ++j) {
                const m = members[j];
                const om = offsets[m] + bucketFill[m];
                indices[om] = i;
                ++bucketFill[m];
            }
            for (let j = featureOffsets[bI], jl = featureOffsets[bI + 1]; j < jl; ++j) {
                const m = members[j];
                const om = offsets[m] + bucketFill[m];
                indices[om] = i;
                ++bucketFill[m];
            }
        }
        return { indices, offsets };
    }
    InteractionsIntraContacts.createElementsIndex = createElementsIndex;
})(InteractionsIntraContacts || (exports.InteractionsIntraContacts = InteractionsIntraContacts = {}));
class InteractionsInterContacts extends inter_unit_graph_1.InterUnitGraph {
    getContactIndicesForElement(index, unit) {
        return this.elementKeyIndex.get(this.getElementKey(index, unit.id)) || [];
    }
    getElementKey(index, unitId) {
        return `${index}|${unitId}`;
    }
    constructor(map, unitsFeatures) {
        super(map);
        this.elementKeyIndex = new Map();
        for (let i = 0, il = this.edges.length; i < il; ++i) {
            const { unitA, indexA } = this.edges[i];
            const { offsets, members } = unitsFeatures.get(unitA);
            for (let j = offsets[indexA], jl = offsets[indexA + 1]; j < jl; ++j) {
                const vertexKey = this.getElementKey(members[j], unitA);
                const e = this.elementKeyIndex.get(vertexKey);
                if (e === undefined) {
                    this.elementKeyIndex.set(vertexKey, [i]);
                }
                else {
                    e.push(i);
                }
            }
        }
    }
}
exports.InteractionsInterContacts = InteractionsInterContacts;
var InteractionFlag;
(function (InteractionFlag) {
    InteractionFlag[InteractionFlag["None"] = 0] = "None";
    InteractionFlag[InteractionFlag["Filtered"] = 1] = "Filtered";
})(InteractionFlag || (exports.InteractionFlag = InteractionFlag = {}));
var InteractionType;
(function (InteractionType) {
    InteractionType[InteractionType["Unknown"] = 0] = "Unknown";
    InteractionType[InteractionType["Ionic"] = 1] = "Ionic";
    InteractionType[InteractionType["CationPi"] = 2] = "CationPi";
    InteractionType[InteractionType["PiStacking"] = 3] = "PiStacking";
    InteractionType[InteractionType["HydrogenBond"] = 4] = "HydrogenBond";
    InteractionType[InteractionType["HalogenBond"] = 5] = "HalogenBond";
    InteractionType[InteractionType["Hydrophobic"] = 6] = "Hydrophobic";
    InteractionType[InteractionType["MetalCoordination"] = 7] = "MetalCoordination";
    InteractionType[InteractionType["WeakHydrogenBond"] = 8] = "WeakHydrogenBond";
})(InteractionType || (exports.InteractionType = InteractionType = {}));
function interactionTypeLabel(type) {
    switch (type) {
        case InteractionType.HydrogenBond:
            return 'Hydrogen Bond';
        case InteractionType.Hydrophobic:
            return 'Hydrophobic Contact';
        case InteractionType.HalogenBond:
            return 'Halogen Bond';
        case InteractionType.Ionic:
            return 'Ionic Interaction';
        case InteractionType.MetalCoordination:
            return 'Metal Coordination';
        case InteractionType.CationPi:
            return 'Cation-Pi Interaction';
        case InteractionType.PiStacking:
            return 'Pi Stacking';
        case InteractionType.WeakHydrogenBond:
            return 'Weak Hydrogen Bond';
        case InteractionType.Unknown:
            return 'Unknown Interaction';
    }
}
// to use with isolatedModules
var FeatureTypes;
(function (FeatureTypes) {
    FeatureTypes[FeatureTypes["None"] = 0] = "None";
    FeatureTypes[FeatureTypes["PositiveCharge"] = 1] = "PositiveCharge";
    FeatureTypes[FeatureTypes["NegativeCharge"] = 2] = "NegativeCharge";
    FeatureTypes[FeatureTypes["AromaticRing"] = 3] = "AromaticRing";
    FeatureTypes[FeatureTypes["HydrogenDonor"] = 4] = "HydrogenDonor";
    FeatureTypes[FeatureTypes["HydrogenAcceptor"] = 5] = "HydrogenAcceptor";
    FeatureTypes[FeatureTypes["HalogenDonor"] = 6] = "HalogenDonor";
    FeatureTypes[FeatureTypes["HalogenAcceptor"] = 7] = "HalogenAcceptor";
    FeatureTypes[FeatureTypes["HydrophobicAtom"] = 8] = "HydrophobicAtom";
    FeatureTypes[FeatureTypes["WeakHydrogenDonor"] = 9] = "WeakHydrogenDonor";
    FeatureTypes[FeatureTypes["IonicTypePartner"] = 10] = "IonicTypePartner";
    FeatureTypes[FeatureTypes["DativeBondPartner"] = 11] = "DativeBondPartner";
    FeatureTypes[FeatureTypes["TransitionMetal"] = 12] = "TransitionMetal";
    FeatureTypes[FeatureTypes["IonicTypeMetal"] = 13] = "IonicTypeMetal";
})(FeatureTypes || (exports.FeatureTypes = FeatureTypes = {}));
function featureTypeLabel(type) {
    switch (type) {
        case 0 /* FeatureType.None */:
            return 'None';
        case 1 /* FeatureType.PositiveCharge */:
            return 'Positive Charge';
        case 2 /* FeatureType.NegativeCharge */:
            return 'Negative Charge';
        case 3 /* FeatureType.AromaticRing */:
            return 'Aromatic Ring';
        case 4 /* FeatureType.HydrogenDonor */:
            return 'Hydrogen Donor';
        case 5 /* FeatureType.HydrogenAcceptor */:
            return 'Hydrogen Acceptor';
        case 6 /* FeatureType.HalogenDonor */:
            return 'Halogen Donor';
        case 7 /* FeatureType.HalogenAcceptor */:
            return 'Halogen Acceptor';
        case 8 /* FeatureType.HydrophobicAtom */:
            return 'HydrophobicAtom';
        case 9 /* FeatureType.WeakHydrogenDonor */:
            return 'Weak Hydrogen Donor';
        case 10 /* FeatureType.IonicTypePartner */:
            return 'Ionic Type Partner';
        case 11 /* FeatureType.DativeBondPartner */:
            return 'Dative Bond Partner';
        case 12 /* FeatureType.TransitionMetal */:
            return 'Transition Metal';
        case 13 /* FeatureType.IonicTypeMetal */:
            return 'Ionic Type Metal';
    }
}
var FeatureGroup;
(function (FeatureGroup) {
    FeatureGroup[FeatureGroup["None"] = 0] = "None";
    FeatureGroup[FeatureGroup["QuaternaryAmine"] = 1] = "QuaternaryAmine";
    FeatureGroup[FeatureGroup["TertiaryAmine"] = 2] = "TertiaryAmine";
    FeatureGroup[FeatureGroup["Sulfonium"] = 3] = "Sulfonium";
    FeatureGroup[FeatureGroup["SulfonicAcid"] = 4] = "SulfonicAcid";
    FeatureGroup[FeatureGroup["Sulfate"] = 5] = "Sulfate";
    FeatureGroup[FeatureGroup["Phosphate"] = 6] = "Phosphate";
    FeatureGroup[FeatureGroup["Halocarbon"] = 7] = "Halocarbon";
    FeatureGroup[FeatureGroup["Guanidine"] = 8] = "Guanidine";
    FeatureGroup[FeatureGroup["Acetamidine"] = 9] = "Acetamidine";
    FeatureGroup[FeatureGroup["Carboxylate"] = 10] = "Carboxylate";
})(FeatureGroup || (exports.FeatureGroup = FeatureGroup = {}));
function featureGroupLabel(group) {
    switch (group) {
        case FeatureGroup.None:
            return 'None';
        case FeatureGroup.QuaternaryAmine:
            return 'Quaternary Amine';
        case FeatureGroup.TertiaryAmine:
            return 'Tertiary Amine';
        case FeatureGroup.Sulfonium:
            return 'Sulfonium';
        case FeatureGroup.SulfonicAcid:
            return 'Sulfonic Acid';
        case FeatureGroup.Sulfate:
            return 'Sulfate';
        case FeatureGroup.Phosphate:
            return 'Phosphate';
        case FeatureGroup.Halocarbon:
            return 'Halocarbon';
        case FeatureGroup.Guanidine:
            return 'Guanidine';
        case FeatureGroup.Acetamidine:
            return 'Acetamidine';
        case FeatureGroup.Carboxylate:
            return 'Carboxylate';
    }
}
