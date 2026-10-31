/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export type Import = {
    save?: string;
    file?: string;
};
export declare function parseImportGet(s: string): Import[];
