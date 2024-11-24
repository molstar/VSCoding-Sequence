/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure } from '../../../mol-model/structure';
import { PairRestraints, PairRestraint } from '../pair-restraints';
import { CustomStructureProperty } from '../../common/custom-structure-property';
import { DataLocation } from '../../../mol-model/location';
import { DataLoci } from '../../../mol-model/loci';
import { Sphere3D } from '../../../mol-math/geometry';
export type CrossLinkRestraintValue = PairRestraints<CrossLinkRestraint>;
export declare const CrossLinkRestraintProvider: CustomStructureProperty.Provider<{}, CrossLinkRestraintValue>;
export { CrossLinkRestraint };
interface CrossLinkRestraint extends PairRestraint {
    readonly restraintType: 'harmonic' | 'upper bound' | 'lower bound';
    readonly distanceThreshold: number;
    readonly psi: number;
    readonly sigma1: number;
    readonly sigma2: number;
}
declare namespace CrossLinkRestraint {
    export enum Tag {
        CrossLinkRestraint = "cross-link-restraint"
    }
    export function isApplicable(structure: Structure): boolean;
    export function distance(pair: CrossLinkRestraint): number;
    type StructureCrossLinkRestraints = {
        readonly structure: Structure;
        readonly crossLinkRestraints: CrossLinkRestraintValue;
    };
    export type Element = number;
    export interface Location extends DataLocation<StructureCrossLinkRestraints, Element> {
    }
    export function Location(crossLinkRestraints: CrossLinkRestraintValue, structure: Structure, index?: number): Location;
    export function isLocation(x: any): x is Location;
    export function areLocationsEqual(locA: Location, locB: Location): boolean;
    export function locationLabel(location: Location): string;
    export interface Loci extends DataLoci<StructureCrossLinkRestraints, Element> {
    }
    export function Loci(structure: Structure, crossLinkRestraints: CrossLinkRestraintValue, elements: ReadonlyArray<Element>): Loci;
    export function isLoci(x: any): x is Loci;
    export function getBoundingSphere(crossLinkRestraints: CrossLinkRestraintValue, elements: ReadonlyArray<Element>, boundingSphere: Sphere3D): Sphere3D;
    export function getLabel(structure: Structure, crossLinkRestraints: CrossLinkRestraintValue, elements: ReadonlyArray<Element>): string;
    export {};
}
