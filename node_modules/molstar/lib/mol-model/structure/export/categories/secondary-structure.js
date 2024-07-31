/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Segmentation } from '../../../../mol-data/int';
import { CifWriter } from '../../../../mol-io/writer/cif';
import { StructureElement, Unit } from '../../structure';
var CifField = CifWriter.Field;
import { residueIdFields } from './atom_site';
import { ModelSecondaryStructure } from '../../../../mol-model-formats/structure/property/secondary-structure';
export const _struct_conf = {
    name: 'struct_conf',
    instance(ctx) {
        const elements = findElements(ctx, 'helix');
        return {
            fields: struct_conf_fields(),
            source: [{ data: elements, rowCount: elements.length }]
        };
    }
};
export const _struct_sheet_range = {
    name: 'struct_sheet_range',
    instance(ctx) {
        const elements = findElements(ctx, 'sheet').sort(compare_ssr);
        return {
            fields: struct_sheet_range_fields(),
            source: [{ data: elements, rowCount: elements.length }]
        };
    }
};
function compare_ssr(x, y) {
    const a = x.element, b = y.element;
    return a.sheet_id < b.sheet_id ? -1 : a.sheet_id === b.sheet_id ? x.start.element - y.start.element : 1;
}
;
const struct_conf_fields = () => [
    CifField.str('conf_type_id', (i, data) => data[i].element.type_id),
    CifField.str('id', (i, data, idx) => `${data[i].element.type_id}${idx + 1}`),
    ...residueIdFields((i, e) => e[i].start, { prefix: 'beg' }),
    ...residueIdFields((i, e) => e[i].end, { prefix: 'end' }),
    CifField.str('pdbx_PDB_helix_class', (i, data) => data[i].element.helix_class),
    CifField.str('details', (i, data) => data[i].element.details || '', {
        valueKind: (i, d) => !!d[i].element.details ? 0 /* Column.ValueKinds.Present */ : 2 /* Column.ValueKinds.Unknown */
    }),
    CifField.int('pdbx_PDB_helix_length', (i, data) => data[i].length)
];
const struct_sheet_range_fields = () => [
    CifField.str('sheet_id', (i, data) => data[i].element.sheet_id),
    CifField.index('id'),
    ...residueIdFields((i, e) => e[i].start, { prefix: 'beg' }),
    ...residueIdFields((i, e) => e[i].end, { prefix: 'end' }),
    CifField.str('symmetry', (i, data) => '', { valueKind: (i, d) => 2 /* Column.ValueKinds.Unknown */ })
];
function findElements(ctx, kind) {
    // TODO: encode secondary structure for different models?
    const secondaryStructure = ModelSecondaryStructure.Provider.get(ctx.firstModel);
    if (!secondaryStructure)
        return [];
    const { key, elements } = secondaryStructure;
    const ssElements = [];
    const structure = ctx.structures[0];
    for (const { units } of structure.unitSymmetryGroups) {
        const u = units[0];
        if (!Unit.isAtomic(u))
            continue;
        const segs = u.model.atomicHierarchy.residueAtomSegments;
        const residues = Segmentation.transientSegments(segs, u.elements);
        let current, move = true;
        while (residues.hasNext) {
            if (move)
                current = residues.move();
            const start = current.index;
            const startIdx = key[start];
            const element = elements[startIdx];
            if (element.kind !== kind) {
                move = true;
                continue;
            }
            let prev = start;
            while (residues.hasNext) {
                prev = current.index;
                current = residues.move();
                if (startIdx !== key[current.index]) {
                    move = false;
                    ssElements[ssElements.length] = {
                        start: StructureElement.Location.create(structure, u, segs.offsets[start]),
                        end: StructureElement.Location.create(structure, u, segs.offsets[prev]),
                        length: prev - start + 1,
                        element
                    };
                    break;
                }
            }
        }
    }
    return ssElements;
}
