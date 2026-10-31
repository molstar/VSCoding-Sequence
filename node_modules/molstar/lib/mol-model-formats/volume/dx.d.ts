/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { DxFile } from '../../mol-io/reader/dx/parser';
import { Volume } from '../../mol-model/volume';
import { Task } from '../../mol-task';
import { ModelFormat } from '../format';
export declare function volumeFromDx(source: DxFile, params?: {
    label?: string;
    entryId?: string;
}): Task<Volume>;
export { DxFormat };
type DxFormat = ModelFormat<DxFile>;
declare namespace DxFormat {
    function is(x?: ModelFormat): x is DxFormat;
    function create(dx: DxFile): DxFormat;
}
