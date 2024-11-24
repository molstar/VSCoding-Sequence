/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 * @author Cai Huiyu <szmun.caihy@gmail.com>
 */
import { Iterator } from '../../mol-data';
import { Vec3 } from '../../mol-math/linear-algebra';
import { Location } from '../../mol-model/location';
export interface LocationValue {
    location: Location;
    location2: Location;
    index: number;
    groupIndex: number;
    instanceIndex: number;
    isSecondary: boolean;
}
export interface LocationIterator extends Iterator<LocationValue> {
    readonly hasNext: boolean;
    readonly isNextNewInstance: boolean;
    readonly groupCount: number;
    readonly instanceCount: number;
    readonly count: number;
    readonly stride: number;
    readonly nonInstanceable: boolean;
    readonly hasLocation2: boolean;
    move(): LocationValue;
    reset(): void;
    skipInstance(): void;
    voidInstances(): void;
}
type LocationGetter = (groupIndex: number, instanceIndex: number) => Location;
type IsSecondaryGetter = (groupIndex: number, instanceIndex: number) => boolean;
export declare function LocationIterator(groupCount: number, instanceCount: number, stride: number, getLocation: LocationGetter, nonInstanceable?: boolean, isSecondary?: IsSecondaryGetter, getLocation2?: LocationGetter): LocationIterator;
export declare const EmptyLocationIterator: LocationIterator;
/** A position Location */
export interface PositionLocation {
    readonly kind: 'position-location';
    readonly position: Vec3;
    /** Normal vector at the position (used for surface coloring) */
    readonly normal: Vec3;
}
export declare function PositionLocation(position?: Vec3, normal?: Vec3): PositionLocation;
export declare function isPositionLocation(x: any): x is PositionLocation;
export {};
