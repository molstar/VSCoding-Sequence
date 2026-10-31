/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Russell Parker <russell@benchling.com>
 */
export interface FileNameInfo {
    path: string;
    name: string;
    ext: string;
    base: string;
    dir: string;
    protocol: string;
    query: string;
}
export declare function getFileNameInfo(fileName: string): FileNameInfo;
