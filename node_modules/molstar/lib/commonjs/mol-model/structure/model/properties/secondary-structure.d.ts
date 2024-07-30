/**
 * Copyright (c) 2017-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SecondaryStructureType } from '../types';
import { ResidueIndex } from '../indexing';
import { mmCIF_Schema } from '../../../../mol-io/reader/cif/schema/mmcif';
/** Secondary structure "indexed" by residues. */
interface SecondaryStructure {
    readonly type: ArrayLike<SecondaryStructureType>;
    /** index into the elements array */
    readonly key: ArrayLike<number>;
    /** indexed by key */
    readonly elements: ReadonlyArray<SecondaryStructure.Element>;
    /** mapping from residue index */
    readonly getIndex: (rI: ResidueIndex) => number;
}
declare function SecondaryStructure(type: SecondaryStructure['type'], key: SecondaryStructure['key'], elements: SecondaryStructure['elements'], getIndex: SecondaryStructure['getIndex']): {
    type: ArrayLike<SecondaryStructureType>;
    key: ArrayLike<number>;
    elements: readonly SecondaryStructure.Element[];
    getIndex: (rI: ResidueIndex) => number;
};
declare namespace SecondaryStructure {
    type Element = None | Turn | Helix | Sheet;
    interface None {
        kind: 'none';
    }
    interface Turn {
        kind: 'turn';
        flags: SecondaryStructureType;
    }
    interface Helix {
        kind: 'helix';
        flags: SecondaryStructureType;
        type_id: mmCIF_Schema['struct_conf']['conf_type_id']['T'];
        helix_class: string;
        details?: string;
    }
    interface Sheet {
        kind: 'sheet';
        flags: SecondaryStructureType;
        sheet_id: string;
        symmetry?: string;
    }
}
export { SecondaryStructure };
