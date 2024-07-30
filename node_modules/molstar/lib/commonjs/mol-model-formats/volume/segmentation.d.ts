/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Volume } from '../../mol-model/volume';
import { Task } from '../../mol-task';
import { ModelFormat } from '../format';
import { Segmentation_Data_Database } from '../../mol-io/reader/cif/schema/segmentation';
export declare function volumeFromSegmentationData(source: Segmentation_Data_Database, params?: Partial<{
    label: string;
    segmentLabels: {
        [id: number]: string;
    };
    ownerId: string;
}>): Task<Volume>;
export { SegcifFormat };
type SegcifFormat = ModelFormat<Segmentation_Data_Database>;
declare namespace SegcifFormat {
    function is(x?: ModelFormat): x is SegcifFormat;
    function create(segcif: Segmentation_Data_Database): SegcifFormat;
}
