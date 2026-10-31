/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 *
 * based in part on NGL (https://github.com/arose/ngl)
 */
import { InteractionType, InteractionFlag } from './common';
import { Unit } from '../../../mol-model/structure';
import { Features } from './features';
export function refineInteractions(structure, interactions) {
    const { contacts, unitsContacts, unitsFeatures } = interactions;
    const contactRefiners = [
        hydrophobicRefiner(structure, interactions),
        weakHydrogenBondsRefiner(structure, interactions),
        saltBridgeRefiner(structure, interactions),
        piStackingRefiner(structure, interactions),
        metalCoordinationRefiner(structure, interactions),
    ];
    for (let i = 0, il = contacts.edgeCount; i < il; ++i) {
        const e = contacts.edges[i];
        const uA = structure.unitMap.get(e.unitA);
        const uB = structure.unitMap.get(e.unitB);
        const infoA = Features.Info(structure, uA, unitsFeatures.get(e.unitA));
        infoA.feature = e.indexA;
        const infoB = Features.Info(structure, uB, unitsFeatures.get(e.unitB));
        infoB.feature = e.indexB;
        for (const refiner of contactRefiners) {
            if (refiner.isApplicable(e.props.type))
                refiner.handleInterContact(i, infoA, infoB);
        }
    }
    //
    const ucKeys = unitsContacts.keys();
    while (true) {
        const { done, value } = ucKeys.next();
        if (done)
            break;
        const contacts = unitsContacts.get(value);
        const features = unitsFeatures.get(value);
        const unit = structure.unitMap.get(value);
        if (!Unit.isAtomic(unit))
            continue;
        const infoA = Features.Info(structure, unit, features);
        const infoB = Features.Info(structure, unit, features);
        for (const refiner of contactRefiners)
            refiner.startUnit(unit, contacts, features);
        for (let i = 0, il = contacts.edgeCount * 2; i < il; ++i) {
            infoA.feature = contacts.a[i];
            infoB.feature = contacts.b[i];
            // console.log(i, contacts.a[i], contacts.b[i])
            for (const refiner of contactRefiners) {
                if (refiner.isApplicable(contacts.edgeProps.type[i]))
                    refiner.handleIntraContact(i, infoA, infoB);
            }
        }
    }
}
/**
 * For atoms interacting with several atoms in the same residue
 * only the one with the closest distance is kept.
 */
function hydrophobicRefiner(structure, interactions) {
    const { contacts } = interactions;
    /* keep only closest contact between residues */
    const handleResidueContact = function (dist, edge, key, map, set) {
        const [minDist, minIndex] = map.get(key) || [Infinity, -1];
        if (dist < minDist) {
            if (minIndex !== -1)
                set(minIndex);
            map.set(key, [dist, edge]);
        }
        else {
            set(edge);
        }
    };
    function handleEdge(edge, infoA, infoB, map, set) {
        const elementA = infoA.members[infoA.offsets[infoA.feature]];
        const elementB = infoB.members[infoB.offsets[infoB.feature]];
        const residueA = infoA.unit.getResidueIndex(elementA);
        const residueB = infoB.unit.getResidueIndex(elementB);
        const keyA = `${elementA}|${infoA.unit.id}|${residueB}|${infoB.unit.id}|A`;
        const keyB = `${elementB}|${infoB.unit.id}|${residueA}|${infoA.unit.id}|B`;
        const dist = Features.distance(infoA, infoB);
        handleResidueContact(dist, edge, keyA, map, set);
        handleResidueContact(dist, edge, keyB, map, set);
    }
    const residueInterMap = new Map();
    const setInterFiltered = (i) => contacts.edges[i].props.flag = InteractionFlag.Filtered;
    let residueIntraMap;
    let setIntraFiltered;
    return {
        isApplicable: (type) => type === InteractionType.Hydrophobic,
        handleInterContact: (index, infoA, infoB) => {
            handleEdge(index, infoA, infoB, residueInterMap, setInterFiltered);
        },
        startUnit: (unit, contacts, features) => {
            residueIntraMap = new Map();
            setIntraFiltered = (i) => contacts.edgeProps.flag[i] = InteractionFlag.Filtered;
        },
        handleIntraContact: (index, infoA, infoB) => {
            handleEdge(index, infoA, infoB, residueIntraMap, setIntraFiltered);
        }
    };
}
/**
 * Remove weak hydrogen bonds when the acceptor is involved in
 * a normal/strong hydrogen bond
 */
function weakHydrogenBondsRefiner(structure, interactions) {
    const { contacts } = interactions;
    const hasHydrogenBond = (infoA, infoB) => {
        const acc = infoA.types[infoA.feature] === 9 /* FeatureType.WeakHydrogenDonor */ ? infoB : infoA;
        // check intra
        const eI = acc.members[acc.offsets[acc.feature]];
        const { edgeProps: { type }, elementsIndex: { offsets, indices } } = interactions.unitsContacts.get(acc.unit.id);
        for (let i = offsets[eI], il = offsets[eI + 1]; i < il; ++i) {
            if (type[indices[i]] === InteractionType.HydrogenBond)
                return true;
        }
        // check inter
        const interIndices = contacts.getEdgeIndices(acc.feature, acc.unit.id);
        for (let i = 0, il = interIndices.length; i < il; ++i) {
            if (contacts.edges[interIndices[i]].props.type === InteractionType.HydrogenBond)
                return true;
        }
        return false;
    };
    return {
        isApplicable: (type) => type === InteractionType.WeakHydrogenBond,
        handleInterContact: (index, infoA, infoB) => {
            if (hasHydrogenBond(infoA, infoB)) {
                contacts.edges[index].props.flag = InteractionFlag.Filtered;
            }
        },
        startUnit: () => { },
        handleIntraContact: (index, infoA, infoB) => {
            if (hasHydrogenBond(infoA, infoB)) {
                const { flag } = interactions.unitsContacts.get(infoA.unit.id).edgeProps;
                flag[index] = InteractionFlag.Filtered;
            }
        }
    };
}
/**
 * Filter inter-unit contact `index` if there is a contact of `types` between its members
 */
function filterInter(types, index, infoA, infoB, contacts) {
    const { offsets: offsetsA, feature: featureA } = infoA;
    const { offsets: offsetsB, feature: featureB } = infoB;
    for (let i = offsetsA[featureA], il = offsetsA[featureA + 1]; i < il; ++i) {
        const aI = infoA.members[i];
        const indices = contacts.getContactIndicesForElement(aI, infoA.unit);
        for (let k = 0, kl = indices.length; k < kl; ++k) {
            const cI = indices[k];
            if (types.includes(contacts.edges[cI].props.type)) {
                for (let j = offsetsB[featureB], jl = offsetsB[featureB + 1]; j < jl; ++j) {
                    const bI = infoB.members[j];
                    if (contacts.getContactIndicesForElement(bI, infoB.unit).includes(cI)) {
                        contacts.edges[index].props.flag = InteractionFlag.Filtered;
                        return;
                    }
                }
            }
        }
    }
}
/**
 * Filter intra-unit contact `index` if there is a contact of `types` between its members
 */
function filterIntra(types, index, infoA, infoB, contacts) {
    const { edgeProps: { type, flag }, elementsIndex: { offsets, indices } } = contacts;
    const { offsets: offsetsA, feature: featureA } = infoA;
    const { offsets: offsetsB, feature: featureB } = infoB;
    for (let i = offsetsA[featureA], il = offsetsA[featureA + 1]; i < il; ++i) {
        const aI = infoA.members[i];
        for (let k = offsets[aI], kl = offsets[aI + 1]; k < kl; ++k) {
            const cI = indices[k];
            if (types.includes(type[cI])) {
                for (let j = offsetsB[featureB], jl = offsetsB[featureB + 1]; j < jl; ++j) {
                    const bI = infoB.members[j];
                    for (let l = offsets[bI], ll = offsets[bI + 1]; l < ll; ++l) {
                        if (cI === indices[l]) {
                            flag[index] = InteractionFlag.Filtered;
                            return;
                        }
                    }
                }
            }
        }
    }
}
/**
 * Remove hydrogen bonds (normal and weak) between groups that also form
 * an ionic interaction between each other
 */
function saltBridgeRefiner(structure, interactions) {
    const { contacts } = interactions;
    return {
        isApplicable: (type) => type === InteractionType.Ionic,
        handleInterContact: (index, infoA, infoB) => {
            filterInter([InteractionType.HydrogenBond, InteractionType.WeakHydrogenBond], index, infoA, infoB, contacts);
        },
        startUnit: () => { },
        handleIntraContact: (index, infoA, infoB) => {
            filterIntra([InteractionType.HydrogenBond, InteractionType.WeakHydrogenBond], index, infoA, infoB, interactions.unitsContacts.get(infoA.unit.id));
        }
    };
}
/**
 * Remove hydrophobic and cation-pi interactions between groups that also form
 * a pi-stacking interaction between each other
 */
function piStackingRefiner(structure, interactions) {
    const { contacts } = interactions;
    return {
        isApplicable: (type) => type === InteractionType.Hydrophobic || type === InteractionType.CationPi,
        handleInterContact: (index, infoA, infoB) => {
            filterInter([InteractionType.PiStacking], index, infoA, infoB, contacts);
        },
        startUnit: () => { },
        handleIntraContact: (index, infoA, infoB) => {
            filterIntra([InteractionType.PiStacking], index, infoA, infoB, interactions.unitsContacts.get(infoA.unit.id));
        }
    };
}
/**
 * Remove ionic interactions between groups that also form
 * a metal coordination between each other
 */
function metalCoordinationRefiner(structure, interactions) {
    const { contacts } = interactions;
    return {
        isApplicable: (type) => type === InteractionType.Ionic,
        handleInterContact: (index, infoA, infoB) => {
            filterInter([InteractionType.MetalCoordination], index, infoA, infoB, contacts);
        },
        startUnit: () => { },
        handleIntraContact: (index, infoA, infoB) => {
            filterIntra([InteractionType.MetalCoordination], index, infoA, infoB, interactions.unitsContacts.get(infoA.unit.id));
        }
    };
}
