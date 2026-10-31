/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Gianluca Tomasello <giagitom@gmail.com>
 * @author Cai Huiyu <szmun.caihy@gmail.com>
 */
import { Vec3 } from '../../mol-math/linear-algebra';
import { NullLocation } from '../../mol-model/location';
export function LocationIterator(groupCount, instanceCount, stride, getLocation, nonInstanceable = false, isSecondary = () => false, getLocation2) {
    if (groupCount % stride !== 0) {
        throw new Error('incompatible groupCount and stride');
    }
    const value = {
        location: NullLocation,
        location2: NullLocation,
        index: 0,
        groupIndex: 0,
        instanceIndex: 0,
        isSecondary: false
    };
    let hasNext = value.groupIndex < groupCount;
    let isNextNewInstance = false;
    let groupIndex = 0;
    let instanceIndex = 0;
    let voidInstances = false;
    const hasLocation2 = !!getLocation2;
    return {
        get hasNext() { return hasNext; },
        get isNextNewInstance() { return isNextNewInstance; },
        groupCount,
        instanceCount,
        count: groupCount * instanceCount,
        stride,
        nonInstanceable,
        hasLocation2,
        move() {
            if (hasNext) {
                value.groupIndex = groupIndex;
                value.instanceIndex = instanceIndex;
                value.index = instanceIndex * groupCount + groupIndex;
                value.location = getLocation(groupIndex, voidInstances ? -1 : instanceIndex);
                if (hasLocation2)
                    value.location2 = getLocation2(groupIndex, voidInstances ? -1 : instanceIndex);
                value.isSecondary = isSecondary(groupIndex, voidInstances ? -1 : instanceIndex);
                groupIndex += stride;
                if (groupIndex === groupCount) {
                    ++instanceIndex;
                    isNextNewInstance = true;
                    if (instanceIndex < instanceCount)
                        groupIndex = 0;
                }
                else {
                    isNextNewInstance = false;
                }
                hasNext = groupIndex < groupCount;
            }
            return value;
        },
        reset() {
            value.location = NullLocation;
            value.location2 = NullLocation;
            value.index = 0;
            value.groupIndex = 0;
            value.instanceIndex = 0;
            value.isSecondary = false;
            hasNext = value.groupIndex < groupCount;
            isNextNewInstance = false;
            groupIndex = 0;
            instanceIndex = 0;
            voidInstances = false;
        },
        skipInstance() {
            if (hasNext && value.instanceIndex === instanceIndex) {
                ++instanceIndex;
                groupIndex = 0;
                hasNext = instanceIndex < instanceCount;
            }
        },
        voidInstances() {
            voidInstances = true;
        }
    };
}
export const EmptyLocationIterator = {
    get hasNext() { return false; },
    get isNextNewInstance() { return false; },
    groupCount: 0,
    instanceCount: 0,
    count: 0,
    stride: 0,
    nonInstanceable: false,
    hasLocation2: false,
    move() {
        return {
            location: NullLocation,
            location2: NullLocation,
            index: 0,
            groupIndex: 0,
            instanceIndex: 0,
            isSecondary: false
        };
    },
    reset() { },
    skipInstance() { },
    voidInstances() { }
};
export function PositionLocation(position, normal) {
    return {
        kind: 'position-location',
        position: position ? Vec3.clone(position) : Vec3(),
        normal: normal ? Vec3.clone(normal) : Vec3()
    };
}
export function isPositionLocation(x) {
    return !!x && x.kind === 'position-location';
}
