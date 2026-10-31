"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetUtils = void 0;
// make use of https://github.com/tc39/proposal-set-methods once available
var SetUtils;
(function (SetUtils) {
    function toArray(set) {
        return Array.from(set.values());
    }
    SetUtils.toArray = toArray;
    /** Test if set a contains all elements of set b. */
    function isSuperset(setA, setB) {
        if (setA === setB)
            return true;
        if (setA.size < setB.size)
            return false;
        for (const elem of setB) {
            if (!setA.has(elem))
                return false;
        }
        return true;
    }
    SetUtils.isSuperset = isSuperset;
    /** Add all elements from `sets` to `out` */
    function add(out, ...sets) {
        for (let i = 0; i < sets.length; i++) {
            for (const elem of sets[i])
                out.add(elem);
        }
        return out;
    }
    SetUtils.add = add;
    /** Create set containing elements of both set a and set b. */
    function union(setA, setB) {
        const union = new Set(setA);
        if (setA === setB)
            return union;
        for (const elem of setB)
            union.add(elem);
        return union;
    }
    SetUtils.union = union;
    function unionMany(...sets) {
        if (sets.length === 0)
            return new Set();
        const union = new Set(sets[0]);
        for (let i = 1, il = sets.length; i < il; i++) {
            for (const elem of sets[i])
                union.add(elem);
        }
        return union;
    }
    SetUtils.unionMany = unionMany;
    function unionManyArrays(arrays) {
        if (arrays.length === 0)
            return new Set();
        const union = new Set(arrays[0]);
        for (let i = 1; i < arrays.length; i++) {
            for (const elem of arrays[i])
                union.add(elem);
        }
        return union;
    }
    SetUtils.unionManyArrays = unionManyArrays;
    /** Create set containing elements of set a that are also in set b. */
    function intersection(setA, setB) {
        if (setA === setB)
            return new Set(setA);
        const intersection = new Set();
        for (const elem of setB) {
            if (setA.has(elem))
                intersection.add(elem);
        }
        return intersection;
    }
    SetUtils.intersection = intersection;
    function areIntersecting(setA, setB) {
        if (setA === setB)
            return setA.size > 0;
        if (setA.size < setB.size)
            [setA, setB] = [setB, setA];
        for (const elem of setB) {
            if (setA.has(elem))
                return true;
        }
        return false;
    }
    SetUtils.areIntersecting = areIntersecting;
    function intersectionSize(setA, setB) {
        if (setA === setB)
            return setA.size;
        if (setA.size < setB.size)
            [setA, setB] = [setB, setA];
        let count = 0;
        for (const elem of setB) {
            if (setA.has(elem))
                count += 1;
        }
        return count;
    }
    SetUtils.intersectionSize = intersectionSize;
    /** Create set containing elements of set a that are not in set b. */
    function difference(setA, setB) {
        if (setA === setB)
            return new Set();
        const difference = new Set(setA);
        for (const elem of setB)
            difference.delete(elem);
        return difference;
    }
    SetUtils.difference = difference;
    /** Number of elements that are in set a but not in set b. */
    function differenceSize(setA, setB) {
        if (setA === setB)
            return 0;
        let count = setA.size;
        for (const elem of setA) {
            if (setB.has(elem))
                count -= 1;
        }
        return count;
    }
    SetUtils.differenceSize = differenceSize;
    /** Test if set a and b contain the same elements. */
    function areEqual(setA, setB) {
        if (setA === setB)
            return true;
        if (setA.size !== setB.size)
            return false;
        for (const elem of setB) {
            if (!setA.has(elem))
                return false;
        }
        return true;
    }
    SetUtils.areEqual = areEqual;
})(SetUtils || (exports.SetUtils = SetUtils = {}));
