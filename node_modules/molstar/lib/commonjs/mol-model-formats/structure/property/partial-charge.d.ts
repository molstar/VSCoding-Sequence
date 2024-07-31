/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Column } from '../../../mol-data/db';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
import { FormatPropertyProvider } from '../common/property';
export { AtomPartialCharge };
interface AtomPartialCharge {
    data: Column<number>;
    type?: string;
}
declare namespace AtomPartialCharge {
    const Descriptor: CustomPropertyDescriptor;
    const Provider: FormatPropertyProvider<AtomPartialCharge>;
}
