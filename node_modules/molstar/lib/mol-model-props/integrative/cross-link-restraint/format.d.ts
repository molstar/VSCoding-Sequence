/**
 * Copyright (c) 2018-2020 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Model } from '../../../mol-model/structure/model/model';
import { Table } from '../../../mol-data/db';
import { mmCIF_Schema } from '../../../mol-io/reader/cif/schema/mmcif';
import { Unit } from '../../../mol-model/structure';
import { ElementIndex } from '../../../mol-model/structure/model/indexing';
import { FormatPropertyProvider } from '../../../mol-model-formats/structure/common/property';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
export { ModelCrossLinkRestraint };
interface ModelCrossLinkRestraint {
    getIndicesByElement: (element: ElementIndex, kind: Unit.Kind) => number[];
    data: Table<mmCIF_Schema['ihm_cross_link_restraint']>;
}
declare namespace ModelCrossLinkRestraint {
    const Descriptor: CustomPropertyDescriptor;
    const Provider: FormatPropertyProvider<ModelCrossLinkRestraint>;
    function fromTable(table: Table<mmCIF_Schema['ihm_cross_link_restraint']>, model: Model): ModelCrossLinkRestraint;
}
