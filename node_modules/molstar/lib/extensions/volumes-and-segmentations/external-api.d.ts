/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
/** Try to get author-defined contour value for isosurface from EMDB API. Return relative value 1.0, if not applicable or fails.  */
export declare function tryGetIsovalue(entryId: string): Promise<{
    kind: 'absolute' | 'relative';
    value: number;
} | undefined>;
export declare function getPdbIdsForEmdbEntry(entryId: string): Promise<string[]>;
