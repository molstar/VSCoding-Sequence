/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Table, Column } from '../../../mol-data/db';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
import { FormatPropertyProvider } from '../common/property';
export { AtomSiteAnisotrop };
declare const Anisotrop: {
    U: Column.Schema.Tensor;
    U_esd: Column.Schema.Tensor;
};
type Anisotrop = Table<typeof Anisotrop>;
interface AtomSiteAnisotrop {
    data: Anisotrop;
    /** maps atom_site-index to atom_site_anisotrop-index */
    elementToAnsiotrop: Int32Array;
}
declare namespace AtomSiteAnisotrop {
    const Schema: {
        U: Column.Schema.Tensor;
        U_esd: Column.Schema.Tensor;
    };
    const Descriptor: CustomPropertyDescriptor;
    const Provider: FormatPropertyProvider<AtomSiteAnisotrop>;
    function getElementToAnsiotrop(atomId: Column<number>, ansioId: Column<number>): Int32Array;
    function getElementToAnsiotropFromLabel(atomLabel: Column<string>, ansioLabel: Column<string>): Int32Array;
}
