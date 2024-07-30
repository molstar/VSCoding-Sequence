/**
 * Copyright (c) 2017-2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CifWriter } from '../../../../mol-io/writer/cif';
import { StructureElement } from '../../structure';
import { CifExportContext } from '../mmcif';
import CifField = CifWriter.Field;
import CifCategory = CifWriter.Category;
export declare const _atom_site: CifCategory<CifExportContext>;
export interface IdFieldsOptions {
    prefix?: string;
    includeModelNum?: boolean;
}
export declare function residueIdFields<K, D>(getLocation: (key: K, data: D) => StructureElement.Location, options?: IdFieldsOptions): CifField<K, D>[];
export declare function chainIdFields<K, D>(getLocation: (key: K, data: D) => StructureElement.Location, options?: IdFieldsOptions): CifField<K, D>[];
export declare function entityIdFields<K, D>(getLocation: (key: K, data: D) => StructureElement.Location, options?: IdFieldsOptions): CifField<K, D>[];
export declare function atomIdFields<K, D>(getLocation: (key: K, data: D) => StructureElement.Location, options?: IdFieldsOptions): CifField<K, D>[];
