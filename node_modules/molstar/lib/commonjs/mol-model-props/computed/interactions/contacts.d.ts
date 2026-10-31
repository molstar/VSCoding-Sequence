/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure, Unit } from '../../../mol-model/structure';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { FeatureType, InteractionType } from './common';
import { InterContactsBuilder, IntraContactsBuilder } from './contacts-builder';
import { Features } from './features';
export declare const ContactsParams: {
    lineOfSightDistFactor: PD.Numeric;
};
export type ContactsParams = typeof ContactsParams;
export type ContactsProps = PD.Values<ContactsParams>;
export interface ContactProvider<P extends PD.Params> {
    readonly name: string;
    readonly params: P;
    createTester(props: PD.Values<P>): ContactTester;
}
export interface ContactTester {
    readonly maxDistance: number;
    readonly requiredFeatures: ReadonlySet<FeatureType>;
    getType: (structure: Structure, infoA: Features.Info, infoB: Features.Info, distanceSq: number) => InteractionType | undefined;
}
/**
 * Add all intra-unit contacts, i.e. pairs of features
 */
export declare function addUnitContacts(structure: Structure, unit: Unit.Atomic, features: Features, builder: IntraContactsBuilder, testers: ReadonlyArray<ContactTester>, props: ContactsProps): void;
/**
 * Add all inter-unit contacts, i.e. pairs of features
 */
export declare function addStructureContacts(structure: Structure, unitA: Unit.Atomic, featuresA: Features, unitB: Unit.Atomic, featuresB: Features, builder: InterContactsBuilder, testers: ReadonlyArray<ContactTester>, props: ContactsProps): void;
