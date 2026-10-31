/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Features } from './features';
import { InteractionType, InteractionsIntraContacts, InteractionsInterContacts } from './common';
import { Unit } from '../../../mol-model/structure/structure';
import { IntMap } from '../../../mol-data/int';
export { IntraContactsBuilder };
interface IntraContactsBuilder {
    add: (indexA: Features.FeatureIndex, indexB: Features.FeatureIndex, type: InteractionType) => void;
    getContacts: () => InteractionsIntraContacts;
}
declare namespace IntraContactsBuilder {
    function create(features: Features, elementsCount: number): IntraContactsBuilder;
}
export { InterContactsBuilder };
interface InterContactsBuilder {
    startUnitPair: (unitA: Unit, unitB: Unit) => void;
    finishUnitPair: () => void;
    add: (indexA: Features.FeatureIndex, indexB: Features.FeatureIndex, type: InteractionType) => void;
    getContacts: (unitsFeatures: IntMap<Features>) => InteractionsInterContacts;
}
declare namespace InterContactsBuilder {
    function create(): InterContactsBuilder;
}
