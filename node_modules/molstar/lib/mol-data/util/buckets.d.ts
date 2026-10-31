/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { AssignableArrayLike } from '../../mol-util/type-helpers';
export interface MakeBucketsOptions<K> {
    sort?: boolean;
    start?: number;
    end?: number;
}
/**
 * Reorders indices so that the same keys are next to each other, [start, end)
 * Returns the offsets of buckets. So that [offsets[i], offsets[i + 1]) determines the range.
 */
export declare function makeBuckets<K extends string | number>(indices: AssignableArrayLike<number>, getKey: (i: number) => K, options?: MakeBucketsOptions<K>): ArrayLike<number>;
