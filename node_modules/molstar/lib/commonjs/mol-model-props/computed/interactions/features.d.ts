/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureElement, Unit, Structure } from '../../../mol-model/structure/structure';
import { GridLookup3D } from '../../../mol-math/geometry';
import { OrderedSet } from '../../../mol-data/int';
import { FeatureGroup, FeatureType } from './common';
import { Vec3 } from '../../../mol-math/linear-algebra';
export { Features };
interface Features {
    /** number of features */
    readonly count: number;
    /** center x coordinate, in invariant coordinate space */
    readonly x: ArrayLike<number>;
    /** center y coordinate, in invariant coordinate space */
    readonly y: ArrayLike<number>;
    /** center z coordinate, in invariant coordinate space */
    readonly z: ArrayLike<number>;
    readonly types: ArrayLike<FeatureType>;
    readonly groups: ArrayLike<FeatureGroup>;
    readonly offsets: ArrayLike<number>;
    /** elements of this feature, range for feature i is offsets[i] to offsets[i + 1] */
    readonly members: ArrayLike<StructureElement.UnitIndex>;
    /** lookup3d based on center coordinates, in invariant coordinate space */
    readonly lookup3d: GridLookup3D<Features.FeatureIndex>;
    /** maps unit elements to features, range for unit element i is offsets[i] to offsets[i + 1] */
    readonly elementsIndex: Features.ElementsIndex;
    subset(types: ReadonlySet<FeatureType>): Features.Subset;
}
declare namespace Features {
    /** Index into Features data arrays */
    type FeatureIndex = {
        readonly '@type': 'feature-index';
    } & number;
    function setPosition(out: Vec3, unit: Unit, index: FeatureIndex, features: Features): Vec3;
    /** maps unit elements to features, range for unit element i is offsets[i] to offsets[i + 1] */
    type ElementsIndex = {
        /** feature indices */
        readonly indices: ArrayLike<FeatureIndex>;
        /** range for unit element i is offsets[i] to offsets[i + 1] */
        readonly offsets: ArrayLike<number>;
    };
    type Data = {
        count: number;
        x: ArrayLike<number>;
        y: ArrayLike<number>;
        z: ArrayLike<number>;
        types: ArrayLike<FeatureType>;
        groups: ArrayLike<FeatureGroup>;
        offsets: ArrayLike<number>;
        members: ArrayLike<StructureElement.UnitIndex>;
    };
    type Subset = {
        readonly indices: OrderedSet<FeatureIndex>;
        readonly lookup3d: GridLookup3D;
    };
    function createElementsIndex(data: Data, elementsCount: number): ElementsIndex;
    function create(elementsCount: number, data: Data): Features;
    function createSubset(data: Data, types: ReadonlySet<FeatureType>): Subset;
    interface Info {
        unit: Unit.Atomic;
        types: ArrayLike<FeatureType>;
        feature: FeatureIndex;
        x: ArrayLike<number>;
        y: ArrayLike<number>;
        z: ArrayLike<number>;
        members: ArrayLike<StructureElement.UnitIndex>;
        offsets: ArrayLike<number>;
        idealGeometry: Int8Array;
    }
    function Info(structure: Structure, unit: Unit.Atomic, features: Features): Info;
    function position(out: Vec3, info: Info): Vec3;
    function distance(infoA: Info, infoB: Info): number;
    interface Provider {
        types: Set<FeatureType>;
        add: (structure: Structure, unit: Unit.Atomic, featuresBuilder: FeaturesBuilder) => void;
    }
    function Provider(types: FeatureType[], add: Provider['add']): Provider;
}
export { FeaturesBuilder };
interface FeaturesBuilder {
    startState: () => void;
    pushMember: (x: number, y: number, z: number, member: StructureElement.UnitIndex) => void;
    finishState: (type: FeatureType, group: FeatureGroup) => void;
    add: (type: FeatureType, group: FeatureGroup, x: number, y: number, z: number, member: StructureElement.UnitIndex) => void;
    getFeatures: (elementsCount: number) => Features;
}
declare namespace FeaturesBuilder {
    function create(initialCount?: number, chunkSize?: number, features?: Features): FeaturesBuilder;
}
