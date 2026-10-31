/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { DensityServer_Data_Database } from '../../mol-io/reader/cif/schema/density-server';
import { Volume } from '../../mol-model/volume';
import { Task } from '../../mol-task';
import { ModelFormat } from '../format';
export declare function volumeFromDensityServerData(source: DensityServer_Data_Database, params?: Partial<{
    label: string;
    entryId: string;
}>): Task<Volume>;
export { DscifFormat };
type DscifFormat = ModelFormat<DensityServer_Data_Database>;
declare namespace DscifFormat {
    function is(x?: ModelFormat): x is DscifFormat;
    function create(dscif: DensityServer_Data_Database): DscifFormat;
}
