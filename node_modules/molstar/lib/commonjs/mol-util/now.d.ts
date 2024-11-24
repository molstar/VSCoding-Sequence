/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
declare const now: () => now.Timestamp;
declare namespace now {
    type Timestamp = number & {
        '@type': 'now-timestamp';
    };
}
declare function formatTimespan(t: number, includeMsZeroes?: boolean): string;
export { now, formatTimespan };
