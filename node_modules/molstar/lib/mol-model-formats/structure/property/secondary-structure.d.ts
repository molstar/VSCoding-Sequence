/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { mmCIF_Schema } from '../../../mol-io/reader/cif/schema/mmcif';
import { AtomicHierarchy } from '../../../mol-model/structure/model/properties/atomic';
import { SecondaryStructure } from '../../../mol-model/structure/model/properties/secondary-structure';
import { Table } from '../../../mol-data/db';
import { FormatPropertyProvider } from '../common/property';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
export { ModelSecondaryStructure };
type StructConf = Table<mmCIF_Schema['struct_conf']>;
type StructSheetRange = Table<mmCIF_Schema['struct_sheet_range']>;
declare namespace ModelSecondaryStructure {
    const Descriptor: CustomPropertyDescriptor;
    const Provider: FormatPropertyProvider<SecondaryStructure>;
    function fromStruct(conf: StructConf, sheetRange: StructSheetRange, hierarchy: AtomicHierarchy): SecondaryStructure;
}
